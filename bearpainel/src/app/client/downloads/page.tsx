"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize } from "@/lib/utils";
import { Download, Box } from "lucide-react";

export default function ClientDownloadsPage() {
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { const supabase = createClient(); const { data } = await supabase.from("bear_versions").select("*").eq("is_published", true).order("version_code", { ascending: false }); setVersions(data || []); setIsLoading(false); };
    fetch();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Downloads</h1><p className="page-subtitle">Baixe a versão mais recente do BEAR</p></div>
      <div className="space-y-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer h-24 rounded-xl" />) :
          versions.map((v, i) => (
            <div key={v.id} className={`glass-card p-6 flex items-center justify-between ${i === 0 ? "border-bear-primary/30" : ""}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i === 0 ? "bg-bear-primary/20" : "bg-white/5"}`}><Box className={`w-6 h-6 ${i === 0 ? "text-bear-primary" : "text-white/30"}`} /></div>
                <div><div className="flex items-center gap-2"><h3 className="font-semibold">v{v.version}</h3>{i === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-bear-primary/10 text-bear-primary">Mais recente</span>}{v.is_mandatory && <span className="text-xs text-red-400">Obrigatória</span>}</div><p className="text-xs text-white/40 mt-0.5">{v.title || ""}</p><div className="flex gap-3 text-xs text-white/30 mt-1">{v.file_size > 0 && <span>{formatFileSize(v.file_size)}</span>}<span>{formatDate(v.published_at || v.created_at)}</span></div></div>
              </div>
              {v.download_url && <a href={v.download_url} className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Download className="w-4 h-4" />Baixar</a>}
            </div>
          ))}
      </div>
    </div>
  );
}
