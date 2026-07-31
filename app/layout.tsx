import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";
import { MobileBottomNav } from "@/components/customer/mobile-bottom-nav";
import { getCurrentUser, createClient } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "T-Bites — Local Food, Delivered Fast",
    template: "%s | T-Bites",
  },
  description:
    "Browse, compare, and order food from your favourite local restaurants. No commission, no middlemen — just great food delivered by the restaurants you love.",
  keywords: ["food delivery", "local restaurants", "order food online", "T-Bites"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  let role = "customer";

  if (user) {
    if (user.user_metadata?.role) {
      role = user.user_metadata.role;
    } else {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) role = profile.role;
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-background text-foreground pb-16 md:pb-0"
      >
        {children}
        <MobileBottomNav />
        <ToastContainer />
      </body>
    </html>
  );
}
