import { sanityFetch } from "@/lib/sanity/client";
import { Store, Users, ClipboardList, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Disable static cache for live admin statistics

export default async function AdminDashboard() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalRestaurants, suspendedRestaurants, todayOrdersCount, totalUsers] = await Promise.all([
    sanityFetch<number>({
      query: `count(*[_type == "restaurant"])`,
      fallback: 0,
      datasetName: "production",
    }),
    sanityFetch<number>({
      query: `count(*[_type == "restaurant" && (status == "suspended" || status == "deactivated")])`,
      fallback: 0,
      datasetName: "production",
    }),
    sanityFetch<number>({
      query: `count(*[_type == "order" && _createdAt >= $todayStart])`,
      params: { todayStart: todayStart.toISOString() },
      fallback: 0,
      datasetName: "production",
    }),
    sanityFetch<number>({
      query: `count(*[_type == "restaurantOwner"])`,
      fallback: 0,
      datasetName: "production",
    }),
  ]);

  const stats = [
    {
      label: "Total Restaurants",
      value: totalRestaurants,
      icon: <Store className="w-5 h-5" />,
      color: "text-primary bg-primary/10",
      href: "/admin/restaurants",
    },
    {
      label: "Suspended Stores",
      value: suspendedRestaurants,
      icon: <Clock className="w-5 h-5" />,
      color: "text-[#994700] bg-orange-100",
      highlight: suspendedRestaurants > 0,
      href: "/admin/restaurants",
    },
    {
      label: "Today's Orders",
      value: todayOrdersCount,
      icon: <ClipboardList className="w-5 h-5" />,
      color: "text-emerald-700 bg-emerald-100",
      href: "/admin/restaurants",
    },
    {
      label: "Total Registered Accounts",
      value: totalUsers,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-700 bg-blue-100",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">
          Admin Overview Dashboard
        </h1>
        <p className="text-foreground-muted mt-1 text-sm">
          Real-time Sanity CMS multi-tenant platform metrics
        </p>
      </div>

      {/* 4 Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="p-6 rounded-3xl bg-background border border-border hover:shadow-md transition-all duration-300 group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-foreground-muted uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">
                {stat.value}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
