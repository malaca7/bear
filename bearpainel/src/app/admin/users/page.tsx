"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDate, exportToCSV } from "@/lib/utils";
import type { BearUser, FilterParams } from "@/lib/types";
import { Search, Download, ChevronLeft, ChevronRight, MoreHorizontal, UserCheck, UserX, Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<BearUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterParams>({ page: 1, pageSize: 20, search: "", role: "", sortBy: "created_at", sortOrder: "desc" });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    email: "",
    role: "client",
    isActive: true
  });

  // Action menu visibility
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const storedUsers = localStorage.getItem("bear_mock_users");
      if (storedUsers) {
        const parsedList = JSON.parse(storedUsers);
        const usersList = parsedList.map((u: any) => ({
          ...u.user,
          username: u.username // Attach username so we can edit it
        }));

        // Apply search filter
        let filtered = usersList;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((u: any) => 
            u.display_name?.toLowerCase().includes(s) || 
            u.email?.toLowerCase().includes(s) ||
            u.username?.toLowerCase().includes(s)
          );
        }

        // Apply role filter
        if (filters.role) {
          filtered = filtered.filter((u: BearUser) => u.role === filters.role);
        }

        // Sorting
        filtered.sort((a: any, b: any) => {
          const field = (filters.sortBy || "created_at") as keyof BearUser;
          const valA = a[field] ?? "";
          const valB = b[field] ?? "";
          const dir = filters.sortOrder === "asc" ? 1 : -1;
          return valA > valB ? dir : valA < valB ? -dir : 0;
        });

        // Pagination
        const from = ((filters.page || 1) - 1) * (filters.pageSize || 20);
        const paginated = filtered.slice(from, from + (filters.pageSize || 20));

        setUsers(paginated);
        setTotalCount(filtered.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const stored = localStorage.getItem("bear_mock_users");
      if (!stored) return;
      const list = JSON.parse(stored);
      
      const updated = list.map((record: any) => {
        if (record.user.id === userId) {
          return {
            ...record,
            user: { ...record.user, is_active: !currentStatus, updated_at: new Date().toISOString() }
          };
        }
        return record;
      });

      localStorage.setItem("bear_mock_users", JSON.stringify(updated));
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não poderá ser desfeita.")) return;
    try {
      const stored = localStorage.getItem("bear_mock_users");
      if (!stored) return;
      const list = JSON.parse(stored);
      
      const updated = list.filter((record: any) => record.user.id !== userId);
      localStorage.setItem("bear_mock_users", JSON.stringify(updated));
      setActiveMenuId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const stored = localStorage.getItem("bear_mock_users");
      const list = stored ? JSON.parse(stored) : [];

      // Check if username already exists
      const exists = list.some((u: any) => u.username?.toLowerCase() === formData.username.toLowerCase());
      if (exists) {
        alert("Este nome de usuário já está em uso.");
        setModalLoading(false);
        return;
      }

      const userId = "user-" + Math.random().toString(36).substring(2, 9);
      const newUserRecord = {
        username: formData.username,
        password: formData.password || "123456",
        user: {
          id: userId,
          email: formData.email || `${formData.username}@bear.local`,
          display_name: formData.displayName || formData.username,
          avatar_url: null,
          role: formData.role,
          is_active: formData.isActive,
          is_verified: true,
          last_login_at: null,
          last_ip: "127.0.0.1",
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

      list.push(newUserRecord);
      localStorage.setItem("bear_mock_users", JSON.stringify(list));

      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const stored = localStorage.getItem("bear_mock_users");
      if (!stored) return;
      const list = JSON.parse(stored);

      // Check if username was changed and if new username exists
      const usernameChanged = selectedUser.username.toLowerCase() !== formData.username.toLowerCase();
      if (usernameChanged) {
        const exists = list.some((u: any) => u.username?.toLowerCase() === formData.username.toLowerCase());
        if (exists) {
          alert("Este nome de usuário já está em uso.");
          setModalLoading(false);
          return;
        }
      }

      const updated = list.map((record: any) => {
        if (record.user.id === selectedUser.id) {
          return {
            ...record,
            username: formData.username,
            password: formData.password || record.password, // Keep old if not changed
            user: {
              ...record.user,
              email: formData.email,
              display_name: formData.displayName,
              role: formData.role,
              is_active: formData.isActive,
              updated_at: new Date().toISOString()
            }
          };
        }
        return record;
      });

      localStorage.setItem("bear_mock_users", JSON.stringify(updated));
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      displayName: "",
      email: "",
      role: "client",
      isActive: true
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      password: "", // Leave blank to not change password
      displayName: user.display_name || "",
      email: user.email || "",
      role: user.role || "client",
      isActive: user.is_active
    });
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  const totalPages = Math.ceil(totalCount / (filters.pageSize || 20));

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div><h1 className="page-title">Usuários</h1><p className="page-subtitle">{totalCount} usuários cadastrados</p></div>
        <div className="flex gap-3">
          <button onClick={() => exportToCSV(users as any, "bear_users")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:border-bear-primary/40 transition-colors"><Download className="w-4 h-4" />CSV</button>
          <button onClick={openAddModal} className="btn-glow !px-4 !py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Novo Usuário</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input type="text" placeholder="Pesquisar por nome, usuário ou e-mail..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-bear-primary/50 text-white placeholder-white/30" /></div>
        <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none appearance-none cursor-pointer">
          <option value="" className="bg-bear-background text-white">Todas as roles</option>
          <option value="admin" className="bg-bear-background text-white">Admin</option>
          <option value="client" className="bg-bear-background text-white">Cliente</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="bear-table">
            <thead><tr><th>Usuário</th><th>Role</th><th>Status</th><th>Último login</th><th>Cadastro</th><th></th></tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="shimmer h-10 w-full" /></td></tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-white/40 text-sm">Nenhum usuário encontrado.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-bear-primary/20 flex items-center justify-center text-sm font-bold text-bear-primary">
                        {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.display_name || "—"}</p>
                        <p className="text-xs text-white/40">{user.email} (user: {(user as any).username})</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      user.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className="cursor-pointer select-none"
                    >
                      {user.is_active ? (
                        <span className="flex items-center gap-1 text-bear-success text-xs"><UserCheck className="w-3 h-3" />Ativo</span>
                      ) : (
                        <span className="flex items-center gap-1 text-bear-danger text-xs"><UserX className="w-3 h-3" />Inativo</span>
                      )}
                    </button>
                  </td>
                  <td className="text-white/50 text-xs">{user.last_login_at ? formatDate(user.last_login_at, "relative") : "Nunca"}</td>
                  <td className="text-white/50 text-xs">{formatDate(user.created_at)}</td>
                  <td className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeMenuId === user.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-1 w-36 bg-bear-background/95 border border-white/10 rounded-xl py-1 shadow-2xl backdrop-blur-md z-20 overflow-hidden animate-scale-in">
                          <button onClick={() => openEditModal(user)} className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" />Editar</button>
                          <button onClick={() => handleToggleStatus(user.id, user.is_active)} className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2">
                            {user.is_active ? <UserX className="w-3.5 h-3.5 text-bear-danger" /> : <UserCheck className="w-3.5 h-3.5 text-bear-success" />}
                            {user.is_active ? "Desativar" : "Ativar"}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2 border-t border-white/5"><Trash2 className="w-3.5 h-3.5" />Excluir</button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/5">
          <p className="text-sm text-white/40">Página {filters.page} de {totalPages || 1}</p>
          <div className="flex gap-2">
            <button onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))} disabled={(filters.page || 1) <= 1} className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:border-bear-primary/30"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))} disabled={(filters.page || 1) >= totalPages} className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:border-bear-primary/30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-card border border-white/10 w-full max-w-md p-6 overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Plus className="w-5 h-5 text-bear-primary" />Criar Novo Usuário</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Usuário (Username)</label>
                <input type="text" placeholder="Ex: joao_silva" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="bear-input w-full" required />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Nome de Exibição</label>
                <input type="text" placeholder="Ex: João Silva" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="bear-input w-full" required />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">E-mail</label>
                <input type="email" placeholder="Ex: joao@gmail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bear-input w-full" required />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Senha Inicial</label>
                <input type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bear-input w-full" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="bear-input w-full cursor-pointer">
                    <option value="client" className="bg-bear-background text-white">Cliente (Client)</option>
                    <option value="admin" className="bg-bear-background text-white">Administrador (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Status</label>
                  <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="bear-input w-full cursor-pointer">
                    <option value="true" className="bg-bear-background text-white">Ativo</option>
                    <option value="false" className="bg-bear-background text-white">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" disabled={modalLoading} className="btn-glow !px-6 !py-2.5 text-sm flex items-center gap-2">{modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Criar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative glass-card border border-white/10 w-full max-w-md p-6 overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Edit2 className="w-5 h-5 text-bear-primary" />Editar Usuário</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Usuário (Username)</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="bear-input w-full" required />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Nome de Exibição</label>
                <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="bear-input w-full" required />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">E-mail</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bear-input w-full" required />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Alterar Senha (Deixe em branco para não alterar)</label>
                <input type="password" placeholder="Nova senha se deseja alterar" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bear-input w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="bear-input w-full cursor-pointer">
                    <option value="client" className="bg-bear-background text-white">Cliente (Client)</option>
                    <option value="admin" className="bg-bear-background text-white">Administrador (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Status</label>
                  <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="bear-input w-full cursor-pointer">
                    <option value="true" className="bg-bear-background text-white">Ativo</option>
                    <option value="false" className="bg-bear-background text-white">Inativo</option>
                  </select>
                </div>
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
