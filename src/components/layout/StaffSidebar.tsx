"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";
import { toast } from "sonner";

export interface StaffNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const staffNavigationItems: StaffNavItem[] = [
  {
    title: "Staff Dashboard",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Product Catalog",
    href: "/products",
    icon: Package,
  },
  {
    title: "Sales & Orders",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "My Profile",
    href: "/profile",
    icon: User,
  },
];

interface StaffSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateMobile?: () => void;
  isMobile?: boolean;
}

export function StaffSidebar({
  isCollapsed = false,
  onToggleCollapse,
  onNavigateMobile,
  isMobile = false,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const displayName = user?.name || "Staff Member";
  const displayEmail = user?.email || "staff@stockpilot.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out",
        isMobile
          ? "w-full"
          : isCollapsed
          ? "w-20"
          : "w-64"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <Link
          href="/staff/dashboard"
          onClick={onNavigateMobile}
          className="flex items-center gap-3 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Boxes className="h-5 w-5" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                StockPilot
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase mt-0.5">
                Staff Portal
              </span>
            </div>
          )}
        </Link>

        {!isMobile && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav
        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4"
        aria-label="Staff Navigation"
      >
        {staffNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/staff/dashboard" && pathname?.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigateMobile}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                isCollapsed && !isMobile ? "justify-center px-0" : ""
              )}
              title={isCollapsed && !isMobile ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {(!isCollapsed || isMobile) && (
                <span className="truncate">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100",
            isCollapsed && !isMobile ? "justify-center p-2" : ""
          )}
        >
          <Avatar className="h-9 w-9 shrink-0 border border-slate-200">
            {user?.avatar ? <AvatarImage src={user.avatar} alt={displayName} /> : null}
            <AvatarFallback className="bg-blue-100 text-xs font-bold text-blue-700">
              {initials}
            </AvatarFallback>
          </Avatar>

          {(!isCollapsed || isMobile) && (
            <div className="flex flex-1 flex-col overflow-hidden text-left min-w-0">
              <span className="truncate text-xs font-bold text-slate-900 leading-tight">
                {displayName}
              </span>
              <span className="truncate text-[11px] text-slate-500 leading-tight">
                {displayEmail}
              </span>
              <span className="mt-1 inline-flex w-fit items-center rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 uppercase tracking-wider">
                Staff
              </span>
            </div>
          )}

          {(!isCollapsed || isMobile) && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default StaffSidebar;
