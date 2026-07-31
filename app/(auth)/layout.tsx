import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-950">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-black/30 blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="text-2xl font-bold">
            T-Bites
          </Link>

          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Your favourite local food,
              <br />
              delivered fast.
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Join thousands of customers and restaurants already using T-Bites
              to discover, order, and deliver food in town.
            </p>
          </div>

          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} T-Bites. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
