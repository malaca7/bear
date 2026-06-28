"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/stores";
import { Users, Key, Ticket, Download, Box, TrendingUp, Activity, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const { stats, isLoading, fetchStats } = useDashboardStore();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { label: "Usuários Ativos", value: stats?.total_active_users ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Licenças Ativas", value: stats?.total_active_licenses ?? 0, icon: Key, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Tickets Abertos", value: stats?.open_tickets ?? 0, icon: Ticket, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Downloads Total", value: stats?.total_download_count ?? 0, icon: Download, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Versões Publicadas", value: stats?.published_versions ?? 0, icon: Box, color: "text-bear-primary", bg: "bg-bear-primary/10" },
    { label: "Novos Usuários (30d)", value: stats?.new_users_30d ?? 0, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral da plataforma BEAR</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card group animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/40 mb-1">{card.label}</p>
                <p className="text-3xl font-bold">{isLoading ? <span className="shimmer inline-block w-16 h-8" /> : card.value.toLocaleString()}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-white/30">
              <ArrowUpRight className="w-3 h-3 text-bear-success" />
              <span className="text-bear-success">+12%</span> vs último mês
            </div>
          </div>
        ))}
      </div>

      {/* Latest Version & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Versão Atual</h2>
            <Activity className="w-5 h-5 text-bear-primary" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-bear-primary/10 flex items-center justify-center">
              <Box className="w-8 h-8 text-bear-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.latest_version || "1.0.0"}</p>
              <p className="text-sm text-white/40">Última versão publicada</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Nova Licença", href: "/admin/licenses", icon: Key },
              { label: "Nova Versão", href: "/admin/versions", icon: Box },
              { label: "Enviar Notificação", href: "/admin/notifications", icon: Activity },
              { label: "Ver Tickets", href: "/admin/tickets", icon: Ticket },
            ].map((action) => (
              <a key={action.label} href={action.href} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-bear-primary/30 hover:bg-white/10 transition-all text-sm">
                <action.icon className="w-4 h-4 text-bear-primary" />{action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
