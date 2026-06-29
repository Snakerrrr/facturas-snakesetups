import { Sidebar } from "@/components/sidebar";
import { SetupBanner } from "@/components/setup-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="container mx-auto max-w-5xl p-4 md:p-8">
          <SetupBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
