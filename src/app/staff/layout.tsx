"use client";

import * as React from "react";
import { StaffSidebar } from "@/components/layout/StaffSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  return (
    <RoleGuard allowedRoles={["STAFF", "ADMIN"]}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
        <div className="hidden md:flex md:shrink-0">
          <StaffSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          />
        </div>

        {isMobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl">
              <StaffSidebar
                isCollapsed={false}
                onToggleCollapse={() => {}}
                onNavigateMobile={() => setIsMobileOpen(false)}
                isMobile={true}
              />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <AppHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />
          <main
            className="flex-1 overflow-y-auto bg-slate-50 focus:outline-none"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
