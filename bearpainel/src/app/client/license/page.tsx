"use client";
import { useAuthStore } from "@/stores";
import { Key, Monitor, Clock, Copy, Check, Shield } from "lucide-react";
import { formatDate, getStatusBadgeClasses } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LicensePage() {
  const { user, license } = useAuthStore();
  const [devices, setDevices] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (license) {
      const fetch = async () => { const supabase = createClient(); const { data } = await supabase.from("bear_devices").select("*").eq("license_id", license.id); setDevices(data || []); };
      fetch();
    }
  }, [license]);

  const copyCode = () => { if (license) { navigator.clipboard.writeText(license.code); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const statusLabels: Record<string, string> = { active: "Ativa", suspended: "Suspensa", expired: "Expirada", revoked: "Revogada", trial: "Teste" };

  if (!license) return (
    <div className="page-container"><div className="glass-card p-12 text-center"><Key className="w-16 h-16 text-white/20 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Nenhuma licença ativa</h2><p className="text-white/40">Ative uma licença para começar a usar o BEAR.</p></div></div>
  );

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Minha Licença</h1></div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-bear-primary" />Detalhes</h2>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-white/40 text-sm">Código</span><div className="flex items-center gap-2"><code className="text-sm font-mono text-bear-primary">{license.code}</code><button onClick={copyCode} className="text-white/30 hover:text-white">{copied ? <Check className="w-4 h-4 text-bear-success" /> : <Copy className="w-4 h-4" />}</button></div></div>
            <div className="flex justify-between"><span className="text-white/40 text-sm">Status</span><span className={getStatusBadgeClasses(license.status)}>{statusLabels[license.status]}</span></div>
            <div className="flex justify-between"><span className="text-white/40 text-sm">Plano</span><span className="text-sm font-medium">{(license as any).bear_plans?.name || "—"}</span></div>
            <div className="flex justify-between"><span className="text-white/40 text-sm">Dispositivos</span><span className="text-sm">{license.activated_device_count}/{license.max_devices}</span></div>
            {license.expires_at && <div className="flex justify-between"><span className="text-white/40 text-sm">Expira em</span><span className="text-sm">{formatDate(license.expires_at)}</span></div>}
            <div className="flex justify-between"><span className="text-white/40 text-sm">Criada em</span><span className="text-sm text-white/50">{formatDate(license.created_at)}</span></div>
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Monitor className="w-5 h-5 text-bear-primary" />Dispositivos</h2>
          {devices.length === 0 ? <p className="text-white/40 text-sm">Nenhum dispositivo registrado</p> :
            <div className="space-y-3">{devices.map((d) => (
              <div key={d.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3"><Monitor className="w-4 h-4 text-white/40" /><div><p className="text-sm font-medium">{d.device_name || "Dispositivo"}</p><p className="text-xs text-white/30">{d.os_name} {d.os_version}</p></div></div>
                <span className="text-xs text-white/30">{formatDate(d.last_seen_at, "relative")}</span>
              </div>
            ))}</div>
          }
        </div>
      </div>
    </div>
  );
}
