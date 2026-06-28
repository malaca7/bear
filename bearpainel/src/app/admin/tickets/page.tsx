"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, getStatusBadgeClasses } from "@/lib/utils";
import type { BearTicket } from "@/lib/types";
import { Search, Ticket, MessageCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<BearTicket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const supabase = createClient();
      let query = supabase.from("bear_tickets").select("*, bear_users(email, display_name)", { count: "exact" });
      if (statusFilter) query = query.eq("status", statusFilter);
      query = query.order("created_at", { ascending: false }).range((page - 1) * 20, page * 20 - 1);
      const { data, count } = await query;
      setTickets(data || []);
      setTotalCount(count || 0);
      setIsLoading(false);
    };
    fetch();
  }, [statusFilter, page]);

  const statusLabels: Record<string, string> = { open: "Aberto", in_progress: "Em andamento", waiting_client: "Aguardando cliente", waiting_support: "Aguardando suporte", resolved: "Resolvido", closed: "Fechado" };
  const priorityColors: Record<string, string> = { low: "text-blue-400", medium: "text-yellow-400", high: "text-orange-400", urgent: "text-red-400" };
  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Tickets</h1><p className="page-subtitle">{totalCount} tickets</p></div>
      <div className="flex gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none appearance-none">
          <option value="">Todos</option><option value="open">Abertos</option><option value="in_progress">Em andamento</option><option value="resolved">Resolvidos</option><option value="closed">Fechados</option>
        </select>
      </div>
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-20 rounded-xl" />) :
          tickets.map((t) => (
            <div key={t.id} className="glass-card-hover p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-bear-primary/10 flex items-center justify-center shrink-0"><Ticket className="w-5 h-5 text-bear-primary" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-white/30">#{t.ticket_number}</span><h3 className="font-medium text-white truncate">{t.subject}</h3></div>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{(t as any).bear_users?.display_name || (t as any).bear_users?.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={getStatusBadgeClasses(t.status)}>{statusLabels[t.status]}</span>
                    <span className={`text-xs font-medium ${priorityColors[t.priority] || "text-white/40"}`}>{t.priority}</span>
                    <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(t.created_at, "relative")}</span>
                  </div>
                </div>
              </div>
              {!t.is_read_by_admin && <span className="w-2 h-2 rounded-full bg-bear-primary shrink-0 mt-2" />}
            </div>
          ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-white/40">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
