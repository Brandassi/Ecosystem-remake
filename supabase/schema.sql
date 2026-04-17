
-- Supabase schema for Ecosystem
-- Paste into the SQL editor and run it once.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text unique,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'usuario'
    ),
    new.email
  )
  on conflict (id) do update
    set username = excluded.username,
        email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.study_tracks (
  slug text primary key,
  title text not null,
  short_title text not null,
  subtitle text not null,
  description text not null,
  image text not null,
  accent text not null default 'emerald',
  intro text not null,
  summary jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0
);

create table if not exists public.study_sections (
  id bigserial primary key,
  track_slug text not null references public.study_tracks(slug) on delete cascade,
  title text not null,
  content text not null,
  sort_order integer not null default 0
);

create table if not exists public.quiz_questions (
  id bigserial primary key,
  track_slug text not null references public.study_tracks(slug) on delete cascade,
  question text not null,
  explanation text not null,
  sort_order integer not null default 0
);

create table if not exists public.quiz_options (
  id bigserial primary key,
  question_id bigint not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.quiz_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  track_slug text not null references public.study_tracks(slug) on delete cascade,
  score integer not null,
  total_questions integer not null,
  answers jsonb,
  created_at timestamptz not null default now()
);

alter table public.study_tracks enable row level security;
alter table public.study_sections enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Public read tracks" on public.study_tracks;
create policy "Public read tracks"
on public.study_tracks for select
using (true);

drop policy if exists "Public read sections" on public.study_sections;
create policy "Public read sections"
on public.study_sections for select
using (true);

drop policy if exists "Public read questions" on public.quiz_questions;
create policy "Public read questions"
on public.quiz_questions for select
using (true);

drop policy if exists "Public read options" on public.quiz_options;
create policy "Public read options"
on public.quiz_options for select
using (true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert own attempts" on public.quiz_attempts;
create policy "Users can insert own attempts"
on public.quiz_attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can read own attempts" on public.quiz_attempts;
create policy "Users can read own attempts"
on public.quiz_attempts for select
using (auth.uid() = user_id);

drop policy if exists "Users can update own attempts" on public.quiz_attempts;
create policy "Users can update own attempts"
on public.quiz_attempts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.get_ranking(p_category text default null)
returns table (
  username text,
  score bigint,
  quizzes bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with best_per_topic as (
    select
      a.user_id,
      a.track_slug,
      max(a.score) as best_score
    from public.quiz_attempts a
    where p_category is null or a.track_slug = p_category
    group by a.user_id, a.track_slug
  )
  select
    p.username,
    coalesce(sum(best_per_topic.best_score), 0)::bigint as score,
    coalesce(count(best_per_topic.track_slug), 0)::bigint as quizzes
  from public.profiles p
  left join best_per_topic
    on best_per_topic.user_id = p.id
  group by p.id, p.username
  order by score desc, quizzes desc, p.username asc
  limit 20;
$$;


-- Seed data

insert into public.study_tracks (slug, title, short_title, subtitle, description, image, accent, intro, summary, highlights, sort_order) values ('ecossistemas', 'Ecossistemas', 'Ecossistemas', 'Entenda como energia, matéria e vida se conectam.', 'Perguntas sobre relações ecológicas, equilíbrio e preservação.', '/imagens/ecosistema.jpg', 'emerald', 'Ecossistemas são redes vivas. Quando uma parte muda, o todo sente o impacto. Por isso, estudar esse tema ajuda a entender equilíbrio ambiental, biodiversidade e conservação.', '["Relações entre seres vivos e ambiente.", "Fluxo de energia por cadeias e teias alimentares.", "Ações de preservação e restauração."]', '["Biodiversidade", "Cadeias alimentares", "Habitat e nicho", "Restauração ambiental"]', 1) on conflict (slug) do update set title = excluded.title, short_title = excluded.short_title, subtitle = excluded.subtitle, description = excluded.description, image = excluded.image, accent = excluded.accent, intro = excluded.intro, summary = excluded.summary, highlights = excluded.highlights, sort_order = excluded.sort_order;
insert into public.study_sections (track_slug, title, content, sort_order) values ('ecossistemas', 'O que é um ecossistema?', 'É o conjunto formado pelos seres vivos e pelos fatores físicos do ambiente, como água, luz, solo e temperatura. Tudo interage o tempo inteiro.', 1) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('ecossistemas', 'Por que ele é importante?', 'Porque sustenta a vida. Ecossistemas saudáveis ajudam na regulação do clima, na polinização, na produção de alimento e na qualidade da água e do ar.', 2) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('ecossistemas', 'Como proteger', 'Reduzir desmatamento, recuperar áreas degradadas, controlar poluição e respeitar áreas de preservação são medidas que fortalecem o equilíbrio ambiental.', 3) on conflict do nothing;
insert into public.study_tracks (slug, title, short_title, subtitle, description, image, accent, intro, summary, highlights, sort_order) values ('reino-animal', 'Reino Animal', 'Reino Animal', 'Da diversidade dos invertebrados à complexidade dos vertebrados.', 'Classificação, adaptações e diversidade do reino animal.', '/imagens/reino.jpg', 'sky', 'O reino animal reúne organismos com grande diversidade de formas, hábitos e adaptações. A leitura fica muito mais fácil quando você entende os grandes grupos e suas funções no ambiente.', '["Animais vertebrados e invertebrados.", "Adaptações para sobrevivência.", "Importância ecológica de cada grupo."]', '["Vertebrados", "Invertebrados", "Adaptação", "Conservação da fauna"]', 2) on conflict (slug) do update set title = excluded.title, short_title = excluded.short_title, subtitle = excluded.subtitle, description = excluded.description, image = excluded.image, accent = excluded.accent, intro = excluded.intro, summary = excluded.summary, highlights = excluded.highlights, sort_order = excluded.sort_order;
insert into public.study_sections (track_slug, title, content, sort_order) values ('reino-animal', 'Como os animais se organizam', 'A classificação básica separa vertebrados e invertebrados. Essa divisão ajuda a observar estruturas corporais, locomação, alimentação e reprodução.', 1) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('reino-animal', 'Adaptações que chamam atenção', 'Camuflagem, mimetismo, ecolocalização e conservação de água são exemplos de estratégias que aumentam a chance de sobrevivência.', 2) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('reino-animal', 'Por que estudar o reino animal?', 'Porque ele revela relações ecológicas, dependência alimentar, conservação de espécies e a forma como a vida se adapta a ambientes diferentes.', 3) on conflict do nothing;
insert into public.study_tracks (slug, title, short_title, subtitle, description, image, accent, intro, summary, highlights, sort_order) values ('problemas-ambientais', 'Problemas Ambientais', 'Ambiente', 'Uma visão clara sobre impactos, riscos e soluções.', 'Poluição, clima, consumo e soluções sustentáveis.', '/imagens/poluicao3.jpg', 'amber', 'Poluição, desmatamento e desperdício não são temas isolados. Eles se conectam e afetam saúde, economia e qualidade de vida. O objetivo aqui é entender o problema sem complicar a leitura.', '["Fontes de poluição e seus impactos.", "Mudanças climáticas e efeito estufa.", "Práticas de mitigação e consciência ambiental."]', '["Poluição", "Clima", "Reciclagem", "Consumo consciente"]', 3) on conflict (slug) do update set title = excluded.title, short_title = excluded.short_title, subtitle = excluded.subtitle, description = excluded.description, image = excluded.image, accent = excluded.accent, intro = excluded.intro, summary = excluded.summary, highlights = excluded.highlights, sort_order = excluded.sort_order;
insert into public.study_sections (track_slug, title, content, sort_order) values ('problemas-ambientais', 'Principais problemas', 'Desmatamento, emissão de gases, descarte incorreto de resíduos, contaminação da água e perda de biodiversidade são pontos centrais.', 1) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('problemas-ambientais', 'O que piora a situação', 'Consumo excessivo, uso de combustíveis fósseis, produção de lixo e ocupação desordenada intensificam os impactos.', 2) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('problemas-ambientais', 'Saídas práticas', 'Educação ambiental, reciclagem, consumo consciente, eficiência energética e políticas públicas consistentes são caminhos reais.', 3) on conflict do nothing;
insert into public.study_tracks (slug, title, short_title, subtitle, description, image, accent, intro, summary, highlights, sort_order) values ('tecnologia-sustentavel', 'Tecnologia Sustentável', 'Tecnologia', 'Inovação com menos desperdício e mais eficiência.', 'Energia limpa, eficiência e inovação ambiental.', '/imagens/tecnologia.jpg', 'violet', 'Tecnologia sustentável não é só energia limpa. É também projeto inteligente, eficiência, reaproveitamento de recursos e soluções que reduzem impacto sem perder utilidade.', '["Energia solar, eólica e hidráulica.", "Construções e transportes mais eficientes.", "Soluções para uso responsável de recursos."]', '["Energia limpa", "Eficiência", "Inovação", "Baixo impacto"]', 4) on conflict (slug) do update set title = excluded.title, short_title = excluded.short_title, subtitle = excluded.subtitle, description = excluded.description, image = excluded.image, accent = excluded.accent, intro = excluded.intro, summary = excluded.summary, highlights = excluded.highlights, sort_order = excluded.sort_order;
insert into public.study_sections (track_slug, title, content, sort_order) values ('tecnologia-sustentavel', 'O que entra nessa ideia?', 'Tecnologias sustentáveis combinam inovação e responsabilidade ambiental. Elas reduzem emissões, economizam energia e ajudam a reutilizar materiais.', 1) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('tecnologia-sustentavel', 'Onde aparecem no dia a dia', 'Painéis solares, automação eficiente, veículos elétricos, reaproveitamento de água e sistemas de tratamento são exemplos práticos.', 2) on conflict do nothing;
insert into public.study_sections (track_slug, title, content, sort_order) values ('tecnologia-sustentavel', 'Por que isso importa', 'Porque o crescimento tecnológico precisa ser compatível com a preservação dos recursos e com a qualidade de vida das próximas gerações.', 3) on conflict do nothing;

-- Quiz seed: ecossistemas
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('ecossistemas', 'O que melhor define um ecossistema?', 'Ecossistema é a interação entre componentes bióticos e abióticos.', 1)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Apenas os animais de uma região', 0, 1),
('O conjunto de seres vivos e fatores físicos que interagem em um ambiente', 1, 2),
('Somente o clima de um lugar', 0, 3),
('A relação entre duas espécies isoladas', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('ecossistemas', 'Qual alternativa representa um fator abiótico?', 'Luz solar não é um ser vivo, portanto é um fator abiótico.', 2)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Fungos', 0, 1),
('Bactérias', 0, 2),
('Luz solar', 1, 3),
('Plantas', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('ecossistemas', 'Em uma cadeia alimentar, a energia chega primeiro aos:', 'A base da cadeia é formada pelos produtores, que captam energia.', 3)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Decompositores', 0, 1),
('Consumidores primários', 0, 2),
('Produtores', 1, 3),
('Predadores de topo', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('ecossistemas', 'Qual é o papel dos decompositores?', 'Decompositores reciclam matéria e fecham o ciclo de nutrientes.', 4)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Produzir luz', 0, 1),
('Transformar matéria orgânica e devolver nutrientes ao ambiente', 1, 2),
('Aumentar a temperatura', 0, 3),
('Criar novas espécies', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('ecossistemas', 'A biodiversidade é importante porque:', 'Mais diversidade tende a significar mais equilíbrio ecológico.', 5)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Reduz o número de espécies', 0, 1),
('Deixa o ecossistema mais frágil', 0, 2),
('Aumenta a estabilidade e a capacidade de resposta do ambiente', 1, 3),
('Elimina a necessidade de conservação', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('ecossistemas', 'Uma ação que ajuda a restaurar ecossistemas é:', 'Reflorestamento recupera áreas degradadas e habitats.', 6)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Descartar lixo em rios', 0, 1),
('Reflorestamento', 1, 2),
('Ampliar queimadas', 0, 3),
('Eliminar áreas verdes', 0, 4)
) as v(label, is_correct, sort_order);

-- Quiz seed: reino-animal
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('reino-animal', 'Qual animal é um mamífero?', 'Golfinhos são mamíferos aquáticos.', 1)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Sapo', 0, 1),
('Golfinho', 1, 2),
('Tubarão', 0, 3),
('Cobra', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('reino-animal', 'Qual grupo possui animais sem coluna vertebral?', 'Invertebrados não possuem coluna vertebral.', 2)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Vertebrados', 0, 1),
('Invertebrados', 1, 2),
('Mamíferos', 0, 3),
('Répteis', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('reino-animal', 'A ecolocalização é muito associada a:', 'Esses animais usam sons para se orientar no ambiente.', 3)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Golfinhos e morcegos', 1, 1),
('Pinguins e corais', 0, 2),
('Tartarugas e peixes', 0, 3),
('Coelhos e aves', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('reino-animal', 'Qual das opções é uma adaptação para camuflagem?', 'A camuflagem ajuda a evitar predadores ou a capturar presas.', 4)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Pelagem branca no verão', 0, 1),
('Mudança de cor para se confundir com o ambiente', 1, 2),
('Crescimento de asas', 0, 3),
('Redução de peso', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('reino-animal', 'Os anfíbios normalmente dependem de ambientes úmidos porque:', 'A pele dos anfíbios é sensível à desidratação.', 5)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Precisam de muita areia', 0, 1),
('A pele auxilia nas trocas gasosas e perde água com facilidade', 1, 2),
('Não respiram', 0, 3),
('Vivem apenas no deserto', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('reino-animal', 'Por que a conservação da fauna é importante?', 'A fauna integra cadeias alimentares e processos ecológicos essenciais.', 6)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Para diminuir a diversidade', 0, 1),
('Para manter equilíbrios ecológicos e serviços ambientais', 1, 2),
('Para eliminar predadores', 0, 3),
('Para evitar qualquer interação entre espécies', 0, 4)
) as v(label, is_correct, sort_order);

-- Quiz seed: problemas-ambientais
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('problemas-ambientais', 'Qual é uma consequência comum do desmatamento?', 'A retirada da vegetação afeta espécies, solo e clima local.', 1)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Aumento da biodiversidade', 0, 1),
('Perda de habitat e desequilíbrio ecológico', 1, 2),
('Diminuição do solo exposto', 0, 3),
('Aumento natural de chuvas em qualquer região', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('problemas-ambientais', 'A principal causa do aquecimento global está ligada ao aumento de:', 'Gases como CO₂ e metano intensificam o efeito estufa.', 2)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Nutrientes no solo', 0, 1),
('Gases de efeito estufa', 1, 2),
('Salinidade da água', 0, 3),
('Energia das marés', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('problemas-ambientais', 'Qual prática ajuda a reduzir resíduos e reaproveitar materiais?', 'A reciclagem reduz o volume de resíduos e reaproveita recursos.', 3)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Reciclagem', 1, 1),
('Queima de lixo a céu aberto', 0, 2),
('Descarte em rios', 0, 3),
('Uso único de tudo', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('problemas-ambientais', 'Uma medida sustentável na agricultura é:', 'A rotação de culturas ajuda a preservar solo e fertilidade.', 4)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Monocultura contínua sem descanso', 0, 1),
('Rotação de culturas', 1, 2),
('Uso indiscriminado de agrotóxicos', 0, 3),
('Queima de áreas cultivadas', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('problemas-ambientais', 'Poluição da água pode causar:', 'Contaminação hídrica afeta ecossistemas e abastecimento.', 5)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Melhora imediata da biodiversidade', 0, 1),
('Risco à saúde humana e à vida aquática', 1, 2),
('Aumento garantido da pureza dos rios', 0, 3),
('Fim da necessidade de tratamento', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('problemas-ambientais', 'Qual ação reduz impacto ambiental no cotidiano?', 'Consumo consciente diminui pressão sobre recursos naturais.', 6)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Consumir sem planejamento', 0, 1),
('Desperdiçar energia', 0, 2),
('Consumir de forma consciente', 1, 3),
('Ignorar a coleta seletiva', 0, 4)
) as v(label, is_correct, sort_order);

-- Quiz seed: tecnologia-sustentavel
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('tecnologia-sustentavel', 'Qual é a função principal de painéis solares fotovoltaicos?', 'Eles convertem luz solar em energia elétrica.', 1)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Gerar energia elétrica', 1, 1),
('Aumentar a temperatura', 0, 2),
('Produzir fumaça', 0, 3),
('Filtrar sal da água', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('tecnologia-sustentavel', 'Qual alternativa é uma fonte renovável de energia?', 'A energia eólica é renovável e de baixo impacto relativo.', 2)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Carvão mineral', 0, 1),
('Petróleo', 0, 2),
('Energia eólica', 1, 3),
('Gás natural', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('tecnologia-sustentavel', 'Sistemas de tratamento por wetlands artificiais ajudam principalmente a:', 'Wetlands artificiais usam processos naturais para depuração.', 3)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Aumentar o lixo', 0, 1),
('Tratar esgoto com menor impacto ambiental', 1, 2),
('Reduzir a água disponível', 0, 3),
('Produzir plástico', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('tecnologia-sustentavel', 'Um veículo elétrico contribui para:', 'Veículos elétricos reduzem emissões diretas no uso urbano.', 4)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Aumentar a emissão direta no uso', 0, 1),
('Reduzir emissões locais durante a circulação', 1, 2),
('Eliminar a necessidade de recarga', 0, 3),
('Queimar combustível fóssil no motor', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('tecnologia-sustentavel', 'Eficiência energética significa:', 'Eficiência é entregar o mesmo serviço com menor gasto de recursos.', 5)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Usar mais energia para o mesmo resultado', 0, 1),
('Obter o mesmo resultado com menos desperdício', 1, 2),
('Eliminar toda tecnologia', 0, 3),
('Ignorar consumo', 0, 4)
) as v(label, is_correct, sort_order);
with ins as (
  insert into public.quiz_questions (track_slug, question, explanation, sort_order)
  values ('tecnologia-sustentavel', 'Tecnologia sustentável busca:', 'A ideia central é desenvolvimento com responsabilidade ambiental.', 6)
  returning id
)
insert into public.quiz_options (question_id, label, is_correct, sort_order)
select ins.id, v.label, v.is_correct, v.sort_order
from ins
cross join (values
('Apenas lucro imediato', 0, 1),
('Desenvolvimento sem considerar o meio ambiente', 0, 2),
('Equilibrar inovação, uso de recursos e impacto ambiental', 1, 3),
('Substituir toda natureza por máquinas', 0, 4)
) as v(label, is_correct, sort_order);