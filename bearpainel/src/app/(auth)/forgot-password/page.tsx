"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle, Key, Eye, EyeOff, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Identify, 2: Reset, 3: Success
  const [identifier, setIdentifier] = useState(""); // Username or Email
  const [foundUserRecord, setFoundUserRecord] = useState<any>(null);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 600));

      const storedUsers = localStorage.getItem("bear_mock_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      const query = identifier.trim().toLowerCase();
      const matched = usersList.find(
        (u: any) => 
          (u.username && u.username.toLowerCase() === query) || 
          (u.user?.email && u.user.email.toLowerCase() === query)
      );

      if (matched) {
        setFoundUserRecord(matched);
        setStep(2);
      } else {
        setError("Usuário ou e-mail não encontrado no banco de dados local.");
      }
    } catch {
      setError("Erro ao buscar usuário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));

      const storedUsers = localStorage.getItem("bear_mock_users");
      if (!storedUsers) {
        setError("Banco de dados local não encontrado.");
        setIsLoading(false);
        return;
      }

      const usersList = JSON.parse(storedUsers);
      const updatedList = usersList.map((u: any) => {
        if (u.username.toLowerCase() === foundUserRecord.username.toLowerCase()) {
          return {
            ...u,
            password: newPassword, // Update the plain text password
          };
        }
        return u;
      });

      localStorage.setItem("bear_mock_users", JSON.stringify(updatedList));
      setStep(3);
    } catch {
      setError("Erro ao redefinir a senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bear-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bear-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-bear-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bear-accent/5 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md animate-slide-in-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-bear-primary flex items-center justify-center shadow-lg shadow-bear-primary/20">
              <span className="font-black text-lg text-white">B</span>
            </div>
            <span className="text-2xl font-bold gradient-text tracking-wider">BEAR</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
          <p className="text-white/40 mt-1">
            {step === 1 && "Identifique sua conta local para redefinir"}
            {step === 2 && "Crie uma nova senha para sua conta"}
            {step === 3 && "Senha redefinida com sucesso!"}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 border border-white/10 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5 mb-5 animate-shake">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleIdentify} className="space-y-5">
              <div>
                <label htmlFor="identifier" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Usuário ou E-mail
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bear-input w-full focus:border-bear-primary/50 transition-colors"
                  placeholder="ex: admin ou cliente@bear.local"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !identifier.trim()}
                className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Buscar Conta
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm mb-2 text-white/80">
                <span className="text-white/40 block text-xs uppercase tracking-wider font-semibold mb-0.5">Conta Encontrada</span>
                <strong>{foundUserRecord?.user?.display_name}</strong> ({foundUserRecord?.username})
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bear-input w-full pr-12 focus:border-bear-primary/50 transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bear-input w-full focus:border-bear-primary/50 transition-colors"
                  placeholder="Repita a senha anterior"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Redefinir Senha
                  </>
                )}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sucesso!</h2>
              <p className="text-white/50 text-sm mb-6">
                Sua senha foi redefinida no banco de dados local. Você já pode fazer login com suas novas credenciais.
              </p>
              <Link 
                href="/login" 
                className="btn-glow inline-flex items-center gap-2 py-2.5 px-6 font-semibold"
              >
                Ir para o Login
              </Link>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-white/40 hover:text-white/60 inline-flex items-center gap-1.5 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
