# Main Admin Role Guide — T-Bites Platform

The **Main Admin Role** (`role: 'admin'`) grants full platform executive control. The administrator monitors system metrics, reviews and approves new restaurant applications, moderates user accounts, and manages platform-wide settings.

---

## 🔑 Key Features & Responsibilities

### 1. Executive Control Dashboard
- **URL Route:** `/admin`
- **Capabilities:**
  - View platform gross revenue metrics (non-cancelled orders total).
  - View active vs. pending restaurant statistics.
  - View today's total order volume and overall platform order count.
  - View total registered users split by Customer vs. Restaurant Owner demographics.
  - Review pending registration alert banners with single-click navigation.
  - View live feeds of recent restaurant applications and recent platform transactions.

### 2. Restaurant Approvals & Moderation
- **URL Route:** `/admin/restaurants`
- **Capabilities:**
  - View complete roster of all registered restaurants filterable by status (`All`, `Pending`, `Approved`, `Suspended`).
  - **Approve:** Activate pending restaurants so they can publish menus and receive orders.
  - **Reject:** Decline invalid or duplicate restaurant registration applications.
  - **Suspend:** Temporarily disable active restaurants violating platform standards.
  - **Reactivate:** Restore suspended restaurants back to active status.

### 3. User Account Moderation
- **URL Route:** `/admin/users`
- **Capabilities:**
  - View master list of all registered platform profiles.
  - View role badges (`Customer`, `Restaurant Owner`, `Admin`), phone numbers, and join dates.
  - **Deactivate / Reactivate Users:** Instant toggle controls with server action execution and toast notifications.

### 4. System Settings
- **URL Route:** `/admin/settings`
- **Capabilities:**
  - Platform fee configuration, commission rates, and global maintenance toggles.

---

## 🔒 Security & Route Permissions

| Route | Permission | Behavior |
| :--- | :--- | :--- |
| `/admin` | Main Admin Only | Strict RLS & middleware check (`role === 'admin'`). |
| `/admin/restaurants` | Main Admin Only | Full CRUD & approval authorization. |
| `/admin/users` | Main Admin Only | Full profile status authorization. |
| `/dashboard` | Restricted | Admin redirected to `/admin` upon login. |

---

## 🗄️ Database Tables Used by Main Admin Role
- `profiles` (Full read & active status update)
- `restaurants` (Full approval status update)
- `orders` (Global read & analytics)
- `audit_logs` (System activity logging)
- `settings` (Platform configuration)
