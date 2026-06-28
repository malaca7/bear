"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import { Eye, EyeOff, LogIn, Loader2, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isLoading: storeLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn(username.trim(), password);

      if (!res.success) {
        setError(res.error || "Usuário ou senha incorretos.");
        return;
      }

      // Check role for redirect from the response directly
      if (res.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/client/dashboard");
      }
    } catch {
      setError("Erro ao conectar. Tente novamente.");
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
      {/* Background effects */}
      <div className="absolute inset-0 bear-pattern opacity-40" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-bear-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-bear-accent/5 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md animate-slide-in-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-bear-primary flex items-center justify-center shadow-lg shadow-bear-primary/20">
              <span className="font-black text-lg text-white">B</span>
            </div>
            <span className="text-2xl font-bold gradient-text tracking-wider">BEAR</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-white/40 mt-1">Entre com suas credenciais para acessar o painel</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 border border-white/10 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5 animate-shake">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bear-input w-full focus:border-bear-primary/50 transition-colors"
                placeholder="Seu usuário"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
                  Senha
                </label>
                <Link href="/forgot-password" className="text-xs text-bear-primary hover:text-bear-accent transition-colors font-medium">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bear-input w-full pr-12 focus:border-bear-primary/50 transition-colors"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className="btn-glow w-full flex items-center justify-center gap-2 mt-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-bear-primary hover:text-bear-accent transition-colors font-semibold">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
