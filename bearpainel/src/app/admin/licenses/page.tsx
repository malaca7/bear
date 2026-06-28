"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDate, getStatusBadgeClasses, exportToCSV } from "@/lib/utils";
import type { BearLicense, FilterParams } from "@/lib/types";
import { Search, Download, ChevronLeft, ChevronRight, Plus, Key, Copy, Check, X, Loader2, Edit2, Trash2, ShieldAlert, MoreHorizontal } from "lucide-react";

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<BearLicense[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({ page: 1, pageSize: 20, search: "", status: "" });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    plan: "pro",
    status: "active",
    maxDevices: 5,
    expiresIn: "365",
    notes: ""
  });

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchLicenses = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const stored = localStorage.getItem("bear_mock_licenses");
      let allLicenses: any[] = stored ? JSON.parse(stored) : [];

      // If empty, seed default licenses
      if (allLicenses.length === 0) {
        allLicenses = [
          {
            id: "lic-1",
            code: "BEAR-11111-22222-33333-44444",
            user_id: null,
            plan_id: "mock-plan-id",
            status: "active",
            max_devices: 5,
            notes: "Chave de teste não utilizada",
            activated_device_count: 0,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "lic-2",
            code: "BEAR-55555-66666-77777-88888",
            user_id: "mock-client-id",
            plan_id: "mock-plan-id",
            status: "active",
            max_devices: 5,
            notes: "Chave vinculada ao cliente padrão",
            activated_device_count: 1,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        localStorage.setItem("bear_mock_licenses", JSON.stringify(allLicenses));
      }

      // Load mock users
      const storedUsers = localStorage.getItem("bear_mock_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      // Map licenses with relationships
      let mapped = allLicenses.map((lic: any) => {
        const foundUser = usersList.find((u: any) => u.user && u.user.id === lic.user_id)?.user;
        const planNames: Record<string, string> = { "mock-plan-id": "Pro Plan", "basic-plan-id": "Basic Plan", "ent-plan-id": "Enterprise Plan" };
        const planTypes: Record<string, string> = { "mock-plan-id": "pro", "basic-plan-id": "basic", "ent-plan-id": "enterprise" };
        
        return {
          ...lic,
          bear_users: foundUser ? {
            email: foundUser.email,
            display_name: foundUser.display_name
          } : null,
          bear_plans: {
            name: planNames[lic.plan_id] || "Pro Plan",
            type: planTypes[lic.plan_id] || "pro"
          }
        };
      });

      // Filter by search
      if (filters.search) {
        mapped = mapped.filter((l) => l.code.toLowerCase().includes(filters.search!.toLowerCase()));
      }

      // Filter by status
      if (filters.status) {
        mapped = mapped.filter((l) => l.status === filters.status);
      }

      // Pagination
      const page = filters.page || 1;
      const pageSize = 20;
      const start = (page - 1) * pageSize;
      const paginated = mapped.slice(start, start + pageSize);

      setLicenses(paginated);
      setTotalCount(mapped.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  // Key Generator helper
  const generateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const part = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `BEAR-${part()}-${part()}-${part()}-${part()}`;
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const stored = localStorage.getItem("bear_mock_licenses");
      const allLicenses: any[] = stored ? JSON.parse(stored) : [];
      const newKey = generateKey();

      const newLicenseRecord = {
        id: "lic-" + Math.random().toString(36).substring(2, 9),
        code: newKey,
        user_id: null,
        plan_id: formData.plan === "pro" ? "mock-plan-id" : (formData.plan === "basic" ? "basic-plan-id" : "ent-plan-id"),
        status: formData.status,
        max_devices: Number(formData.maxDevices),
        notes: formData.notes || "Criada via Painel Administrativo",
        activated_device_count: 0,
        expires_at: formData.expiresIn === "never" 
          ? null 
          : new Date(Date.now() + parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updated = [newLicenseRecord, ...allLicenses];
      localStorage.setItem("bear_mock_licenses", JSON.stringify(updated));

      setShowAddModal(false);
      resetForm();
      fetchLicenses();
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) return;
    setModalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const stored = localStorage.getItem("bear_mock_licenses");
      if (!stored) return;
      const list = JSON.parse(stored);

      const updated = list.map((l: any) => {
        if (l.id === selectedLicense.id) {
          let expiresAt = l.expires_at;
          if (formData.expiresIn !== "keep") {
            expiresAt = formData.expiresIn === "never"
              ? null
              : new Date(Date.now() + parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString();
          }

          return {
            ...l,
            plan_id: formData.plan === "pro" ? "mock-plan-id" : (formData.plan === "basic" ? "basic-plan-id" : "ent-plan-id"),
            status: formData.status,
            max_devices: Number(formData.maxDevices),
            notes: formData.notes,
            expires_at: expiresAt,
            updated_at: new Date().toISOString()
          };
        }
        return l;
      });

      localStorage.setItem("bear_mock_licenses", JSON.stringify(updated));
      setShowEditModal(false);
      setSelectedLicense(null);
      resetForm();
      fetchLicenses();
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (licenseId: string, newStatus: string) => {
    try {
      const stored = localStorage.getItem("bear_mock_licenses");
      if (!stored) return;
      const list = JSON.parse(stored);

      const updated = list.map((l: any) => {
        if (l.id === licenseId) {
          return { ...l, status: newStatus, updated_at: new Date().toISOString() };
        }
        return l;
      });

      localStorage.setItem("bear_mock_licenses", JSON.stringify(updated));
      setActiveMenuId(null);
      fetchLicenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLicense = async (licenseId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta licença? Usuários associados perderão o acesso.")) return;
    try {
      const stored = localStorage.getItem("bear_mock_licenses");
      if (!stored) return;
      const list = JSON.parse(stored);

      const updated = list.filter((l: any) => l.id !== licenseId);
      localStorage.setItem("bear_mock_licenses", JSON.stringify(updated));
      setActiveMenuId(null);
      fetchLicenses();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      plan: "pro",
      status: "active",
      maxDevices: 5,
      expiresIn: "365",
      notes: ""
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (lic: any) => {
    setSelectedLicense(lic);
    const planMap: Record<string, string> = { "mock-plan-id": "pro", "basic-plan-id": "basic", "ent-plan-id": "enterprise" };
    setFormData({
      plan: planMap[lic.plan_id] || "pro",
      status: lic.status,
      maxDevices: lic.max_devices,
      expiresIn: "keep", // Keep existing expiration
      notes: lic.notes || ""
    });
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.ceil(totalCount / 20);
  const statusLabels: Record<string, string> = { active: "Ativa", suspended: "Suspensa", expired: "Expirada", revoked: "Revogada", trial: "Teste" };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="page-title">Licenças</h1><p className="page-subtitle">{totalCount} licenças cadastradas</p></div>
        <div className="flex gap-3">
          <button onClick={() => exportToCSV(licenses as any, "bear_licenses")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:border-bear-primary/40"><Download className="w-4 h-4" />CSV</button>
          <button onClick={openAddModal} className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Nova Licença</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input type="text" placeholder="Pesquisar por código..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-bear-primary/50 text-white placeholder-white/30" /></div>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none appearance-none cursor-pointer">
          <option value="" className="bg-bear-background text-white">Todos os status</option>
          <option value="active" className="bg-bear-background text-white">Ativa</option>
          <option value="suspended" className="bg-bear-background text-white">Suspensa</option>
          <option value="expired" className="bg-bear-background text-white">Expirada</option>
          <option value="revoked" className="bg-bear-background text-white">Revogada</option>
          <option value="trial" className="bg-bear-background text-white">Teste</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="bear-table">
            <thead><tr><th>Código</th><th>Usuário</th><th>Plano</th><th>Status</th><th>Dispositivos</th><th>Expira</th><th>Criado</th><th></th></tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan={8}><div className="shimmer h-10 w-full" /></td></tr>)) : licenses.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-white/40 text-sm">Nenhuma licença encontrada.</td></tr>
              ) : licenses.map((lic) => (
                <tr key={lic.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-bear-primary animate-pulse" />
                      <code className="text-xs font-mono text-bear-primary/90">{lic.code}</code>
                      <button onClick={() => copyCode(lic.code, lic.id)} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors">
                        {copiedId === lic.id ? <Check className="w-3 h-3 text-bear-success" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="text-white/60 text-xs">{(lic as any).bear_users?.display_name || (lic as any).bear_users?.email || <span className="text-white/20 italic">Sem usuário</span>}</td>
                  <td><span className="px-2 py-0.5 rounded bg-bear-primary/10 text-bear-primary text-xs font-semibold uppercase">{(lic as any).bear_plans?.name || "—"}</span></td>
                  <td><span className={getStatusBadgeClasses(lic.status)}>{statusLabels[lic.status] || lic.status}</span></td>
                  <td className="text-white/50 text-xs">{lic.activated_device_count}/{lic.max_devices}</td>
                  <td className="text-white/50 text-xs">{lic.expires_at ? formatDate(lic.expires_at) : "Sem expiração"}</td>
                  <td className="text-white/50 text-xs">{formatDate(lic.created_at)}</td>
                  <td className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === lic.id ? null : lic.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeMenuId === lic.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-1 w-40 bg-bear-background/95 border border-white/10 rounded-xl py-1 shadow-2xl backdrop-blur-md z-20 overflow-hidden animate-scale-in">
                          <button onClick={() => openEditModal(lic)} className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" />Editar</button>
                          {lic.status !== "active" && (
                            <button onClick={() => handleUpdateStatus(lic.id, "active")} className="w-full text-left px-4 py-2 text-xs text-bear-success hover:bg-white/5 flex items-center gap-2"><Check className="w-3.5 h-3.5" />Ativar</button>
                          )}
                          {lic.status !== "suspended" && (
                            <button onClick={() => handleUpdateStatus(lic.id, "suspended")} className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2"><X className="w-3.5 h-3.5 text-yellow-500" />Suspender</button>
                          )}
                          {lic.status !== "revoked" && (
                            <button onClick={() => handleUpdateStatus(lic.id, "revoked")} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" />Revogar</button>
                          )}
                          <button onClick={() => handleDeleteLicense(lic.id)} className="w-full text-left px-4 py-2 text-xs text-red-500 hover:text-red-400 hover:bg-white/5 flex items-center gap-2 border-t border-white/5"><Trash2 className="w-3.5 h-3.5" />Excluir</button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-white/5">
          <p className="text-sm text-white/40">Página {filters.page} de {totalPages || 1}</p>
          <div className="flex gap-2">
            <button onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))} disabled={(filters.page || 1) <= 1} className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))} disabled={(filters.page || 1) >= totalPages} className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Nova Licença Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-card border border-white/10 w-full max-w-md p-6 overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Key className="w-5 h-5 text-bear-primary" />Nova Chave de Licença</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateLicense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Plano</label>
                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="bear-input w-full cursor-pointer">
                  <option value="pro" className="bg-bear-background text-white">Pro Plan</option>
                  <option value="basic" className="bg-bear-background text-white">Basic Plan</option>
                  <option value="enterprise" className="bg-bear-background text-white">Enterprise Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Status Inicial</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="bear-input w-full cursor-pointer">
                  <option value="active" className="bg-bear-background text-white">Ativa (Active)</option>
                  <option value="trial" className="bg-bear-background text-white">Período de Testes (Trial)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Máx Dispositivos</label>
                  <input type="number" min="1" max="100" value={formData.maxDevices} onChange={(e) => setFormData({ ...formData, maxDevices: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Validade</label>
                  <select value={formData.expiresIn} onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })} className="bear-input w-full cursor-pointer">
                    <option value="30" className="bg-bear-background text-white">30 Dias</option>
                    <option value="90" className="bg-bear-background text-white">90 Dias</option>
                    <option value="365" className="bg-bear-background text-white">1 Ano</option>
                    <option value="never" className="bg-bear-background text-white">Vitalícia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Observações (Opcional)</label>
                <input type="text" placeholder="Ex: Licença cortesia para cliente VIP" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bear-input w-full" />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" disabled={modalLoading} className="btn-glow !px-6 !py-2.5 text-sm flex items-center gap-2">{modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Gerar Chave</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editar Licença Modal */}
      {showEditModal && selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative glass-card border border-white/10 w-full max-w-md p-6 overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Edit2 className="w-5 h-5 text-bear-primary" />Editar Licença</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleEditLicense} className="space-y-4">
              <div>
                <p className="text-xs text-white/40 mb-1">CÓDIGO DA LICENÇA</p>
                <code className="text-sm font-mono text-bear-primary bg-white/5 px-3 py-2 rounded-lg block border border-white/5 select-all">{selectedLicense.code}</code>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Plano</label>
                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="bear-input w-full cursor-pointer">
                  <option value="pro" className="bg-bear-background text-white">Pro Plan</option>
                  <option value="basic" className="bg-bear-background text-white">Basic Plan</option>
                  <option value="enterprise" className="bg-bear-background text-white">Enterprise Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="bear-input w-full cursor-pointer">
                  <option value="active" className="bg-bear-background text-white">Ativa (Active)</option>
                  <option value="trial" className="bg-bear-background text-white">Período de Testes (Trial)</option>
                  <option value="suspended" className="bg-bear-background text-white">Suspensa (Suspended)</option>
                  <option value="revoked" className="bg-bear-background text-white">Revogada (Revoked)</option>
                  <option value="expired" className="bg-bear-background text-white">Expirada (Expired)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Máx Dispositivos</label>
                  <input type="number" min="1" max="100" value={formData.maxDevices} onChange={(e) => setFormData({ ...formData, maxDevices: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Alterar Validade</label>
                  <select value={formData.expiresIn} onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })} className="bear-input w-full cursor-pointer">
                    <option value="keep" className="bg-bear-background text-white">Manter atual</option>
                    <option value="30" className="bg-bear-background text-white">+30 Dias de hoje</option>
                    <option value="90" className="bg-bear-background text-white">+90 Dias de hoje</option>
                    <option value="365" className="bg-bear-background text-white">+1 Ano de hoje</option>
                    <option value="never" className="bg-bear-background text-white">Vitalícia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Observações</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bear-input w-full" />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" disabled={modalLoading} className="btn-glow !px-6 !py-2.5 text-sm flex items-center gap-2">{modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
