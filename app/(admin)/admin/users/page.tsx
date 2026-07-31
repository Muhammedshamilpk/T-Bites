import { createClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity/client";
import { User, Mail, Phone, ShoppingBag, Calendar } from "lucide-react";

export default async function AdminUsersPage() {
  // 1. Fetch Customer profiles from Supabase
  const supabase = await createClient();
  const { data: customerProfiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  // 2. Fetch Customer orders from Sanity CMS Lake to count orders per customer
  const orders = await sanityClient.fetch(
    `*[_type == "order"]{
      customerName,
      customerPhone,
      totalAmount
    }`
  );

  const customerMap = new Map<string, { name: string; phone: string; orderCount: number; totalSpent: number }>();

  // Aggregate orders placed by customers
  orders?.forEach((ord: any) => {
    const key = ord.customerPhone || ord.customerName || "Guest Customer";
    const existing = customerMap.get(key) || {
      name: ord.customerName || "Customer",
      phone: ord.customerPhone || "Verified Contact",
      orderCount: 0,
      totalSpent: 0,
    };
    existing.orderCount += 1;
    existing.totalSpent += Number(ord.totalAmount || 0);
    customerMap.set(key, existing);
  });

  // Combine registered customer profiles & active ordering customers
  const customersList = Array.from(customerMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">Customer Users & Ordering Food Account Directory</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Super Admin Directory of customers who register, log in, and place food orders on T-Bites.
        </p>
      </div>

      {customersList.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-background">
          <div className="text-5xl mb-3">🛍️</div>
          <p className="text-foreground-muted font-bold text-sm">No customer orders placed yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-background shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs font-black text-foreground-muted uppercase tracking-wider">
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4">Total Orders Placed</th>
                <th className="px-6 py-4">Total Volume Spent</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
              {customersList.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 font-black text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="px-6 py-4 text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {c.phone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-orange-100 text-[#ff7a00] text-[10px] font-black flex items-center gap-1 w-fit">
                      <ShoppingBag className="w-3 h-3" />
                      {c.orderCount} Orders
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-700">
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      Active Customer
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
