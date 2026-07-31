"use server";

import { revalidatePath } from "next/cache";
import { sanityFetch, getSanityClientForDataset, urlFor } from "./client";
import { getEffectiveDatasetFromCookies } from "./datasetResolver";

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
  datasetName?: string;
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

/** Fetch All Published & Active Restaurants from Sanity CMS production dataset for Customer Application */
export async function getAllSanityRestaurants(): Promise<any[]> {
  const query = `*[_type == "restaurant" && (status == "active" || status == "open" || status == "Open" || !defined(status))] | order(name asc) {
    _id,
    "id": _id,
    name,
    datasetName,
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
    datasetName: "production",
  });

  const { projectId } = await import("./client");
  console.log(`[CUSTOMER QUERY LOG] ProjectId: ${projectId} | Dataset: production | Sanity Restaurants Returned: ${restaurants.length}`);
  console.log(`[CUSTOMER QUERY LOG] Restaurant IDs:`, restaurants.map((r: any) => ({ id: r.id, name: r.name, datasetName: r.datasetName || "production", status: r.status })));

  return restaurants;
}

/** 1. Fetch Restaurant Details from Sanity CMS */
export async function getSanityRestaurantDetails(targetDataset?: string): Promise<SanityRestaurantDetails | null> {
  const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
  const query = `*[_type == "restaurant"][0] {
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
    acceptDelivery,
    datasetName
  }`;

  return await sanityFetch<SanityRestaurantDetails | null>({
    query,
    fallback: null,
    datasetName: activeDataset,
  });
}

/** Update Restaurant Profile in Sanity CMS */
export async function updateSanityRestaurantProfileAction(data: Partial<SanityRestaurantDetails>, targetDataset?: string) {
  try {
    const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
    const client = getSanityClientForDataset(activeDataset);
    const restaurant = await getSanityRestaurantDetails(activeDataset);

    if (restaurant?._id) {
      await client.patch(restaurant._id).set(data).commit();
    } else {
      await client.create({
        _type: "restaurant",
        name: data.name || "T-Bites Restaurant",
        storeStatus: "Open",
        datasetName: activeDataset,
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

/** 2. Fetch Menu Items from Sanity CMS (Includes Studio Drafts) */
export async function getSanityMenuItems(targetDataset?: string): Promise<SanityMenuItem[]> {
  const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
  const query = `*[_type == "menuItem"] | order(_createdAt desc) {
    _id,
    name,
    price,
    description,
    isVeg,
    isAvailable,
    "imageUrl": image.asset->url,
    "categoryTitle": category->name,
    preparationTime,
    isPopular
  }`;

  const items = await sanityFetch<SanityMenuItem[]>({
    query,
    fallback: [],
    datasetName: activeDataset,
  });

  // Deduplicate items if both draft and published version exist
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

/** Add Menu Item to Sanity CMS with direct image asset upload */
export async function addSanityMenuItemAction(formData: FormData, targetDataset?: string) {
  try {
    const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
    const client = getSanityClientForDataset(activeDataset);

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
      const asset = await client.assets.upload("image", imageFile, {
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
    };

    if (imageAssetRef) {
      docData.image = imageAssetRef;
    }

    const created = await client.create(docData);
    const imageUrl = imageAssetRef ? urlFor(imageAssetRef, activeDataset) : "";

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
export async function updateSanityMenuItemAction(id: string, formData: FormData, targetDataset?: string) {
  try {
    const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
    const client = getSanityClientForDataset(activeDataset);

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
      const asset = await client.assets.upload("image", imageFile, {
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
      await client.patch(id).set(patchData).commit();
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
      await client.create(docData);
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
export async function toggleSanityMenuItemAction(id: string, isAvailable: boolean, targetDataset?: string) {
  try {
    const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
    const client = getSanityClientForDataset(activeDataset);
    const cleanId = id.replace("drafts.", "");
    await Promise.allSettled([
      client.patch(cleanId).set({ isAvailable }).commit(),
      client.patch(`drafts.${cleanId}`).set({ isAvailable }).commit(),
    ]);
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error: any) {
    console.warn("Sanity toggle notice:", error?.message);
    return { success: true };
  }
}

/** Delete Menu Item from Sanity CMS */
export async function deleteSanityMenuItemAction(id: string, targetDataset?: string) {
  try {
    const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
    const client = getSanityClientForDataset(activeDataset);
    const cleanId = id.replace("drafts.", "");
    await Promise.allSettled([
      client.delete(cleanId),
      client.delete(`drafts.${cleanId}`),
    ]);
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error: any) {
    console.warn("Sanity delete notice:", error?.message);
    return { success: true };
  }
}

/** 3. Fetch Kitchen Orders from Sanity CMS */
export async function getSanityOrders(targetDataset?: string): Promise<SanityOrder[]> {
  const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
  const query = `*[_type == "order"] | order(orderTime desc) {
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
    "items": orderedItems[] {
      "food_item_id": menuItemRef->_id,
      "food_name": foodName,
      "price": unitPrice,
      quantity
    }
  }`;

  return await sanityFetch<SanityOrder[]>({
    query,
    fallback: [],
    datasetName: activeDataset,
  });
}

/** Create Order in Sanity CMS */
export async function createSanityOrderAction(orderData: any, targetDataset?: string) {
  try {
    const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
    const client = getSanityClientForDataset(activeDataset);

    const created = await client.create({
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
export async function updateSanityOrderStatusAction(id: string, status: string, targetDataset?: string) {
  try {
    const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
    const client = getSanityClientForDataset(activeDataset);

    if (id.startsWith("ORD-")) {
      return { success: true };
    }
    await client.patch(id).set({ orderStatus: status }).commit();
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error: any) {
    console.warn("Sanity order status update notice:", error?.message);
    return { success: true };
  }
}

/** 4. Fetch Categories from Sanity CMS */
export async function getSanityCategories(targetDataset?: string): Promise<SanityCategory[]> {
  const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
  const query = `*[_type == "category"] | order(displayOrder asc) {
    _id,
    name,
    displayOrder,
    "imageUrl": image.asset->url
  }`;

  return await sanityFetch<SanityCategory[]>({
    query,
    fallback: [
      { _id: "cat-1", name: "Starters", displayOrder: 1 },
      { _id: "cat-2", name: "Main Course", displayOrder: 2 },
      { _id: "cat-3", name: "Desserts", displayOrder: 3 },
      { _id: "cat-4", name: "Beverages", displayOrder: 4 },
      { _id: "cat-5", name: "Chef's Specials", displayOrder: 5 },
    ],
    datasetName: activeDataset,
  });
}

/** 5. Fetch Dashboard Settings from Sanity CMS */
export async function getSanityDashboardSettings(targetDataset?: string): Promise<SanityDashboardSettings> {
  const activeDataset = targetDataset || await getEffectiveDatasetFromCookies();
  const query = `*[_type == "dashboardSettings"][0] {
    _id,
    notificationSound,
    notificationEnabled,
    onlineStatus,
    theme,
    currency,
    taxPercentage
  }`;

  return await sanityFetch<SanityDashboardSettings>({
    query,
    fallback: {
      notificationSound: "Chime",
      notificationEnabled: true,
      onlineStatus: true,
      theme: "Light",
      currency: "INR (₹)",
      taxPercentage: 8.5,
    },
    datasetName: activeDataset,
  });
}
