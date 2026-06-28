"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize } from "@/lib/utils";
import { Download, Search } from "lucide-react";

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { const supabase = createClient(); const { data } = await supabase.from("bear_downloads").select("*, bear_versions(version)").order("created_at", { ascending: false }); setDownloads(data || []); setIsLoading(false); };
    fetch();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Downloads</h1><p className="page-subtitle">Monitoramento de downloads</p></div>
      <div className="glass-card overflow-hidden">
        <table className="bear-table">
          <thead><tr><th>Arquivo</th><th>Versão</th><th>Tamanho</th><th>Downloads</th><th>Status</th><th>Criado</th></tr></thead>
          <tbody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="shimmer h-8 w-full" /></td></tr>) :
              downloads.map((d) => (
                <tr key={d.id}>
                  <td><div className="flex items-center gap-2"><Download className="w-4 h-4 text-bear-primary" /><span className="font-medium text-sm">{d.title}</span></div></td>
                  <td className="text-xs text-white/50">v{d.bear_versions?.version || "—"}</td>
                  <td className="text-xs text-white/50">{d.file_size ? formatFileSize(d.file_size) : "—"}</td>
                  <td className="text-sm font-medium gradient-text">{d.download_count}</td>
                  <td>{d.is_active ? <span className="text-xs text-bear-success">Ativo</span> : <span className="text-xs text-red-400">Inativo</span>}</td>
                  <td className="text-xs text-white/30">{formatDate(d.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
