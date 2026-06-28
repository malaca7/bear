# BEAR Platform Deployment Guide

Guia de publicação em produção para todos os módulos da plataforma BEAR.

---

## 1. Banco de Dados e Edge Functions (Supabase Cloud)

### Migrando para Produção
1. Crie um projeto no painel da [Supabase](https://supabase.com).
2. Vincule o seu repositório local ao projeto remoto:
   ```bash
   supabase link --project-ref seu-project-ref
   ```
3. Aplique as migrações locais no banco de dados remoto:
   ```bash
   supabase db push
   ```
4. Publique as Edge Functions em produção:
   ```bash
   supabase functions deploy bear-auth --project-ref seu-project-ref
   supabase functions deploy bear-license --project-ref seu-project-ref
   supabase functions deploy bear-updates --project-ref seu-project-ref
   supabase functions deploy bear-download --project-ref seu-project-ref
   supabase functions deploy bear-notification --project-ref seu-project-ref
   ```

---

## 2. Dashboard Administrativo & Área do Cliente (Next.js)

O painel web Next.js pode ser hospedado facilmente na **Vercel** ou em qualquer outro provedor que suporte Node.js / Serverless.

### Deploy na Vercel (Recomendado)
1. Instale a CLI da Vercel ou utilize a integração do GitHub.
2. Configure as seguintes variáveis de ambiente nas configurações do projeto na Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Execute o comando de deploy:
   ```bash
   vercel --prod
   ```

---

## 3. Publicação do Aplicativo Desktop (.NET 8 WPF)

Para distribuir o aplicativo desktop como um único executável (.exe) otimizado e autocontido (sem exigir a instalação prévia do .NET Runtime no computador do cliente):

### Publicando via CLI do .NET
Execute o seguinte comando na raiz da pasta `bear-desktop/BearApp`:
```bash
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:PublishReadyToRun=true
```

### Detalhes do Comando:
- `-c Release`: Compilação em modo de liberação para performance otimizada.
- `-r win-x64`: Runtime do Windows de 64 bits.
- `--self-contained true`: Inclui o framework do .NET dentro do executável.
- `-p:PublishSingleFile=true`: Consolida tudo em um arquivo único (.exe).
- `-p:PublishReadyToRun=true`: Melhora o tempo de inicialização (Splash) através de compilação antecipada (AOT parcial).

O executável gerado estará disponível no caminho:
`bear-desktop/BearApp/bin/Release/net8.0-windows/win-x64/publish/BearApp.exe`
