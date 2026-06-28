# BEAR Platform Setup Guide

Este guia orienta na configuração inicial do ambiente para executar e desenvolver a plataforma BEAR.

## Requisitos Prévios

1. **Supabase CLI** instalado localmente.
2. **Node.js** v18+ e **npm**.
3. **.NET 8 SDK** para compilação do aplicativo desktop.
4. IDE recomendada: **Visual Studio 2022** ou **VS Code** com extensão C# Dev Kit.

---

## 1. Banco de Dados & Back-End (Supabase)

### Inicializando o projeto localmente
```bash
supabase init
```

### Configurando as Credenciais
Edite o arquivo `supabase/config.toml` para configurar o nome do projeto e recursos de Auth.

### Executando Migrações
Com o Docker ativo em sua máquina, inicie o ambiente Supabase:
```bash
supabase start
```
As migrações na pasta `supabase/migrations` (de `bear_001_...` a `bear_016_...`) serão aplicadas automaticamente de forma sequencial.

### Publicando as Edge Functions
Publique cada uma das funções localizadas em `supabase/functions/` para o seu projeto Supabase:
```bash
supabase functions deploy bear-auth
supabase functions deploy bear-license
supabase functions deploy bear-updates
supabase functions deploy bear-download
supabase functions deploy bear-notification
```

---

## 2. Painel Web (Next.js)

### Configuração de Variáveis de Ambiente
Renomeie ou copie o arquivo `.env.local.example` para `.env.local` na pasta `bear-web`:
```bash
cd bear-web
cp .env.local.example .env.local
```
Preencha as chaves do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### Instalando as Dependências
```bash
npm install
```

### Executando em Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` para testar.

---

## 3. Aplicativo Desktop (.NET 8 WPF)

### Restaurando Pacotes NuGet
Abra a solução `bear-desktop/BearApp.sln` no Visual Studio ou execute via terminal:
```bash
cd bear-desktop
dotnet restore
```

### Configurando Chaves do Supabase
Edite a classe `SupabaseService.cs` localizada em `BearApp/Services/Services.cs` e altere as variáveis estáticas com os dados do seu endpoint Supabase:
```csharp
private const string SupabaseUrl = "https://seu-projeto.supabase.co";
private const string SupabaseKey = "sua-anon-key-aqui";
```

### Compilando e Executando
No terminal:
```bash
dotnet run --project BearApp/BearApp.csproj
```
Ou pressione `F5` no Visual Studio.
