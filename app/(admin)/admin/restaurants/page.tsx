import { sanityClient } from "@/lib/sanity/client";
import { AdminCreateRestaurantModal } from "@/components/admin/admin-create-restaurant-modal";
import { AdminEditRestaurantModal } from "@/components/admin/admin-edit-restaurant-modal";
import { AdminDeleteRestaurantButton } from "@/components/admin/admin-delete-restaurant-button";
import { Store, Mail, Phone, MapPin, CheckCircle2, ShieldAlert } from "lucide-react";

export default async function AdminRestaurantsPage() {
  const restaurants = await sanityClient.fetch(
    `*[_type == "restaurant"]{
      _id,
      name,
      slug,
      address,
      contactNumber,
      ownerEmail,
      status,
      createdAt
    } | order(createdAt desc)`
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Restaurant Partners & Owners</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Super Admin Directory of registered food stores & owner accounts.
          </p>
        </div>

        <AdminCreateRestaurantModal />
      </div>

      {!restaurants || restaurants.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-background">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-foreground-muted font-bold text-sm">No partner restaurants registered yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-background shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs font-black text-foreground-muted uppercase tracking-wider">
                <th className="px-6 py-4">Restaurant Store</th>
                <th className="px-6 py-4">Owner Email</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Store Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
              {restaurants.map((r: any) => (
                <tr key={r._id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 font-black text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ff7a00] flex items-center justify-center font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <span>{r.name}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    <span className="flex items-center gap-1.5 text-primary">
                      <Mail className="w-3.5 h-3.5" />
                      {r.ownerEmail || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {r.contactNumber || "Verified"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground-muted max-w-xs truncate">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {r.address || "Local Area"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                      r.status === "suspended"
                        ? "bg-red-100 text-red-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {r.status === "suspended" ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {r.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AdminEditRestaurantModal restaurant={r} />
                      <AdminDeleteRestaurantButton restaurantId={r._id} restaurantName={r.name} />
                    </div>
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
