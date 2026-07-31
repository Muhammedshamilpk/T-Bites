# 🍕 T-Bites — Multi-Tenant Food Delivery Management Platform

T-Bites is a production-ready, multi-tenant SaaS food delivery and restaurant management platform built with **Next.js 16 (App Router)**, **Sanity CMS**, **Supabase Auth**, **Tailwind CSS**, and **Turborepo**.

It provides a single unified codebase supporting unlimited restaurant partners (Swiggy Partner / Zomato Partner style), where every restaurant owner accesses an independent dashboard isolated strictly by their unique **`Restaurant ID`**.

---

## 🏛️ System Architecture

```
                  ┌─────────────────────────────────┐
                  │        Customer Website         │
                  │  (Browse, Search, Order, Track) │
                  └────────────────┬────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     Burger Crown Dashboard  CocoBerries Dashboard  Farsa Bistro Dashboard
     (Orders, Menu, Stats)   (Orders, Menu, Stats)  (Orders, Menu, Stats)
```

### Monorepo Structure

```
t-bites/
├── apps/
│   ├── super-admin/          # App 1: Platform Super Admin Portal (Port 3000)
│   └── restaurant-dashboard/ # App 2: Multi-Tenant Restaurant Owner Dashboard (Port 3001)
├── packages/
│   ├── sanity/                # Shared Sanity schemas, client, and scoped GROQ queries
│   └── ui/                    # Shared UI component primitives (Button, Card, Badge)
├── scripts/
│   └── seed.ts                # Database seed script for Super Admin & Sample Partners
├── turbo.json                 # Turborepo task pipeline
└── package.json               # Monorepo workspace configuration
```

---

## ✨ Features & Capabilities

### 👑 **App 1: Super Admin Portal (`apps/super-admin`)**
- **Partner Onboarding:** Add new restaurant partners with auto-generated temporary credentials.
- **Security & Access Control:** Suspend or reactivate restaurant partner accounts (`active` <-> `suspended`).
- **Platform Analytics:** Real-time visibility into active store counts, total platform order volume, and store statuses.

### 🏪 **App 2: Restaurant Owner Dashboard (`apps/restaurant-dashboard`)**
- **Multi-Tenant Isolation:** All data queries (`getScopedOrders`, `getScopedFoodItems`, `getScopedSettings`) filter strictly by `restaurant._ref == $restaurantId`.
- **Live Orders Pipeline:** Real-time kitchen status transitions (`pending` → `preparing` → `out_for_delivery` → `delivered` → `cancelled`).
- **Menu Management:** Add/Edit/Delete food items with direct Sanity Asset Lake photo uploads, pricing, category tags, and availability toggles.
- **Operational Settings:** Configure opening/closing business hours, delivery radius (km), minimum order amounts, and online status.

### 🎨 **Sanity Studio Integration (`/studio`)**
- Embedded 2-way real-time CMS studio for document visual management.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **CMS & Data Lake:** Sanity.io (Single Project `r1clvwwn`, Dataset `production`)
- **Authentication:** Supabase Auth & Bcryptjs Hashing
- **Monorepo Engine:** Turborepo
- **Styling:** Tailwind CSS + Lucide Icons

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 10.x

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Sanity CMS Storage
NEXT_PUBLIC_SANITY_PROJECT_ID=r1clvwwn
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_READ_TOKEN=your_read_token
SANITY_API_WRITE_TOKEN=your_write_token

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install Dependencies & Seed Database
```bash
# Install workspace packages
npm install --legacy-peer-deps

# Seed Super Admin and Sample Restaurant Partners
npm run seed
```

### 4. Start Development Servers
```bash
npm run dev
```

---

## 🔑 Default Test Credentials

| Portal | Port | Email | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `3000` | `superadmin@tbites.com` | `SuperAdminSecret123!` |
| **Burger Crown Owner** | `3001` | `owner@burgercrown.com` | `BurgerCrown123!` |
| **CocoBerries Owner** | `3001` | `owner@cocoberries.com` | `CocoBerries123!` |

---

## 📜 License

MIT License © 2026 T-Bites Platform
