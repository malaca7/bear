"use client";

import { useAuthStore } from "@/stores";
import { Key, Download, Ticket, Bell, Shield, Clock, ArrowUpRight } from "lucide-react";
import { formatDate, getStatusBadgeClasses } from "@/lib/utils";
import Link from "next/link";

export default function ClientDashboard() {
  const { user, license } = useAuthStore();
  const statusLabels: Record<string, string> = { active: "Ativa", suspended: "Suspensa", expired: "Expirada", revoked: "Revogada", trial: "Teste" };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Olá, {user?.display_name || "Usuário"} 👋</h1>
        <p className="page-subtitle">Bem-vindo ao seu painel BEAR</p>
      </div>

      {/* License Status */}
      <div className="glass-card p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bear-primary/5 via-transparent to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-bear-primary/10 flex items-center justify-center"><Key className="w-7 h-7 text-bear-primary" /></div>
            <div>
              <h2 className="text-lg font-semibold">Minha Licença</h2>
              {license ? (
                <div className="flex items-center gap-3 mt-1">
                  <span className={getStatusBadgeClasses(license.status)}>{statusLabels[license.status] || license.status}</span>
                  <span className="text-sm text-white/40">{(license as any).bear_plans?.name || "—"}</span>
                  {license.expires_at && <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" />Expira: {formatDate(license.expires_at)}</span>}
                </div>
              ) : <p className="text-sm text-white/40 mt-1">Nenhuma licença ativa</p>}
            </div>
          </div>
          <Link href="/client/license" className="flex items-center gap-1 text-sm text-bear-primary hover:text-bear-accent transition-colors">Ver detalhes <ArrowUpRight className="w-4 h-4" /></Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/client/downloads", icon: Download, label: "Downloads", desc: "Baixar última versão" },
          { href: "/client/tickets", icon: Ticket, label: "Suporte", desc: "Abrir ou ver tickets" },
          { href: "/client/notifications", icon: Bell, label: "Notificações", desc: "Mensagens e avisos" },
          { href: "/client/profile", icon: Shield, label: "Perfil", desc: "Gerenciar sua conta" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="glass-card-hover p-5 group">
            <div className="w-10 h-10 rounded-xl bg-bear-primary/10 flex items-center justify-center mb-3 group-hover:bg-bear-primary/20 transition-colors"><item.icon className="w-5 h-5 text-bear-primary" /></div>
            <h3 className="font-medium text-sm">{item.label}</h3>
            <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
