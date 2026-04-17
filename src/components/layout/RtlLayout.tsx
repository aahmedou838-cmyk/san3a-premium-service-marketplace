import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
export function RtlLayout() {
  const { pathname } = useLocation();
  const user = useQuery(api.auth.loggedInUser);
  const navItems = [
    { label: "الرئيسية", path: "/client", icon: Home, roles: ["client"] },
    { label: "لوحة التحكم", path: "/worker", icon: LayoutDashboard, roles: ["worker"] },
    { label: "المحفظة", path: "/wallet", icon: Wallet, roles: ["worker"] },
    { label: "الطلبات", path: "/orders", icon: ClipboardList, roles: ["client", "worker"] },
    { label: "الإدارة", path: "/admin", icon: ShieldCheck, roles: ["admin"] },
    { label: "الحساب", path: "/profile", icon: User, roles: ["client", "worker", "admin"] },
  ];
  const filteredNav = navItems.filter(item => 
    !user?.role || item.roles.includes(user.role)
  );
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-l bg-card flex-col sticky top-0 h-screen z-40">
        <div className="p-6 border-b flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">صنعة</span>
          <ThemeToggle className="static" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {filteredNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <SignOutButton />
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between md:justify-end gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xl font-bold text-primary">صنعة</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
              {user?.name?.[0] || 'ع'}
            </div>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t glass-card flex items-center justify-around px-2 z-50">
        {filteredNav.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
              pathname === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}