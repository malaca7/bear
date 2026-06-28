"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { FileText, Search, Filter } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("bear_activity_logs").select("*, bear_users(email, display_name)").order("created_at", { ascending: false }).limit(100);
      setLogs(data || []);
      setIsLoading(false);
    };
    fetch();
  }, []);

  const actionLabels: Record<string, string> = { login: "Login", logout: "Logout", failure: "Falha", change: "Alteração", update: "Atualização", license: "Licença", config: "Configuração", ticket: "Ticket", download: "Download" };
  const actionColors: Record<string, string> = { login: "text-green-400", logout: "text-white/40", failure: "text-red-400", change: "text-yellow-400", update: "text-blue-400", license: "text-purple-400", config: "text-cyan-400", ticket: "text-orange-400", download: "text-bear-primary" };

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Logs de Atividade</h1><p className="page-subtitle">Registro completo de ações na plataforma</p></div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="bear-table">
            <thead><tr><th>Ação</th><th>Usuário</th><th>Recurso</th><th>Descrição</th><th>IP</th><th>Data</th></tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 10 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="shimmer h-8 w-full" /></td></tr>) :
                logs.map((log) => (
                  <tr key={log.id}>
                    <td><span className={`text-xs font-medium ${actionColors[log.action] || "text-white/40"}`}>{actionLabels[log.action] || log.action}</span></td>
                    <td className="text-xs text-white/60">{log.bear_users?.display_name || log.bear_users?.email || "—"}</td>
                    <td className="text-xs text-white/40">{log.resource_type || "—"}</td>
                    <td className="text-xs text-white/50 max-w-[200px] truncate">{log.description || "—"}</td>
                    <td className="text-xs text-white/30 font-mono">{log.ip_address || "—"}</td>
                    <td className="text-xs text-white/30">{formatDate(log.created_at, "relative")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
