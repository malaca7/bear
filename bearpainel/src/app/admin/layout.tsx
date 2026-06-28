"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import {
  LayoutDashboard, Users, Key, CreditCard, Download, Box, Flag,
  Settings, Ticket, Bell, FileText, Shield, Search,
  Menu, X, LogOut, ChevronDown, Sliders,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Usuários" },
  { href: "/admin/licenses", icon: Key, label: "Licenças" },
  { href: "/admin/plans", icon: CreditCard, label: "Planos" },
  { href: "/admin/versions", icon: Box, label: "Versões" },
  { href: "/admin/downloads", icon: Download, label: "Downloads" },
  { href: "/admin/feature-flags", icon: Flag, label: "Feature Flags" },
  { href: "/admin/remote-configs", icon: Sliders, label: "Configs Remotas" },
  { href: "/admin/tickets", icon: Ticket, label: "Tickets" },
  { href: "/admin/notifications", icon: Bell, label: "Notificações" },
  { href: "/admin/logs", icon: FileText, label: "Logs" },
  { href: "/admin/audit", icon: Shield, label: "Auditoria" },
  { href: "/admin/settings", icon: Settings, label: "Configurações" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, initialize, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bear-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-bear-primary flex items-center justify-center animate-glow-pulse">
          <span className="font-black">B</span>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => { await signOut(); router.push("/login"); };

  return (
    <div className="min-h-screen bg-bear-background text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bear-bg-light border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bear-primary flex items-center justify-center"><span className="font-black text-sm">B</span></div>
            <span className="font-bold gradient-text">BEAR Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? "nav-item-active" : ""}`} onClick={() => setSidebarOpen(false)}>
              <item.icon className="w-5 h-5" />{item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleSignOut} className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 bg-bear-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white"><Menu className="w-6 h-6" /></button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar..." className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-bear-primary/50" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-white/40 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-bear-primary rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-full bg-bear-primary/20 flex items-center justify-center text-xs font-bold text-bear-primary">
                {user?.display_name?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.display_name || "Admin"}</span>
              <ChevronDown className="w-4 h-4 text-white/30" />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
