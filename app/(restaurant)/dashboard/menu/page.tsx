import { getSanityMenuItems } from "@/lib/sanity/sanity-store.service";
import { SanityMenuManager } from "@/components/sanity/sanity-menu-manager";

export default async function DashboardMenuPage() {
  const sanityMenuItems = await getSanityMenuItems();

  return <SanityMenuManager initialItems={sanityMenuItems} />;
}
