import { sanityFetch } from "@/lib/sanity/client";
import { Store, ShoppingBag, User, Phone, MapPin, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export const revalidate = 0; // Disable static cache for live admin orders monitoring

export default async function AdminOrdersPage() {
  const orders = await sanityFetch<any[]>({
    query: `*[_type == "order"] {
      _id,
      "orderNumber": select(defined(orderId) => orderId, _id),
      customerName,
      customerPhone,
      deliveryAddress,
      totalAmount,
      "status": select(defined(orderStatus) => orderStatus, status),
      "createdAt": select(defined(orderTime) => orderTime, _createdAt),
      "items": select(defined(orderedItems) => orderedItems, items),
      "restaurantName": restaurant->name,
      "restaurantAddress": restaurant->address
    } | order(createdAt desc)`,
    fallback: [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">All Platform Food Orders</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Super Admin Live Directory of all customer orders across all partner restaurants ({orders?.length ?? 0} total orders).
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-background">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-foreground-muted font-bold text-sm">No food orders placed yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-background shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs font-black text-foreground-muted uppercase tracking-wider">
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Hotel / Restaurant</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Ordered Items</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
              {orders.map((ord: any) => (
                <tr key={ord._id} className="hover:bg-surface/50 transition-colors">
                  {/* Order ID & Date */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-foreground text-sm flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        {ord.orderNumber || ord._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-foreground-muted flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : "Recently"}
                      </span>
                    </div>
                  </td>

                  {/* Hotel / Restaurant Name */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-orange-600 flex items-center gap-1.5 text-sm">
                        <Store className="w-4 h-4 text-orange-500" />
                        {ord.restaurantName || "T-Bites Partner Kitchen"}
                      </span>
                      {ord.restaurantAddress && (
                        <span className="text-[10px] text-foreground-muted truncate max-w-xs">
                          {ord.restaurantAddress}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Customer Details */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {ord.customerName || "Customer"}
                      </span>
                      {ord.customerPhone && (
                        <span className="text-foreground-muted flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3" />
                          {ord.customerPhone}
                        </span>
                      )}
                      {ord.deliveryAddress && (
                        <span className="text-foreground-muted flex items-center gap-1 text-[10px] truncate max-w-xs">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {ord.deliveryAddress}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Ordered Items */}
                  <td className="px-6 py-4 max-w-xs">
                    {Array.isArray(ord.items) && ord.items.length > 0 ? (
                      <div className="space-y-1">
                        {ord.items.map((item: any, i: number) => (
                          <div key={i} className="text-foreground font-medium text-[11px] flex justify-between gap-2">
                            <span className="truncate">• {item.foodName || item.food_name || item.name}</span>
                            <span className="font-bold shrink-0">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-foreground-muted italic">Standard Food Order</span>
                    )}
                  </td>

                  {/* Total Amount */}
                  <td className="px-6 py-4 font-black text-emerald-600 text-sm">
                    ₹{Number(ord.totalAmount || 0).toLocaleString("en-IN")}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${
                      ord.status === "cancelled" || ord.status === "rejected" || ord.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : ord.status === "delivered" || ord.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-orange-100 text-orange-800 animate-pulse"
                    }`}>
                      {ord.status === "cancelled" ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {ord.status || "Preparing"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
