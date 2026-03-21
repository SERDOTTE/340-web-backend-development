# Deployment Guide - Render.com

Este guia explica como fazer deploy desta aplicação no Render.com.

## Pré-requisitos

1. Conta no [Render.com](https://render.com)
2. Repositório do projeto no GitHub
3. Banco de dados PostgreSQL configurado (pode ser criado no Render)

## Passo 1: Criar Banco de Dados PostgreSQL no Render

1. Acesse seu dashboard no Render.com
2. Clique em **New +** → **PostgreSQL**
3. Preencha os dados:
   - **Name**: `cse340rsf003` (ou similar)
   - **Database**: `cse340rsf003` (mesmo nome pela convenção)
   - **User**: `cse340rsf003_user` (ou outro nome)
   - **Region**: Escolha a mesma região do seu web service
4. Clique em **Create Database**
5. Aguarde até aparecer a string de conexão (Internal Database URL e External Database URL)
6. **Copie a External Database URL** - você precisará dela

## Passo 2: Criar Web Service no Render

1. Clique em **New +** → **Web Service**
2. Conecte seu repositório GitHub
3. Preencha os dados:
   - **Name**: `cse340` (ou nome desejado)
   - **Runtime**: Node
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start` ou `node server.js`
   - **Region**: Mesma do banco de dados (Ohio recomendado)

## Passo 3: Configurar Variáveis de Ambiente

Na página do Web Service, vá para **Environment** e adicione:

```
NODE_ENV=production
DATABASE_URL=postgresql://seu_usuario:sua_senha@seu_host:5432/seu_banco
PORT=10000
```

**Importante**: 
- Cole a **External Database URL** do banco de dados como `DATABASE_URL`
- O `PORT` é atribuído automaticamente pelo Render, mas pode ser deixado como está
- Não incluir arquivo `.env` no git - usa as variáveis do dashboard do Render

## Passo 4: Deploy

1. Conecte seu repositório GitHub
2. Render fará deploy automático quando você fizer push para a branch principal
3. Acompanhe o build na aba **Logs**

## Solução de Problemas

### Erro: ECONNREFUSED 127.0.0.1:5432

**Causa**: A aplicação está tentando conectar ao localhost, mas em produção não há banco local.

**Solução**: 
- Verifique se `NODE_ENV` está definido como `production` no Render
- Confirme que `DATABASE_URL` está correto nas Variáveis de Ambiente
- Certifique-se de que a porta do banco é 5432 (padrão PostgreSQL)

### Erro: Timeout ao conectar ao banco

**Cause**: 
- Banco de dados não está rodando
- Network/firewall bloqueando conexão

**Solução**:
- Verifique no dashboard do Render se o banco está "Available"
- Teste a conexão usando um cliente PostgreSQL com a URL fornecida

### Erro: Connection refused

**Causa**: DATABASE_URL inválida ou banco não existe

**Solução**:
- Copie a External Database URL novamente do dashboard
- Certifique-se de que criou o banco antes de criar o Web Service

## Variáveis de Ambiente Necessárias

| Variável | Valor Exemplo | Descrição |
|----------|---------------|-----------|
| NODE_ENV | `production` | Define o modo da aplicação |
| DATABASE_URL | `postgresql://user:pass@host:5432/db` | String de conexão PostgreSQL |
| PORT | `10000` | Porta HTTP (Render atribui automaticamente) |
| HOST | `0.0.0.0` | Host para produção (não necessário, Render usa padrão) |

## Scripts Disponíveis

```bash
# Desenvolvimento local
pnpm run dev

# Build para produção
pnpm start

# Instalar dependências
pnpm install
```

## Estrutura importante

- `server.js` - Entry point da aplicação
- `database/index.js` - Configuração de conexão com PostgreSQL
- `models/` - Funções de banco de dados
- `controllers/` - Lógica da aplicação
- `routes/` - Roteamento
- `views/` - Templates EJS

## Notas Importantes

1. **Não commitar `.env`**: O arquivo `.env` nunca deve ser commitado no Git. Use `.env.example` como template.
2. **SSL para produção**: Em produção, a conexão com PostgreSQL já usa SSL por padrão no Render.
3. **Logs**: Verifique os logs no dashboard do Render para debugging.
4. **Reiniciar**: Se fizer mudanças no código, simples push no GitHub dispara novo deploy automaticamente.
