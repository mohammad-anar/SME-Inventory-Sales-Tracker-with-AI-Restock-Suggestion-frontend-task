"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Building2,
  ShoppingCart,
  ClipboardList,
  ArrowLeftRight,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: FolderTree,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Building2,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "Purchase Orders",
    href: "/purchase-orders",
    icon: ClipboardList,
  },
  {
    title: "Stock Movements",
    href: "/stock-movements",
    icon: ArrowLeftRight,
  },
  {
    title: "AI Restock Forecast",
    href: "/ai-restock",
    icon: Sparkles,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Staff Management",
    href: "/staff",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigateMobile?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  onNavigateMobile,
  isMobile = false,
}: AppSidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const collapsed = !isMobile && isCollapsed;

  const displayName = user?.name || "Admin User";
  const displayEmail = user?.email || "admin@stockpilot.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out border-r border-slate-800",
        collapsed ? "w-20" : "w-64"
      )}
      aria-label="Sidebar Navigation"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
          onClick={onNavigateMobile}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Boxes className="h-6 w-6" aria-hidden="true" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-base font-bold tracking-tight text-white">
                StockPilot
              </span>
              <span className="truncate text-xs font-medium text-slate-400">
                SME Inventory & Sales
              </span>
            </div>
          )}
        </Link>

        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Main Navigation"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigateMobile}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white"
                )}
                aria-hidden="true"
              />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-800 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md p-2 transition-colors",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 shrink-0 border-slate-700 bg-slate-800">
              <AvatarFallback className="bg-slate-800 text-slate-200">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-sm font-medium text-white">
                  {displayName}
                </span>
                <span className="truncate text-xs text-slate-400">
                  {displayEmail}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <Link
              href="/login"
              onClick={handleLogout}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

export default AppSidebar;
