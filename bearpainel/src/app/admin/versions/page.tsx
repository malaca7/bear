"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize } from "@/lib/utils";
import { Box, Plus, Upload, Globe, Lock } from "lucide-react";

export default function VersionsPage() {
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { const supabase = createClient(); const { data } = await supabase.from("bear_versions").select("*").order("version_code", { ascending: false }); setVersions(data || []); setIsLoading(false); };
    fetch();
  }, []);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8"><div><h1 className="page-title">Versões</h1><p className="page-subtitle">Gerenciamento de versões e atualizações</p></div><button className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Publicar Versão</button></div>
      <div className="space-y-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer h-28 rounded-xl" />) :
          versions.map((v) => (
            <div key={v.id} className="glass-card-hover p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${v.is_published ? "bg-bear-success/10" : "bg-white/5"}`}><Box className={`w-6 h-6 ${v.is_published ? "text-bear-success" : "text-white/30"}`} /></div>
                <div>
                  <div className="flex items-center gap-2"><h3 className="font-semibold text-lg">v{v.version}</h3>{v.is_mandatory && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Obrigatória</span>}{v.is_published ? <Globe className="w-4 h-4 text-bear-success" /> : <Lock className="w-4 h-4 text-white/30" />}</div>
                  <p className="text-sm text-white/40 mt-0.5">{v.title || "Sem título"}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                    <span>Código: {v.version_code}</span>
                    {v.file_size > 0 && <span>{formatFileSize(v.file_size)}</span>}
                    <span>Plano mín: {v.min_plan}</span>
                    {v.published_at && <span>Publicado: {formatDate(v.published_at, "relative")}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
