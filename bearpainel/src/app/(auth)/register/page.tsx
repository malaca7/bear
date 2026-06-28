"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import { Eye, EyeOff, UserPlus, Loader2, Check, X, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user, isLoading: storeLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    password: "",
    confirmPassword: "",
    licenseKey: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Real-time validations
  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(formData.username);
  const isPasswordLongEnough = formData.password.length >= 6;
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;
  const isKeyValid = /^BEAR-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/i.test(formData.licenseKey);
  
  // Auto-redirect if already logged in
  useEffect(() => {
    if (!storeLoading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/client/dashboard");
      }
    }
  }, [user, storeLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    // Clean all non-alphanumeric characters
    let cleaned = value.replace(/[^A-Z0-9]/g, "");
    
    // Automatically prepend BEAR if starting to type and not present
    if (cleaned.length > 0 && !cleaned.startsWith("BEAR")) {
      cleaned = "BEAR" + cleaned;
    }
    
    // Construct the formatted BEAR-XXXXX-XXXXX-XXXXX-XXXXX
    const parts = [];
    if (cleaned.length >= 4) {
      parts.push("BEAR");
      const rest = cleaned.substring(4);
      for (let i = 0; i < 4; i++) {
        const chunk = rest.substring(i * 5, (i + 1) * 5);
        if (chunk) parts.push(chunk);
      }
    } else {
      parts.push(cleaned);
    }
    
    const formatted = parts.join("-").substring(0, 29);
    setFormData((prev) => ({ ...prev, licenseKey: formatted }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.displayName.trim()) {
      setError("O nome de exibição é obrigatório.");
      return;
    }

    if (!isKeyValid) {
      setError("Insira uma chave de licença válida (Modelo: BEAR-XXXXX-XXXXX-XXXXX-XXXXX).");
      return;
    }

    if (!isUsernameValid) {
      setError("O usuário deve ter de 3 a 20 caracteres e conter apenas letras, números ou sublinhados (_).");
      return;
    }

    if (!isPasswordLongEnough) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!doPasswordsMatch) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUp(
        formData.displayName.trim(),
        formData.username.trim(),
        formData.password,
        formData.licenseKey.trim()
      );

      if (!res.success) {
        setError(res.error || "Erro ao registrar usuário.");
        return;
      }

      // Check role for redirect from the signup response
      if (res.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/client/dashboard");
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-bear-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-bear-primary flex items-center justify-center animate-glow-pulse">
          <span className="font-black text-white">B</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bear-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bear-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-bear-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bear-accent/5 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-bear-primary flex items-center justify-center shadow-lg shadow-bear-primary/20">
              <span className="font-black text-lg text-white">B</span>
            </div>
            <span className="text-2xl font-bold gradient-text tracking-wider">BEAR</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Criar sua conta</h1>
          <p className="text-white/40 mt-1">Comece sua jornada com a plataforma BEAR</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 border border-white/10 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5 animate-shake">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                Nome de Exibição
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="bear-input w-full focus:border-bear-primary/50 transition-colors"
                placeholder="Seu nome ou apelido"
                required
              />
            </div>

            {/* License Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="licenseKey" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Chave de Licença
                </label>
                {formData.licenseKey && (
                  <span className={`text-xs flex items-center gap-1 ${isKeyValid ? "text-emerald-400" : "text-amber-400"}`}>
                    {isKeyValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {isKeyValid ? "Formato correto" : "BEAR-XXXXX-XXXXX-XXXXX-XXXXX"}
                  </span>
                )}
              </div>
              <input
                id="licenseKey"
                name="licenseKey"
                type="text"
                value={formData.licenseKey}
                onChange={handleKeyChange}
                className={`bear-input w-full transition-colors font-mono tracking-wider ${
                  formData.licenseKey ? (isKeyValid ? "border-emerald-500/30 focus:border-emerald-500/60" : "border-amber-500/30 focus:border-amber-500/60") : "focus:border-bear-primary/50"
                }`}
                placeholder="BEAR-XXXXX-XXXXX-XXXXX-XXXXX"
                required
              />
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Usuário
                </label>
                {formData.username && (
                  <span className={`text-xs flex items-center gap-1 ${isUsernameValid ? "text-emerald-400" : "text-amber-400"}`}>
                    {isUsernameValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {isUsernameValid ? "Usuário válido" : "Letras, números e _ (3-20)"}
                  </span>
                )}
              </div>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`bear-input w-full transition-colors ${
                  formData.username ? (isUsernameValid ? "border-emerald-500/30 focus:border-emerald-500/60" : "border-amber-500/30 focus:border-amber-500/60") : "focus:border-bear-primary/50"
                }`}
                placeholder="nome_de_usuario"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Senha
                </label>
                {formData.password && (
                  <span className={`text-xs flex items-center gap-1 ${isPasswordLongEnough ? "text-emerald-400" : "text-amber-400"}`}>
                    {isPasswordLongEnough ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    Mínimo 6 caracteres
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`bear-input w-full pr-12 transition-colors ${
                    formData.password ? (isPasswordLongEnough ? "border-emerald-500/30 focus:border-emerald-500/60" : "border-amber-500/30 focus:border-amber-500/60") : "focus:border-bear-primary/50"
                  }`}
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

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Confirmar Senha
                </label>
                {formData.confirmPassword && (
                  <span className={`text-xs flex items-center gap-1 ${doPasswordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                    {doPasswordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {doPasswordsMatch ? "Senhas coincidem" : "Senhas diferentes"}
                  </span>
                )}
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`bear-input w-full transition-colors ${
                  formData.confirmPassword ? (doPasswordsMatch ? "border-emerald-500/30 focus:border-emerald-500/60" : "border-rose-500/30 focus:border-rose-500/60") : "focus:border-bear-primary/50"
                }`}
                placeholder="Repita a senha anterior"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isUsernameValid || !isPasswordLongEnough || !doPasswordsMatch || !isKeyValid}
              className="btn-glow w-full flex items-center justify-center gap-2 mt-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-bear-primary hover:text-bear-accent font-semibold transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
