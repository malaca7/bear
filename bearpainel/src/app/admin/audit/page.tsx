"use client";
import { Shield } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Auditoria</h1><p className="page-subtitle">Registro de auditoria do sistema</p></div>
      <div className="glass-card p-12 text-center"><Shield className="w-16 h-16 text-bear-primary mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Auditoria do Sistema</h2><p className="text-white/40">Os logs de auditoria são registrados automaticamente para todas as operações críticas. Consulte a página de Logs para visualizar.</p></div>
    </div>
  );
}
