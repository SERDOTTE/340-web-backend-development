# Deploy Checklist - Render.com

Siga esta checklist passo-a-passo para fazer deploy bem-sucedido no Render.com.

## ✅ Pré-Deploy (Local)

- [ ] Verifique se o arquivo `.env` **NÃO** está no git (deve estar em .gitignore)
- [ ] Teste `pnpm install` e `pnpm start` localmente
- [ ] Confirme que o app conecta no banco local (DATABASE_URL no .env)
- [ ] Faça commit e push de TODAS as mudanças para GitHub

## ✅ Configuração no Render.com

### 1. Criar Banco de Dados PostgreSQL

1. Vá para [Render Dashboard](https://dashboard.render.com)
2. Clique em **New** → **PostgreSQL**
3. **Configure**:
   - Name: `cse340` (ou nome similar)
   - Database name: `cse340`
   - User: `cse340user`
   - Region: `Ohio` (ou mesma region da sua app)
   - PostgreSQL version: versão atual

4. Clique em **Create Database**
5. ⏳ Aguarde até status ficar **Available** (pode levar 1-2 min)
6. 📋 **COPIE** a string: **Internal Database URL** (aparece na página do banco)

### 2. Criar Web Service

1. Dashboard Render → **New** → **Web Service**
2. Conecte seu **repositório GitHub**
3. **Configure Web Service**:
   - **Name**: `cse340` (ou nome similar)
   - **Runtime**: `Node`
   - **Region**: `Ohio` (MESMA do banco)
   - **Branch**: `main` (ou seu branch principal)
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start`

4. ✅ Clique em **Create Web Service**

### 3. Configurar Variáveis de Ambiente

Enquanto o Web Service está sendo criado:

1. Vá para aba **Environment**
2. Clique em **Add Environment Variable**
3. Adicione as seguintes variáveis:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Cole a Internal Database URL do postgres que copou no passo 1 |
| `PORT` | `10000` |

> **Importante**: Não adicione arquivo `.env` - use apenas as variáveis do dashboard!

## ✅ Pós-Deploy

### Se bem-sucedido (Status: "Live")

- [ ] Clique na URL fornecida pelo Render
- [ ] Teste página inicial (`/`)
- [ ] Teste navegação (menu superior)
- [ ] Teste categoria de inventário (`/inv/type/1`)
- [ ] Verifique logs para erros

### Se falhar (Status: "Build failed")

Vá para **Logs** e procure por:

**Erro: ECONNREFUSED 127.0.0.1:5432**
- ❌ Banco de dados não está rodando ou DATABASE_URL está errado
- ✅ Solução: Confirme que banco PostgreSQL está "Available" no Render

**Erro: Cannot find module**
- ❌ Dependências não instaladas ou package.json com erro
- ✅ Solução: Verifique `pnpm install` roda localmente sem erros

**Erro: Port already in use**
- ❌ Porta 5500 ou 10000 já em uso
- ✅ Solução: Render atribui porta automaticamente, não forçar PORT no .env

## ✅ Primeiros Passos Úteis

Após deploy bem-sucedido:

1. **Adicionar domínio customizado** (opcional)
   - Render → Settings → Custom Domain

2. **Configurar Auto-Deploy**
   - Automaticamente faz deploy quando faz push no GitHub

3. **Verificar Logs**
   - Render Dashboard → Logs (em tempo real)

4. **Monitorar Performance**
   - Render Dashboard → Metrics

## ❌ Problemas Comuns

### Aplicação sobe mas não conecta no banco

```
Error: connect ECONNREFUSED
```

**Causas possíveis**:
1. DATABASE_URL está errada ou vazia
2. Banco PostgreSQL não está "Available"
3. NODE_ENV está como "development" em produção

**Soluções**:
- [ ] Copiar novamente a **Internal Database URL** do PostgreSQL
- [ ] Pegar a URL correta (deve incluir: `postgresql://usuario:senha@host:5432/banco`)
- [ ] Confirmar NODE_ENV = `production` no Render dashboard
- [ ] Redeployar (Force Deploy) após corrigir variáveis

### Database não foi criado

O Render não cria automaticamente tabelas. Você precisa:

1. Rodar migrações ou SQL inicialmente
2. Ou conectar via pgAdmin e executar scripts SQL (assignment2.sql)

Consulte documentação de migrações PostgreSQL para seu projeto.

## 📚 Referências

- [Render Docs - PostgreSQL](https://render.com/docs/databases)
- [Render Docs - Node.js](https://render.com/docs/web-services)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect-conninfo.html)

## 🆘 Se Ainda Tiver Problemas

1. Verifique **Logs** no dashboard do Render
2. Teste `DATABASE_URL` localmente (copie do Render)
3. Confirme que arquivo `.env` **NÃO** está no repositório
4. Força novo deploy: Render Dashboard → Manual Redeploy
