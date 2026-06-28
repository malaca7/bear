"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Settings as SettingsIcon, Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { const supabase = createClient(); const { data } = await supabase.from("bear_settings").select("*").order("key"); setSettings(data || []); setIsLoading(false); };
    fetch();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Configurações</h1><p className="page-subtitle">Configurações do sistema BEAR</p></div>
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />) :
          settings.map((s) => (
            <div key={s.id} className="glass-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3"><SettingsIcon className="w-4 h-4 text-bear-primary" /><div><h3 className="font-medium text-sm font-mono">{s.key}</h3><p className="text-xs text-white/40">{s.description || ""}</p></div></div>
              <div className="flex items-center gap-3"><code className="text-xs bg-black/30 px-2 py-1 rounded text-white/60">{JSON.stringify(s.value)}</code>{s.is_public && <span className="text-[10px] text-bear-primary">Público</span>}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
