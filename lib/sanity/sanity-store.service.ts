"use server";

import { revalidatePath } from "next/cache";
import { sanityFetch, sanityClient, urlFor } from "./client";
import { getEffectiveRestaurantIdFromCookies } from "./storeResolver";

export interface SanityRestaurantDetails {
  _id: string;
  name: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  storeStatus: "Open" | "Closed" | "Holiday";
  deliveryRadius?: number;
  operatingHours?: string;
  notificationsEnabled?: boolean;
  acceptDelivery?: boolean;
}

export interface SanityMenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  image?: string;
  categoryTitle?: string;
  category?: string;
  preparationTime?: string;
  isPopular?: boolean;
  restaurantId?: string;
}

export interface SanityOrder {
  _id: string;
  customerName: string;
  customerPhone?: string;
  addressLine?: string;
  deliveryAddress?: string;
  city?: string;
  pincode?: string;
  status: string;
  subtotal: number;
  total: number;
  placedAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  restaurantId?: string;
  items?: Array<{
    food_item_id: string;
    food_name: string;
    price: number;
    quantity: number;
  }>;
}

export interface SanityCategory {
  _id: string;
  name: string;
  displayOrder?: number;
  imageUrl?: string;
}

export interface SanityDashboardSettings {
  _id?: string;
  notificationSound?: string;
  notificationEnabled?: boolean;
  onlineStatus?: boolean;
  theme?: string;
  currency?: string;
  taxPercentage?: number;
}

/** Fetch All Published & Active Restaurants from Sanity CMS production dataset for Customer App */
export async function getAllSanityRestaurants(): Promise<any[]> {
  const query = `*[_type == "restaurant" && (status == "active" || status == "open" || status == "Open" || !defined(status))] | order(name asc) {
    _id,
    "id": _id,
    name,
    "slug": slug.current,
    ownerName,
    ownerEmail,
    "phone": select(defined(contactNumber) => contactNumber, phone),
    address,
    "address_line": address,
    "city": select(defined(city) => city, "Local Area"),
    "status": select(
      storeStatus == "Open" => "open",
      storeStatus == "Closed" => "closed",
      status == "active" => "open",
      status == "open" => "open",
      "open"
    ),
    "approval_status": "approved",
    "logo_url": logo.asset->url,
    "banner_url": select(
      defined(banner.asset->url) => banner.asset->url,
      defined(logo.asset->url) => logo.asset->url,
      null
    ),
    description
  }`;

  const restaurants = await sanityFetch<any[]>({
    query,
    fallback: [],
  });

  return restaurants;
}

/** 1. Fetch Restaurant Details from Sanity CMS */
export async function getSanityRestaurantDetails(targetRestaurantId?: string): Promise<SanityRestaurantDetails | null> {
  const restaurantId = targetRestaurantId || await getEffectiveRestaurantIdFromCookies();
  let query = `*[_type == "restaurant"][0]`;
  const params: Record<string, any> = {};

  if (restaurantId) {
    query = `*[_type == "restaurant" && (_id == $restaurantId || slug.current == $restaurantId)][0]`;
    params.restaurantId = restaurantId;
  }

  const res = await sanityFetch<any>({
    query: `${query} {
      _id,
      name,
      ownerName,
      email,
      phone,
      address,
      description,
      storeStatus,
      deliveryRadius,
      operatingHours,
      notificationsEnabled,
      acceptDelivery
    }`,
    params,
    fallback: null,
  });

  return res;
}

/** Update Restaurant Profile in Sanity CMS */
export async function updateSanityRestaurantProfileAction(data: Partial<SanityRestaurantDetails>, targetRestaurantId?: string) {
  try {
    const restaurantId = targetRestaurantId || await getEffectiveRestaurantIdFromCookies();
    const restaurant = await getSanityRestaurantDetails(restaurantId || undefined);

    if (restaurant?._id) {
      await sanityClient.patch(restaurant._id).set(data).commit();
    } else {
      await sanityClient.create({
        _type: "restaurant",
        name: data.name || "T-Bites Restaurant",
        storeStatus: "Open",
        ...data,
      });
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Sanity restaurant update error:", error);
    return { success: false, message: error.message };
  }
}

/** 2. Fetch Menu Items from Sanity CMS production dataset referencing specific restaurant */
export async function getSanityMenuItems(targetRestaurantId?: string): Promise<SanityMenuItem[]> {
  const restaurantId = targetRestaurantId || await getEffectiveRestaurantIdFromCookies();
  
  let query = `*[_type == "menuItem"] | order(_createdAt desc)`;
  const params: Record<string, any> = {};

  if (restaurantId) {
    query = `*[_type == "menuItem" && (restaurant._ref == $restaurantId || !defined(restaurant))] | order(_createdAt desc)`;
    params.restaurantId = restaurantId;
  }

  const items = await sanityFetch<SanityMenuItem[]>({
    query: `${query} {
      _id,
      name,
      price,
      description,
      isVeg,
      isAvailable,
      "imageUrl": image.asset->url,
      "categoryTitle": category->name,
      preparationTime,
      isPopular,
      "restaurantId": restaurant._ref
    }`,
    params,
    fallback: [],
  });

  // Deduplicate draft and published versions
  const map = new Map<string, SanityMenuItem>();
  for (const item of items) {
    const cleanId = item._id.replace("drafts.", "");
    const existing = map.get(cleanId);
    if (!existing || item._id.startsWith("drafts.")) {
      map.set(cleanId, { ...item, _id: cleanId });
    }
  }

  return Array.from(map.values());
}

/** Add Menu Item to Sanity CMS production dataset referencing restaurant */
export async function addSanityMenuItemAction(formData: FormData, targetRestaurantId?: string) {
  try {
    const restaurantId = targetRestaurantId || await getEffectiveRestaurantIdFromCookies();

    const name = (formData.get("name") as string || "").trim();
    const price = parseFloat(formData.get("price") as string) || 0;
    const description = (formData.get("description") as string || "").trim();
    const isVeg = formData.get("isVeg") === "true";
    const imageFile = formData.get("image") as File | null;

    if (!name || price <= 0) {
      return { success: false, message: "Please enter a valid item name and price" };
    }

    let imageAssetRef: any = null;
    if (imageFile && imageFile.size > 0) {
      const asset = await sanityClient.assets.upload("image", imageFile, {
        filename: imageFile.name,
      });
      imageAssetRef = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      };
    }

    const docData: any = {
      _type: "menuItem",
      name,
      price,
      description,
      isVeg,
      isAvailable: true,
      isPopular: false,
      preparationTime: "15 mins",
      ...(restaurantId ? { restaurant: { _type: "reference", _ref: restaurantId } } : {}),
    };

    if (imageAssetRef) {
      docData.image = imageAssetRef;
    }

    const created = await sanityClient.create(docData);
    const imageUrl = imageAssetRef ? urlFor(imageAssetRef) : "";

    revalidatePath("/dashboard/menu");
    revalidatePath("/");
    revalidatePath("/restaurants");
    revalidatePath("/search");
    return { success: true, item: { ...created, imageUrl } };
  } catch (error: any) {
    console.error("Sanity add item error:", error);
    return { success: false, message: error.message };
  }
}

/** Update Menu Item in Sanity CMS */
export async function updateSanityMenuItemAction(id: string, formData: FormData) {
  try {
    const name = (formData.get("name") as string || "").trim();
    const price = parseFloat(formData.get("price") as string) || 0;
    const description = (formData.get("description") as string || "").trim();
    const isVeg = formData.get("isVeg") === "true";
    const imageFile = formData.get("image") as File | null;

    const patchData: any = {
      name,
      price,
      description,
      isVeg,
    };

    if (imageFile && imageFile.size > 0) {
      const asset = await sanityClient.assets.upload("image", imageFile, {
        filename: imageFile.name,
      });
      patchData.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      };
    }

    if (!id.startsWith("demo-") && !id.startsWith("sanity-item-")) {
      await sanityClient.patch(id).set(patchData).commit();
    } else {
      const docData: any = {
        _type: "menuItem",
        name,
        price,
        description,
        isVeg,
        isAvailable: true,
        isPopular: false,
        preparationTime: "15 mins",
      };
      if (patchData.image) docData.image = patchData.image;
      await sanityClient.create(docData);
    }

    revalidatePath("/dashboard/menu");
    revalidatePath("/");
    revalidatePath("/restaurants");
    return { success: true };
  } catch (error: any) {
    console.error("Sanity update item error:", error);
    return { success: false, message: error.message };
  }
}

/** Toggle Menu Item Availability in Sanity CMS */
export async function toggleSanityMenuItemAction(id: string, isAvailable: boolean) {
  try {
    const cleanId = id.replace("drafts.", "");
    await Promise.allSettled([
      sanityClient.patch(cleanId).set({ isAvailable }).commit(),
      sanityClient.patch(`drafts.${cleanId}`).set({ isAvailable }).commit(),
    ]);
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error: any) {
    console.warn("Sanity toggle notice:", error?.message);
    return { success: true };
  }
}

/** Delete Menu Item from Sanity CMS */
export async function deleteSanityMenuItemAction(id: string) {
  try {
    const cleanId = id.replace("drafts.", "");
    await Promise.allSettled([
      sanityClient.delete(cleanId),
      sanityClient.delete(`drafts.${cleanId}`),
    ]);
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error: any) {
    console.warn("Sanity delete notice:", error?.message);
    return { success: true };
  }
}

/** 3. Fetch Kitchen Orders from Sanity CMS production dataset referencing restaurant */
export async function getSanityOrders(targetRestaurantId?: string): Promise<SanityOrder[]> {
  const restaurantId = targetRestaurantId || await getEffectiveRestaurantIdFromCookies();

  let query = `*[_type == "order"] | order(orderTime desc)`;
  const params: Record<string, any> = {};

  if (restaurantId) {
    query = `*[_type == "order" && (restaurant._ref == $restaurantId || !defined(restaurant))] | order(orderTime desc)`;
    params.restaurantId = restaurantId;
  }

  return await sanityFetch<SanityOrder[]>({
    query: `${query} {
      _id,
      "orderId": orderId,
      customerName,
      customerPhone,
      deliveryAddress,
      "status": orderStatus,
      "subtotal": totalAmount,
      "total": totalAmount,
      "placedAt": orderTime,
      paymentMethod,
      paymentStatus,
      "restaurantId": restaurant._ref,
      "items": orderedItems[] {
        "food_item_id": menuItemRef->_id,
        "food_name": foodName,
        "price": unitPrice,
        quantity
      }
    }`,
    params,
    fallback: [],
  });
}

/** Create Order in Sanity CMS referencing restaurant */
export async function createSanityOrderAction(orderData: any, targetRestaurantId?: string) {
  try {
    const restaurantId = targetRestaurantId || orderData.restaurantId || await getEffectiveRestaurantIdFromCookies();

    const created = await sanityClient.create({
      _type: "order",
      orderId: orderData.orderId || `ORD-${Date.now().toString().slice(-4)}`,
      customerName: orderData.customerName || "Customer",
      customerPhone: orderData.customerPhone || "",
      deliveryAddress: orderData.addressLine || "Local Delivery",
      totalAmount: orderData.total || orderData.subtotal || 0,
      paymentMethod: orderData.paymentMethod || "Cash on Delivery",
      paymentStatus: "Paid",
      orderStatus: "Preparing",
      orderTime: new Date().toISOString(),
      ...(restaurantId ? { restaurant: { _type: "reference", _ref: restaurantId } } : {}),
      orderedItems: (orderData.items || []).map((i: any) => ({
        foodName: i.food_name || i.name || "Food Item",
        quantity: i.quantity || 1,
        unitPrice: i.price || 0,
      })),
    });

    revalidatePath("/dashboard/orders");
    return { success: true, order: created };
  } catch (error: any) {
    console.warn("Sanity order creation notice:", error?.message);
    return { success: true };
  }
}

/** Update Order Status in Sanity CMS */
export async function updateSanityOrderStatusAction(id: string, status: string) {
  try {
    if (id.startsWith("ORD-")) {
      return { success: true };
    }
    await sanityClient.patch(id).set({ orderStatus: status }).commit();
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error: any) {
    console.warn("Sanity order status update notice:", error?.message);
    return { success: true };
  }
}

/** 4. Fetch Categories from Sanity CMS production dataset */
export async function getSanityCategories(targetRestaurantId?: string): Promise<SanityCategory[]> {
  const restaurantId = targetRestaurantId || await getEffectiveRestaurantIdFromCookies();
  let query = `*[_type == "category"] | order(displayOrder asc)`;
  const params: Record<string, any> = {};

  if (restaurantId) {
    query = `*[_type == "category" && (!defined(restaurant) || restaurant._ref == $restaurantId)] | order(displayOrder asc)`;
    params.restaurantId = restaurantId;
  }

  return await sanityFetch<SanityCategory[]>({
    query: `${query} {
      _id,
      name,
      displayOrder,
      "imageUrl": image.asset->url
    }`,
    params,
    fallback: [
      { _id: "cat-1", name: "Starters", displayOrder: 1 },
      { _id: "cat-2", name: "Main Course", displayOrder: 2 },
      { _id: "cat-3", name: "Desserts", displayOrder: 3 },
      { _id: "cat-4", name: "Beverages", displayOrder: 4 },
      { _id: "cat-5", name: "Chef's Specials", displayOrder: 5 },
    ],
  });
}

/** 5. Fetch Dashboard Settings from Sanity CMS production dataset */
export async function getSanityDashboardSettings(targetRestaurantId?: string): Promise<SanityDashboardSettings> {
  const restaurantId = targetRestaurantId || await getEffectiveRestaurantIdFromCookies();
  let query = `*[_type == "dashboardSettings"][0]`;
  const params: Record<string, any> = {};

  if (restaurantId) {
    query = `*[_type == "dashboardSettings" && (!defined(restaurant) || restaurant._ref == $restaurantId)][0]`;
    params.restaurantId = restaurantId;
  }

  return await sanityFetch<SanityDashboardSettings>({
    query: `${query} {
      _id,
      notificationSound,
      notificationEnabled,
      onlineStatus,
      theme,
      currency,
      taxPercentage
    }`,
    params,
    fallback: {
      notificationSound: "Chime",
      notificationEnabled: true,
      onlineStatus: true,
      theme: "Light",
      currency: "INR (₹)",
      taxPercentage: 8.5,
    },
  });
}
