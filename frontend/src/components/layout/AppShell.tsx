import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.js";
import { TopBar } from "./TopBar.js";
import { MobileNav } from "./MobileNav.js";
import { Dialog } from "../ui/Dialog.js";

export function AppShell() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-ink antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <Dialog
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="ProcurePilot Navigation"
      >
        <Sidebar className="flex w-full h-auto border-none p-0 sticky top-0" />
      </Dialog>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-8">
        <TopBar onMenuClick={() => setMobileDrawerOpen(true)} />
        <main className="flex-1 px-3 sm:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileNav />
    </div>
  );
}
