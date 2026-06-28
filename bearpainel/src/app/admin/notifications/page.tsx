"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Plus, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { const supabase = createClient(); const { data } = await supabase.from("bear_notifications").select("*").order("created_at", { ascending: false }).limit(100); setNotifications(data || []); setIsLoading(false); };
    fetch();
  }, []);

  const typeIcons: Record<string, string> = { info: "bg-blue-500/10 text-blue-400", warning: "bg-yellow-500/10 text-yellow-400", update: "bg-green-500/10 text-green-400", maintenance: "bg-red-500/10 text-red-400", promotion: "bg-purple-500/10 text-purple-400" };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8"><div><h1 className="page-title">Notificações</h1><p className="page-subtitle">Envie e gerencie notificações</p></div><button className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Send className="w-4 h-4" />Enviar</button></div>
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />) :
          notifications.map((n) => (
            <div key={n.id} className="glass-card p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeIcons[n.type] || "bg-white/5 text-white/40"}`}><Bell className="w-4 h-4" /></div>
              <div className="min-w-0 flex-1"><h3 className="font-medium text-sm truncate">{n.title}</h3><p className="text-xs text-white/40 truncate">{n.message}</p></div>
              <div className="text-right shrink-0"><span className="text-xs text-white/30">{formatDate(n.created_at, "relative")}</span>{n.is_global && <span className="block text-[10px] text-bear-primary">Global</span>}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
