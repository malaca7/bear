"use client";
import { useState } from "react";
import { useAuthStore } from "@/stores";
import { User, Save, Loader2 } from "lucide-react";
import { BearUser } from "@/lib/types";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    display_name: user?.display_name || "",
    first_name: user?.bear_profiles?.first_name || "",
    last_name: user?.bear_profiles?.last_name || "",
    phone: user?.bear_profiles?.phone || "",
    company: user?.bear_profiles?.company || ""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const storedUsers = localStorage.getItem("bear_mock_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      const updatedProfile = {
        id: user.bear_profiles?.id || "profile-" + Math.random().toString(36).substring(2, 9),
        user_id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        company: formData.company,
        country: user.bear_profiles?.country || "Brasil",
        timezone: user.bear_profiles?.timezone || "America/Sao_Paulo",
        language: user.bear_profiles?.language || "pt-BR",
        bio: user.bear_profiles?.bio || null,
        website: user.bear_profiles?.website || null,
        created_at: user.bear_profiles?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedUser: BearUser = {
        ...user,
        display_name: formData.display_name,
        bear_profiles: updatedProfile,
        updated_at: new Date().toISOString(),
      };

      // Update mock users list
      const updatedList = usersList.map((u: any) => {
        if (u.user?.id === user.id) {
          return {
            ...u,
            user: updatedUser,
          };
        }
        return u;
      });

      localStorage.setItem("bear_mock_users", JSON.stringify(updatedList));
      localStorage.setItem("bear_mock_session", JSON.stringify(updatedUser));
      
      // Update session cookie
      const date = new Date();
      date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = "bear_mock_session=" + encodeURIComponent(JSON.stringify(updatedUser)) + "; expires=" + date.toUTCString() + "; path=/";

      // Update state in useAuthStore
      setUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Meu Perfil</h1>
        <p className="page-subtitle">Gerencie suas informações pessoais</p>
      </div>
      <div className="glass-card p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-bear-primary/20 flex items-center justify-center text-2xl font-bold text-bear-primary">
            {formData.display_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.email}</h2>
            <span className="text-xs text-white/30">
              {user?.role === "admin" ? "Administrador" : "Cliente"}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nome de exibição</label>
            <input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="bear-input w-full"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Nome</label>
              <input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="bear-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Sobrenome</label>
              <input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="bear-input w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Telefone</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bear-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Empresa</label>
            <input
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="bear-input w-full"
            />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-glow !px-6 !py-2.5 flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
          {saved && <span className="text-sm text-bear-success animate-fade-in">Salvo com sucesso!</span>}
        </div>
      </div>
    </div>
  );
}
