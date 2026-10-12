# Fila Virtual para Atendimento

Projeto Integrador: sistema web de fila virtual para organizar atendimentos.
O cliente entra na fila informando o nome e acompanha a posição pelo celular.
Atendentes e administradores gerenciam a fila por painéis com login.

## Tecnologias

FastAPI (Python) · React (Vite) · PostgreSQL · Docker (apenas banco) · pytest · Git

## Estrutura

```
backend/    API FastAPI (routers → services → repositories)
frontend/   Interface React
database/   Script SQL de referência
docs/       Documentação acadêmica
```

## Como executar (desenvolvimento)

**1. Banco de dados**
```bash
cp .env.example .env
docker compose up -d
```

**2. Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API em http://localhost:8000 · Swagger em http://localhost:8000/docs

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```
Aplicação em http://localhost:5173

## Testes
```bash
cd backend
pytest
```
