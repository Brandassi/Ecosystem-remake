# Ecosystem + Supabase

Projeto em React + Tailwind com Supabase como backend.

## O que configurar no Supabase
1. Crie um projeto.
2. Rode `supabase/schema.sql` no SQL Editor.
3. Copie a `Project URL` e a `anon public key`.
4. No Auth, para facilitar testes locais, desative a confirmação de email.

## Variáveis de ambiente
Crie `client/.env` com:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Frontend
```bash
cd client
npm install
npm run dev
```

## O que foi migrado
- autenticação: Supabase Auth
- ranking: tabela `quiz_attempts` + função `get_ranking`
- histórico do perfil: `quiz_attempts`
- conteúdos e quizzes: `study_tracks`, `study_sections`, `quiz_questions`, `quiz_options`

## Observação
O backend Node anterior foi substituído por Supabase. A pasta `server/` foi removida para evitar conflito de arquitetura.
