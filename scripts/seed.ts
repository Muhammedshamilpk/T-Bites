import bcrypt from "bcryptjs";
import { createClient } from "@sanity/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r1clvwwn";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!token) {
  console.error("❌ SANITY_API_WRITE_TOKEN environment variable is required to run seed script.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function runSeed() {
  console.log("🚀 Starting T-Bites Monorepo Seed Script...");

  // 1. Seed Super Admin Account
  const superAdminPasswordHash = await bcrypt.hash("SuperAdminSecret123!", 10);
  await client.createOrReplace({
    _id: "superadmin-account",
    _type: "restaurantOwner",
    email: "superadmin@tbites.com",
    passwordHash: superAdminPasswordHash,
    role: "superadmin",
    createdAt: new Date().toISOString(),
  });
  console.log("✅ Super Admin Account Seeded: superadmin@tbites.com / SuperAdminSecret123!");

  // 2. Seed Restaurant 1: Burger Crown
  const burgerCrownDoc = await client.createOrReplace({
    _id: "restaurant-burger-crown",
    _type: "restaurant",
    name: "Burger Crown",
    slug: { _type: "slug", current: "burger-crown" },
    address: "12 MG Road, Indiranagar, Bengaluru",
    contactNumber: "+91 98765 11111",
    ownerEmail: "owner@burgercrown.com",
    status: "active",
    createdAt: new Date().toISOString(),
  });

  const burgerCrownOwnerPassword = await bcrypt.hash("BurgerCrown123!", 10);
  await client.createOrReplace({
    _id: "owner-burger-crown",
    _type: "restaurantOwner",
    email: "owner@burgercrown.com",
    passwordHash: burgerCrownOwnerPassword,
    restaurant: { _type: "reference", _ref: burgerCrownDoc._id },
    role: "restaurant_owner",
    createdAt: new Date().toISOString(),
  });
  console.log("✅ Restaurant 1 Seeded: Burger Crown (owner@burgercrown.com / BurgerCrown123!)");

  // Seed Burger Crown Food Items
  const food1 = await client.create({
    _type: "foodItem",
    restaurant: { _type: "reference", _ref: burgerCrownDoc._id },
    name: "Classic Cheeseburger",
    description: "Flame-grilled beef patty, cheddar cheese, crisp lettuce, secret sauce",
    price: 249,
    category: "Main Course",
    available: true,
  });

  const food2 = await client.create({
    _type: "foodItem",
    restaurant: { _type: "reference", _ref: burgerCrownDoc._id },
    name: "Loaded Peri Peri Fries",
    description: "Crispy golden fries tossed in spicy peri peri seasoning with cheese dip",
    price: 149,
    category: "Starters",
    available: true,
  });

  // Seed Burger Crown Orders
  await client.create({
    _type: "order",
    restaurant: { _type: "reference", _ref: burgerCrownDoc._id },
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    customerName: "Rahul Sharma",
    customerPhone: "+91 98765 00001",
    deliveryAddress: "Flat 402, Sunshine Apartments, Bengaluru",
    items: [
      { foodItem: { _type: "reference", _ref: food1._id }, foodName: "Classic Cheeseburger", quantity: 2, priceAtOrder: 249 },
      { foodItem: { _type: "reference", _ref: food2._id }, foodName: "Loaded Peri Peri Fries", quantity: 1, priceAtOrder: 149 },
    ],
    totalAmount: 647,
    status: "preparing",
    createdAt: new Date().toISOString(),
  });

  // 3. Seed Restaurant 2: CocoBerries
  const cocoBerriesDoc = await client.createOrReplace({
    _id: "restaurant-cocoberries",
    _type: "restaurant",
    name: "CocoBerries Desserts",
    slug: { _type: "slug", current: "cocoberries" },
    address: "45 Koramangala 5th Block, Bengaluru",
    contactNumber: "+91 98765 22222",
    ownerEmail: "owner@cocoberries.com",
    status: "active",
    createdAt: new Date().toISOString(),
  });

  const cocoBerriesOwnerPassword = await bcrypt.hash("CocoBerries123!", 10);
  await client.createOrReplace({
    _id: "owner-cocoberries",
    _type: "restaurantOwner",
    email: "owner@cocoberries.com",
    passwordHash: cocoBerriesOwnerPassword,
    restaurant: { _type: "reference", _ref: cocoBerriesDoc._id },
    role: "restaurant_owner",
    createdAt: new Date().toISOString(),
  });
  console.log("✅ Restaurant 2 Seeded: CocoBerries (owner@cocoberries.com / CocoBerries123!)");

  // Seed CocoBerries Food Items
  await client.create({
    _type: "foodItem",
    restaurant: { _type: "reference", _ref: cocoBerriesDoc._id },
    name: "Belgian Chocolate Waffle",
    description: "Warm crispy waffle smothered in molten Belgian dark chocolate",
    price: 199,
    category: "Desserts",
    available: true,
  });

  console.log("🎉 Monorepo Seeding Completed Successfully!");
}

runSeed().catch((err) => {
  console.error("❌ Seed Script Error:", err);
  process.exit(1);
});
