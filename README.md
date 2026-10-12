# Fila Virtual para Atendimento

Projeto Integrador: sistema web de fila virtual para organizar atendimentos.
O cliente entra na fila informando o nome e acompanha a posição pelo celular.
Atendentes e administradores gerenciam a fila por painéis com login.

## Tecnologias

FastAPI (Python) · React (Vite) · PostgreSQL (Neon) · SQLAlchemy · pytest

## Estrutura

```
backend/    API FastAPI (routers → services → repositories)
frontend/   Interface React
database/   Script SQL de referência
docs/       Documentação acadêmica
```

## Configurar o Neon

1. Na raiz do projeto, copie `.env.example` para `.env`. No PowerShell do VS Code, execute `Copy-Item .env.example .env`.
2. No Console do Neon, abra o projeto, clique em **Connect** e copie a connection string PostgreSQL da branch e do banco corretos.
3. Cole a URL completa em `DATABASE_URL` no arquivo `.env`, mantendo os parâmetros SSL fornecidos pelo Neon. Não compartilhe nem comite esse arquivo.
4. O backend lê o `.env` da raiz do projeto mesmo quando o comando é executado dentro da pasta `backend`.
5. Se o banco Neon ainda não tiver as tabelas, revise `database/schema.sql` e execute-o uma única vez no SQL Editor do Neon. Não execute novamente se as tabelas já existirem sem antes conferir o estado atual.

**Não é necessário executar `docker compose up -d` quando for usar o banco Neon.** O `docker-compose.yml` existe para quem preferir executar um PostgreSQL local.

## Executar no Windows (PowerShell)

Abra um terminal na raiz do projeto e execute:

```powershell
Copy-Item .env.example .env  # somente na primeira configuração
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API em http://localhost:8000 · Swagger em http://localhost:8000/docs · Health check em http://localhost:8000/health

Em outro terminal, execute o frontend:

```powershell
cd frontend
npm install
npm run dev
```

Aplicação em http://localhost:5173

## Usar PostgreSQL local (alternativa)

Para usar o Docker local, ajuste `DATABASE_URL` no `.env` para `postgresql://fila:fila123@localhost:5432/filavirtual` e então execute `docker compose up -d` na raiz. O script `database/schema.sql` é aplicado automaticamente apenas quando o volume do PostgreSQL é inicializado pela primeira vez.

## Testes

```powershell
cd backend
pytest
```
