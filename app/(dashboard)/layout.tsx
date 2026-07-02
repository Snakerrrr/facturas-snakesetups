import { Sidebar } from "@/components/sidebar";
import { StatusBar } from "@/components/setup-banner";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden">
      <KeyboardShortcuts />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="hidden md:flex items-center justify-between border-b border-border/50 h-14 px-6 bg-background/50 backdrop-blur-sm shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <StatusBar />
            <ThemeToggle />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
            <div className="md:hidden mb-3 flex items-center justify-between">
              <StatusBar />
              <ThemeToggle />
            </div>
            <Breadcrumbs />
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
