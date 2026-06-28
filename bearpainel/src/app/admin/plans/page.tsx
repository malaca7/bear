"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Plus, Edit2, Trash2, X, Loader2, Check } from "lucide-react";

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "pro",
    price: 99.90,
    durationDays: 30,
    description: "",
    maxDevices: 5,
    isActive: true,
    sortOrder: 1
  });

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const stored = localStorage.getItem("bear_mock_plans");
      let allPlans: any[] = stored ? JSON.parse(stored) : [];

      // Seed default plans if empty
      if (allPlans.length === 0) {
        allPlans = [
          {
            id: "mock-plan-id",
            name: "Pro Plan",
            type: "pro",
            price: 99.90,
            duration_days: 30,
            description: "Acesso a todas as funções com spoofer avançado",
            max_devices: 5,
            is_active: true,
            sort_order: 1
          },
          {
            id: "basic-plan-id",
            name: "Basic Plan",
            type: "basic",
            price: 49.90,
            duration_days: 30,
            description: "Funções básicas de proteção de hardware",
            max_devices: 2,
            is_active: true,
            sort_order: 2
          },
          {
            id: "ent-plan-id",
            name: "Enterprise Plan",
            type: "enterprise",
            price: 299.90,
            duration_days: 365,
            description: "Proteção ilimitada para múltiplos computadores",
            max_devices: 20,
            is_active: true,
            sort_order: 3
          }
        ];
        localStorage.setItem("bear_mock_plans", JSON.stringify(allPlans));
      }

      // Sort plans by sort_order
      allPlans.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setPlans(allPlans);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const stored = localStorage.getItem("bear_mock_plans");
      const allPlans: any[] = stored ? JSON.parse(stored) : [];

      const newPlan = {
        id: "plan-" + Math.random().toString(36).substring(2, 9),
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        duration_days: Number(formData.durationDays),
        description: formData.description,
        max_devices: Number(formData.maxDevices),
        is_active: formData.isActive,
        sort_order: Number(formData.sortOrder)
      };

      allPlans.push(newPlan);
      localStorage.setItem("bear_mock_plans", JSON.stringify(allPlans));

      setShowAddModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setModalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const stored = localStorage.getItem("bear_mock_plans");
      if (!stored) return;
      const allPlans: any[] = JSON.parse(stored);

      const updated = allPlans.map((p: any) => {
        if (p.id === selectedPlan.id) {
          return {
            ...p,
            name: formData.name,
            type: formData.type,
            price: Number(formData.price),
            duration_days: Number(formData.durationDays),
            description: formData.description,
            max_devices: Number(formData.maxDevices),
            is_active: formData.isActive,
            sort_order: Number(formData.sortOrder)
          };
        }
        return p;
      });

      localStorage.setItem("bear_mock_plans", JSON.stringify(updated));
      setShowEditModal(false);
      setSelectedPlan(null);
      resetForm();
      fetchPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;
    try {
      const stored = localStorage.getItem("bear_mock_plans");
      if (!stored) return;
      const allPlans: any[] = JSON.parse(stored);

      const updated = allPlans.filter((p: any) => p.id !== planId);
      localStorage.setItem("bear_mock_plans", JSON.stringify(updated));
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "pro",
      price: 99.90,
      durationDays: 30,
      description: "",
      maxDevices: 5,
      isActive: true,
      sortOrder: 1
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      price: plan.price,
      durationDays: plan.duration_days,
      description: plan.description || "",
      maxDevices: plan.max_devices,
      isActive: plan.is_active,
      sortOrder: plan.sort_order || 1
    });
    setShowEditModal(true);
  };

  const typeColors: Record<string, string> = { 
    free: "bg-gray-500/10 text-gray-400 border border-gray-500/20", 
    basic: "bg-blue-500/10 text-blue-400 border border-blue-500/20", 
    standard: "bg-green-500/10 text-green-400 border border-green-500/20", 
    premium: "bg-purple-500/10 text-purple-400 border border-purple-500/20", 
    pro: "bg-bear-primary/10 text-bear-primary border border-bear-primary/20",
    enterprise: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Planos</h1>
          <p className="page-subtitle">Gerencie os planos da plataforma</p>
        </div>
        <button onClick={openAddModal} className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />Novo Plano
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-48 rounded-xl" />
        )) : plans.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-white/40">Nenhum plano cadastrado.</div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="glass-card-hover p-6 relative group border border-white/5">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(plan)} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-bear-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-bear-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${typeColors[plan.type] || "bg-white/5 text-white/40 border border-white/10"}`}>
                  {plan.type}
                </span>
              </div>
            </div>

            <p className="text-2xl font-bold gradient-text mb-1">
              R$ {Number(plan.price).toFixed(2)}
              <span className="text-sm text-white/30 font-normal">/{plan.duration_days}d</span>
            </p>
            
            <p className="text-xs text-white/50 mb-4 h-10 overflow-hidden line-clamp-2">{plan.description}</p>
            
            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3 mt-2">
              <span className="text-white/40">Max dispositivos: <strong className="text-white">{plan.max_devices}</strong></span>
              <span>
                {plan.is_active ? (
                  <span className="text-bear-success font-semibold flex items-center gap-1"><Check className="w-3 h-3" />Ativo</span>
                ) : (
                  <span className="text-red-400 font-semibold">Inativo</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Novo Plano Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-card border border-white/10 w-full max-w-md p-6 overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-bear-primary" />Novo Plano</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Nome do Plano</label>
                <input type="text" placeholder="Ex: Premium 30 Dias" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bear-input w-full" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Tipo</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="bear-input w-full cursor-pointer">
                    <option value="basic" className="bg-bear-background text-white">Basic</option>
                    <option value="pro" className="bg-bear-background text-white">Pro</option>
                    <option value="premium" className="bg-bear-background text-white">Premium</option>
                    <option value="enterprise" className="bg-bear-background text-white">Enterprise</option>
                    <option value="free" className="bg-bear-background text-white">Free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Preço (R$)</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Duração (Dias)</label>
                  <input type="number" min="1" value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Max Dispositivos</label>
                  <input type="number" min="1" value={formData.maxDevices} onChange={(e) => setFormData({ ...formData, maxDevices: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Ordem de Exibição</label>
                  <input type="number" min="1" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Status</label>
                  <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="bear-input w-full cursor-pointer">
                    <option value="true" className="bg-bear-background text-white">Ativo</option>
                    <option value="false" className="bg-bear-background text-white">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Descrição</label>
                <textarea rows={2} placeholder="Descreva os benefícios do plano..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bear-input w-full resize-none" required />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" disabled={modalLoading} className="btn-glow !px-6 !py-2.5 text-sm flex items-center gap-2">{modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Salvar Plano</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editar Plano Modal */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative glass-card border border-white/10 w-full max-w-md p-6 overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Edit2 className="w-5 h-5 text-bear-primary" />Editar Plano</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Nome do Plano</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bear-input w-full" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Tipo</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="bear-input w-full cursor-pointer">
                    <option value="basic" className="bg-bear-background text-white">Basic</option>
                    <option value="pro" className="bg-bear-background text-white">Pro</option>
                    <option value="premium" className="bg-bear-background text-white">Premium</option>
                    <option value="enterprise" className="bg-bear-background text-white">Enterprise</option>
                    <option value="free" className="bg-bear-background text-white">Free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Preço (R$)</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Duração (Dias)</label>
                  <input type="number" min="1" value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Max Dispositivos</label>
                  <input type="number" min="1" value={formData.maxDevices} onChange={(e) => setFormData({ ...formData, maxDevices: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Ordem de Exibição</label>
                  <input type="number" min="1" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} className="bear-input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Status</label>
                  <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="bear-input w-full cursor-pointer">
                    <option value="true" className="bg-bear-background text-white">Ativo</option>
                    <option value="false" className="bg-bear-background text-white">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Descrição</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bear-input w-full resize-none" required />
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
