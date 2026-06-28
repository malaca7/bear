"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sliders, Search, Plus, Save } from "lucide-react";

export default function RemoteConfigsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { const supabase = createClient(); const { data } = await supabase.from("bear_remote_configs").select("*").order("category").order("key"); setConfigs(data || []); setIsLoading(false); };
    fetch();
  }, []);

  const grouped = configs.reduce((acc, c) => { const cat = c.category || "general"; if (!acc[cat]) acc[cat] = []; acc[cat].push(c); return acc; }, {} as Record<string, any[]>);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8"><div><h1 className="page-title">Configurações Remotas</h1><p className="page-subtitle">Controle parâmetros do app remotamente</p></div><button className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Nova Config</button></div>
      {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-20 rounded-xl mb-4" />) :
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">{category}</h2>
            <div className="space-y-3">
              {(items as any[]).map((c) => (
                <div key={c.id} className="glass-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><Sliders className="w-4 h-4 text-bear-primary shrink-0" /><h3 className="font-medium text-sm font-mono">{c.key}</h3>{!c.is_active && <span className="text-xs text-red-400">Inativo</span>}</div>
                      <p className="text-xs text-white/40 mt-1">{c.description || "Sem descrição"}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-black/30 font-mono text-xs text-white/60 overflow-x-auto"><pre>{JSON.stringify(c.value, null, 2)}</pre></div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
