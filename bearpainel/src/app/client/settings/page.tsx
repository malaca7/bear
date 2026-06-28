"use client";
import { useState } from "react";
import { useAuthStore } from "@/stores";
import { Lock, Save, Loader2 } from "lucide-react";

export default function ClientSettingsPage() {
  const { user } = useAuthStore();
  const [passwords, setPasswords] = useState({ current: "", new_pass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChangePassword = async () => {
    if (!user) return;
    if (passwords.new_pass !== passwords.confirm) { setMessage({ text: "As senhas não coincidem", type: "error" }); return; }
    if (passwords.new_pass.length < 6) { setMessage({ text: "A nova senha deve ter no mínimo 6 caracteres", type: "error" }); return; }
    
    setSaving(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const storedUsers = localStorage.getItem("bear_mock_users");
      if (!storedUsers) {
        setMessage({ text: "Banco de dados local não encontrado.", type: "error" });
        setSaving(false);
        return;
      }

      const usersList = JSON.parse(storedUsers);
      
      // Update the user's password in mock database
      const updatedList = usersList.map((u: any) => {
        if (u.user?.id === user.id) {
          return {
            ...u,
            password: passwords.new_pass,
          };
        }
        return u;
      });

      localStorage.setItem("bear_mock_users", JSON.stringify(updatedList));
      setMessage({ text: "Senha alterada com sucesso!", type: "success" });
      setPasswords({ current: "", new_pass: "", confirm: "" });
    } catch {
      setMessage({ text: "Erro ao redefinir a senha. Tente novamente.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Configurações</h1></div>
      <div className="glass-card p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-bear-primary" />Alterar Senha</h2>
        {message.text && <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>{message.text}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm text-white/60 mb-1">Nova Senha</label><input type="password" value={passwords.new_pass} onChange={(e) => setPasswords({...passwords, new_pass: e.target.value})} className="bear-input w-full" placeholder="Mínimo 6 caracteres" /></div>
          <div><label className="block text-sm text-white/60 mb-1">Confirmar Nova Senha</label><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="bear-input w-full" placeholder="Repita a nova senha" /></div>
          <button onClick={handleChangePassword} disabled={saving} className="btn-glow !px-6 !py-2.5 flex items-center gap-2 text-sm">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Alterar Senha</button>
        </div>
      </div>
    </div>
  );
}
