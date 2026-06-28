"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import { formatDate } from "@/lib/utils";
import { Bell, Check } from "lucide-react";

export default function ClientNotificationsPage() {
  const { user } = useAuthStore();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("bear_notifications").select("*").or(`user_id.eq.${user.id},is_global.eq.true`).order("created_at", { ascending: false }).limit(50);
      setNotifs(data || []); setIsLoading(false);
    };
    fetch();
  }, [user]);

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from("bear_notifications").update({ is_read: true }).eq("id", id);
    setNotifs(notifs.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const typeColors: Record<string, string> = { info: "bg-blue-500/10 text-blue-400", warning: "bg-yellow-500/10 text-yellow-400", update: "bg-green-500/10 text-green-400", maintenance: "bg-red-500/10 text-red-400", promotion: "bg-purple-500/10 text-purple-400" };

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Notificações</h1></div>
      <div className="space-y-3">
        {isLoading ? <div className="shimmer h-16 rounded-xl" /> : notifs.length === 0 ? <div className="glass-card p-12 text-center"><Bell className="w-12 h-12 text-white/20 mx-auto mb-3" /><p className="text-white/40">Nenhuma notificação</p></div> :
          notifs.map((n) => (
            <div key={n.id} className={`glass-card p-4 flex items-center gap-4 ${!n.is_read ? "border-l-2 border-l-bear-primary" : ""}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[n.type] || "bg-white/5"}`}><Bell className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0"><h3 className={`text-sm truncate ${!n.is_read ? "font-semibold" : "text-white/60"}`}>{n.title}</h3><p className="text-xs text-white/40 truncate">{n.message}</p></div>
              <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-white/30">{formatDate(n.created_at, "relative")}</span>{!n.is_read && <button onClick={() => markRead(n.id)} className="p-1 rounded hover:bg-white/10"><Check className="w-4 h-4 text-bear-primary" /></button>}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
