"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import { LayoutDashboard, User, Key, Download, Ticket, Bell, Settings, LogOut, Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  { href: "/client/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/client/profile", icon: User, label: "Meu Perfil" },
  { href: "/client/license", icon: Key, label: "Minha Licença" },
  { href: "/client/downloads", icon: Download, label: "Downloads" },
  { href: "/client/tickets", icon: Ticket, label: "Tickets" },
  { href: "/client/notifications", icon: Bell, label: "Notificações" },
  { href: "/client/settings", icon: Settings, label: "Configurações" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, initialize, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!isLoading && !user) router.push("/login"); }, [user, isLoading, router]);

  if (isLoading) return <div className="min-h-screen bg-bear-background flex items-center justify-center"><div className="w-10 h-10 rounded-xl bg-bear-primary flex items-center justify-center animate-glow-pulse"><span className="font-black">B</span></div></div>;

  return (
    <div className="min-h-screen bg-bear-background text-white flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bear-bg-light border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <Link href="/client/dashboard" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-bear-primary flex items-center justify-center"><span className="font-black text-sm">B</span></div><span className="font-bold gradient-text">BEAR</span></Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (<Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? "nav-item-active" : ""}`} onClick={() => setSidebarOpen(false)}><item.icon className="w-5 h-5" />{item.label}</Link>))}
        </nav>
        <div className="p-4 border-t border-white/5"><button onClick={async () => { await signOut(); router.push("/login"); }} className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut className="w-5 h-5" />Sair</button></div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 bg-bear-background/80 backdrop-blur-xl sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60"><Menu className="w-6 h-6" /></button>
          <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"><div className="w-7 h-7 rounded-full bg-bear-primary/20 flex items-center justify-center text-xs font-bold text-bear-primary">{user?.display_name?.[0]?.toUpperCase() || "U"}</div><span className="text-sm font-medium hidden sm:block">{user?.display_name || "Usuário"}</span></div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
