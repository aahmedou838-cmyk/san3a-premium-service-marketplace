import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  Wallet,
  Menu,
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
    { label: "محفظتي", path: "/wallet", icon: Wallet, roles: ["worker"] },
    { label: "طلباتي", path: "/orders", icon: ClipboardList, roles: ["client", "worker"] },
    { label: "مركز التحكم", path: "/admin", icon: ShieldCheck, roles: ["admin"] },
    { label: "حسابي", path: "/profile", icon: User, roles: ["client", "worker", "admin"] },
  ];
  const filteredNav = navItems.filter(item =>
    !user?.role || item.roles.includes(user.role)
  );
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans selection:bg-primary/20" dir="rtl">
      {/* Desktop Sidebar - Premium Design */}
      <aside className="hidden md:flex w-72 border-l bg-card flex-col sticky top-0 h-screen z-40 shadow-xl overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between bg-gradient-to-l from-primary/5 to-transparent">
          <Link to="/" className="text-3xl font-black text-primary tracking-tighter">صنعة</Link>
          <ThemeToggle className="static" />
        </div>
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto scrollbar-hide">
          {filteredNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative",
                pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-2xl scale-105"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground hover:translate-x-[-4px]"
              )}
            >
              <item.icon className={cn("w-6 h-6", pathname === item.path ? "text-white" : "group-hover:text-primary")} />
              <span className="font-black text-lg">{item.label}</span>
              {pathname === item.path && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full" />
              )}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t bg-muted/10">
          <SignOutButton />
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 relative">
        <header className="h-20 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between md:justify-end gap-6 shadow-sm">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Menu className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tighter">صنعة</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <Link to="/profile" className="flex items-center gap-3 p-1 pr-4 bg-muted/50 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-primary/10 group">
              <span className="hidden sm:inline font-bold text-sm group-hover:text-primary transition-colors">{user?.name || "حسابي"}</span>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-md">
                {user?.name?.[0] || 'ع'}
              </div>
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
      {/* Mobile Bottom Navigation - Floating & Modern */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-card/95 backdrop-blur-2xl border border-primary/10 rounded-[2.5rem] shadow-2xl flex items-center justify-around px-4 z-50 transition-all">
        {filteredNav.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-300 rounded-2xl relative",
              pathname === item.path ? "text-primary scale-110" : "text-muted-foreground opacity-60"
            )}
          >
            {pathname === item.path && (
              <motion.div layoutId="mobile-nav" className="absolute inset-2 bg-primary/10 rounded-2xl -z-10" />
            )}
            <item.icon className={cn("w-6 h-6", pathname === item.path ? "stroke-[3px]" : "stroke-[2px]")} />
            <span className="text-[11px] font-black">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}