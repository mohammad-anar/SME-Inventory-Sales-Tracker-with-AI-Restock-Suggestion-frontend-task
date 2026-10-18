"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useLazyGetMeQuery } from "@/lib/redux/services/authApi";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setUser } from "@/lib/redux/slices/authSlice";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const [triggerGetMe] = useLazyGetMeQuery();

  React.useEffect(() => {
    const hasToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("stockpilot_token")
        : null);

    if (!hasToken) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`
      );
    }
  }, [token, pathname, router]);

  React.useEffect(() => {
    if (token && !user) {
      triggerGetMe()
        .unwrap()
        .then((res) => {
          if (res?.data) {
            dispatch(setUser(res.data));
          }
        })
        .catch(() => {});
    }
  }, [token, user, triggerGetMe, dispatch]);

  React.useEffect(() => {
    if (user?.role === "STAFF") {
      const adminOnlyPaths = [
        "/dashboard",
        "/categories",
        "/suppliers",
        "/purchase-orders",
        "/stock-movements",
        "/ai-restock",
        "/reports",
        "/settings",
      ];
      const isRestricted = adminOnlyPaths.some(
        (p) => pathname === p || pathname?.startsWith(`${p}/`)
      );
      if (isRestricted) {
        toast.error("Staff accounts cannot access administrator management pages.");
        router.replace("/staff/dashboard");
      }
    }
  }, [user, pathname, router]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar
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
            <AppSidebar
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
  );
}

export default DashboardLayout;
