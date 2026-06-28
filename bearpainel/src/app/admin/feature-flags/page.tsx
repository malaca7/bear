"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BearFeatureFlag } from "@/lib/types";
import { Flag, Search, Plus, ToggleLeft, ToggleRight } from "lucide-react";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<BearFeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      let query = supabase.from("bear_feature_flags").select("*").order("name");
      if (search) query = query.ilike("name", `%${search}%`);
      const { data } = await query;
      setFlags(data || []);
      setIsLoading(false);
    };
    fetch();
  }, [search]);

  const toggleFlag = async (id: string, enabled: boolean) => {
    const supabase = createClient();
    await supabase.from("bear_feature_flags").update({ is_enabled: !enabled }).eq("id", id);
    setFlags((f) => f.map((flag) => flag.id === id ? { ...flag, is_enabled: !enabled } : flag));
  };

  const planLabels: Record<string, string> = { free: "Free", basic: "Basic", standard: "Standard", premium: "Premium", enterprise: "Enterprise" };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="page-title">Feature Flags</h1><p className="page-subtitle">Gerencie funcionalidades remotamente</p></div>
        <button className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Nova Flag</button>
      </div>

      <div className="relative mb-6"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input type="text" placeholder="Pesquisar flags..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-bear-primary/50" /></div>

      <div className="grid gap-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-24 rounded-xl" />) :
          flags.map((flag) => (
            <div key={flag.id} className="glass-card-hover p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${flag.is_enabled ? "bg-bear-success/10" : "bg-white/5"}`}>
                  <Flag className={`w-5 h-5 ${flag.is_enabled ? "text-bear-success" : "text-white/30"}`} />
                </div>
                <div>
                  <h3 className="font-medium text-white">{flag.name}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{flag.description || "Sem descrição"}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-white/30">Plano: <span className="text-bear-primary">{planLabels[flag.required_plan] || flag.required_plan}</span></span>
                    {flag.min_version && <span className="text-[10px] uppercase tracking-wider text-white/30">Min: {flag.min_version}</span>}
                    {flag.max_version && <span className="text-[10px] uppercase tracking-wider text-white/30">Max: {flag.max_version}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => toggleFlag(flag.id, flag.is_enabled)} className="shrink-0">
                {flag.is_enabled ? <ToggleRight className="w-10 h-10 text-bear-success" /> : <ToggleLeft className="w-10 h-10 text-white/20" />}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
