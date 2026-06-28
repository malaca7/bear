"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { formatDate, getStatusBadgeClasses } from "@/lib/utils";
import { Ticket, Plus, Send, Loader2 } from "lucide-react";

interface BearTicket {
  id: string;
  user_id: string;
  ticket_number: number;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

export default function ClientTicketsPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<BearTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      try {
        const stored = localStorage.getItem("bear_mock_tickets");
        if (stored) {
          const allTickets = JSON.parse(stored) as BearTicket[];
          const userTickets = allTickets.filter(t => t.user_id === user.id);
          setTickets(userTickets);
        } else {
          // Initialize mock default tickets for local development
          const defaultTickets: BearTicket[] = [
            {
              id: "mock-ticket-1",
              user_id: "mock-client-id",
              ticket_number: 1001,
              subject: "Dúvida sobre a instalação do BEAR",
              description: "Como faço para configurar o aplicativo no Windows Defender?",
              status: "resolved",
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "mock-ticket-2",
              user_id: "mock-client-id",
              ticket_number: 1002,
              subject: "Erro de ativação de licença",
              description: "Minha licença diz que atingiu o limite de dispositivos.",
              status: "open",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          localStorage.setItem("bear_mock_tickets", JSON.stringify(defaultTickets));
          const userTickets = defaultTickets.filter(t => t.user_id === user.id);
          setTickets(userTickets);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newTicket.subject) return;
    setCreating(true);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const stored = localStorage.getItem("bear_mock_tickets");
      const allTickets: BearTicket[] = stored ? JSON.parse(stored) : [];
      
      const newNum = allTickets.length > 0 
        ? Math.max(...allTickets.map(t => t.ticket_number)) + 1 
        : 1001;

      const createdTicket: BearTicket = {
        id: `ticket-${Math.random().toString(36).substring(2, 9)}`,
        user_id: user.id,
        ticket_number: newNum,
        subject: newTicket.subject,
        description: newTicket.description,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updated = [createdTicket, ...allTickets];
      localStorage.setItem("bear_mock_tickets", JSON.stringify(updated));
      
      setTickets([createdTicket, ...tickets]);
      setShowNew(false);
      setNewTicket({ subject: "", description: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const statusLabels: Record<string, string> = { open: "Aberto", in_progress: "Em Andamento", resolved: "Resolvido", closed: "Fechado" };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">Meus Tickets</h1>
        <button onClick={() => setShowNew(!showNew)} className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Novo Ticket</button>
      </div>
      {showNew && (
        <div className="glass-card p-6 mb-6">
          <div className="space-y-4">
            <div><label className="block text-sm text-white/60 mb-1 font-medium">Assunto</label><input value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} className="bear-input w-full" placeholder="Ex: Erro ao fazer login no aplicativo" /></div>
            <div><label className="block text-sm text-white/60 mb-1 font-medium">Descrição</label><textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="bear-input w-full min-h-[100px]" placeholder="Descreva seu problema ou dúvida em detalhes..." /></div>
            <button onClick={handleCreate} disabled={creating} className="btn-glow !px-6 !py-2.5 text-sm flex items-center gap-2">{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Enviar Ticket</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="shimmer h-20 rounded-xl" />)
        ) : tickets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Ticket className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Nenhum ticket encontrado</p>
          </div>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="glass-card-hover p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 font-mono">#{t.ticket_number}</span>
                  <h3 className="font-semibold text-sm">{t.subject}</h3>
                </div>
                <p className="text-xs text-white/30 mt-1">{formatDate(t.created_at, "relative")}</p>
              </div>
              <span className={getStatusBadgeClasses(t.status)}>{statusLabels[t.status] || t.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
