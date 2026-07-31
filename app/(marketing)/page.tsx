import { GourmetHome } from "@/components/customer/gourmet-home";
import { getUserProfileName } from "@/lib/supabase/server";

export default async function HomePage() {
  const userName = await getUserProfileName();
  return <GourmetHome userName={userName} />;
}
