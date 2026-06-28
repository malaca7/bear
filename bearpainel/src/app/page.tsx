import Link from "next/link";
import { cookies } from "next/headers";
import {
  Shield,
  Zap,
  Download,
  Users,
  Key,
  Bell,
  ArrowRight,
  ChevronRight,
  Star,
} from "lucide-react";

export default async function HomePage() {
  const cookieStore = await cookies();
  const mockSession = cookieStore.get("bear_mock_session");
  let user = null;
  if (mockSession?.value) {
    try {
      user = JSON.parse(decodeURIComponent(mockSession.value));
    } catch {
      user = null;
    }
  }

  return (
    <div className="min-h-screen bg-bear-background text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bear-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bear-primary flex items-center justify-center">
              <span className="font-black text-sm">B</span>
            </div>
            <span className="text-xl font-bold gradient-text">BEAR</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Recursos</a>
            <a href="#plans" className="text-sm text-white/60 hover:text-white transition-colors">Planos</a>
            <a href="#download" className="text-sm text-white/60 hover:text-white transition-colors">Download</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/client/dashboard"}
                className="btn-glow text-sm !px-4 !py-2 flex items-center gap-1"
              >
                Painel <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="btn-glow text-sm !px-4 !py-2"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bear-pattern" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-bear-primary/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-bear-accent/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bear-primary/10 border border-bear-primary/20 text-bear-primary text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            <span>Plataforma Premium de Gerenciamento</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Gerencie seu app
            <br />
            <span className="gradient-text">com poder total</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10">
            Distribuição, licenciamento, atualizações OTA, configurações remotas e
            suporte — tudo em uma plataforma integrada.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? (user.role === "admin" ? "/admin/dashboard" : "/client/dashboard") : "/register"}
              className="btn-glow text-lg !px-8 !py-4 flex items-center gap-2"
            >
              {user ? "Acessar Meu Painel" : "Começar Agora"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#download"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
            >
              <Download className="w-5 h-5" />
              Download App
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
            {[
              { value: "10K+", label: "Usuários" },
              { value: "99.9%", label: "Uptime" },
              { value: "50K+", label: "Downloads" },
              { value: "24/7", label: "Suporte" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Uma plataforma completa para gerenciar todo o ciclo de vida do seu aplicativo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Key,
                title: "Licenciamento",
                description: "Sistema completo de licenças com códigos únicos, planos flexíveis, controle de dispositivos e histórico.",
              },
              {
                icon: Shield,
                title: "Segurança",
                description: "JWT, RLS, criptografia, auditoria completa e proteção contra acesso não autorizado.",
              },
              {
                icon: Download,
                title: "Atualizações OTA",
                description: "Distribua novas versões automaticamente. O app verifica, baixa e instala sem intervenção.",
              },
              {
                icon: Zap,
                title: "Feature Flags",
                description: "Ative ou desative funcionalidades remotamente por plano, versão ou porcentagem de usuários.",
              },
              {
                icon: Users,
                title: "Gestão de Usuários",
                description: "Painel completo para gerenciar clientes, perfis, roles, permissões e sessões ativas.",
              },
              {
                icon: Bell,
                title: "Notificações",
                description: "Sistema integrado de notificações com tipos, targeting por plano e agendamento.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card-hover p-6 group">
                <div className="w-12 h-12 rounded-xl bg-bear-primary/10 flex items-center justify-center mb-4 group-hover:bg-bear-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-bear-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bear-primary/3 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Planos para todos
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Escolha o plano ideal para sua necessidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Basic",
                price: "R$ 29,90",
                period: "/mês",
                features: ["1 dispositivo", "Atualizações", "Suporte básico"],
                highlighted: false,
              },
              {
                name: "Premium",
                price: "R$ 99,90",
                period: "/mês",
                features: ["5 dispositivos", "Atualizações prioritárias", "Suporte premium", "Feature flags", "Configs remotas"],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "R$ 299,90",
                period: "/mês",
                features: ["50 dispositivos", "Suporte dedicado", "SLA garantido", "API completa", "Personalização"],
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-bear-primary/10 border-2 border-bear-primary/40 relative"
                    : "glass-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-bear-primary text-xs font-bold">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black gradient-text">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <ChevronRight className="w-4 h-4 text-bear-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? "btn-glow"
                      : "border border-white/10 text-white/70 hover:border-bear-primary/40 hover:text-white"
                  }`}
                >
                  Começar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section id="download" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-bear-primary/5 via-transparent to-bear-accent/5" />
            <div className="relative">
              <Download className="w-16 h-16 text-bear-primary mx-auto mb-6 animate-float" />
              <h2 className="text-3xl font-bold mb-4">Baixe o BEAR App</h2>
              <p className="text-white/50 max-w-lg mx-auto mb-8">
                Disponível para Windows. Instale agora e comece a usar com sua licença.
              </p>
              <button className="btn-glow text-lg !px-8 !py-4 inline-flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download para Windows
              </button>
              <p className="text-xs text-white/30 mt-4">Versão 1.0.0 • Windows 10+ • 45 MB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-bear-primary flex items-center justify-center">
                <span className="font-black text-xs">B</span>
              </div>
              <span className="font-bold">BEAR Platform</span>
            </div>
            <p className="text-sm text-white/30">
              © {new Date().getFullYear()} BEAR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
