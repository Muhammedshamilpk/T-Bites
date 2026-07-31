export const metadata = {
  title: "Sanity Studio | T-Bites",
  description: "Sanity CMS Management Studio for T-Bites",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {children}
    </div>
  );
}
