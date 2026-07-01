import { Sidebar } from "@/components/sidebar";
import { SetupBanner } from "@/components/setup-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
          <SetupBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
