import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, SectionTitle, LinkButton } from '../components/Ui';
import { studyTracks as fallbackTracks } from '../data/content';
import { quizCategories as fallbackCategories } from '../data/quizzes';
import { api } from '../lib/api';

export default function Home() {
  const [tracks, setTracks] = useState(fallbackTracks);
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    let alive = true;

    Promise.all([api.getTracks(), api.getQuizCatalog()])
      .then(([tracksData, categoriesData]) => {
        if (!alive) return;

        const mergedTracks =
          tracksData?.length
            ? tracksData.map((track) => {
                const local = fallbackTracks.find(t => t.slug === track.slug);

                return {
                  ...local,
                  ...track,

                  // 🔥 garante imagem SEMPRE
                  image: track.image || local?.image || '',

                  // 🔥 garante highlights
                  highlights:
                    Array.isArray(track.highlights) && track.highlights.length
                      ? track.highlights
                      : local?.highlights || [],
                };
              })
            : fallbackTracks;

        setTracks(mergedTracks);
        setCategories(categoriesData?.length ? categoriesData : fallbackCategories);
      })
      .catch(() => {
        if (!alive) return;
        setTracks(fallbackTracks);
        setCategories(fallbackCategories);
      });

    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { value: String(tracks.length || 4), label: 'trilhas de estudo' },
      { value: '24', label: 'questões reformuladas' },
      { value: '100%', label: 'experiência responsiva' },
    ],
    [tracks.length]
  );

  return (
    <div className="space-y-16">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-7">
          <Badge>Aprendizado interativo</Badge>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Um projeto educacional mais limpo, moderno e fácil de estudar.
            </h1>

            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              O Ecosystem foi reformulado para unir conteúdo, quiz e ranking em uma navegação clara.
              O foco agora é legibilidade, estética e organização real de produto.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <LinkButton to="/quiz">Começar quiz</LinkButton>
            <LinkButton to="/conteudos" variant="secondary">Explorar conteúdos</LinkButton>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <Card key={item.label} className="p-4">
                <div className="text-2xl font-semibold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-slate-400">{item.label}</div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div
            className="relative min-h-[420px] bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(4,10,20,.12), rgba(4,10,20,.9)), url('/banner.jpeg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/20 to-transparent" />

            <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
              <Badge className="w-fit">Visão geral</Badge>

              <h2 className="mt-4 text-3xl font-semibold text-white">
                Conteúdo reorganizado para leitura rápida
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200">
                Cada página agora usa blocos curtos, títulos fortes e espaço visual suficiente para estudar sem cansar.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow="Trilhas de estudo"
          title="Quatro temas, um visual único"
          description="As páginas de conteúdo foram limpas e organizadas para que cada assunto fique mais leve de ler e mais fácil de navegar."
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tracks.map((track) => {
            const fallbackImage = fallbackTracks.find(t => t.slug === track.slug)?.image;

            return (
              <Card key={track.slug} className="flex h-full flex-col">
                <img
                  src={track.image || fallbackImage}
                  alt={track.title}
                  className="mb-5 h-40 w-full rounded-2xl object-cover"
                  loading="lazy"
                  onError={(e) => {
                    if (fallbackImage && e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    } else {
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                />

                <Badge>{track.shortTitle}</Badge>

                <h3 className="mt-4 text-xl font-semibold text-white">{track.title}</h3>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {track.subtitle}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(track.highlights || []).slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <LinkButton
                  to={`/conteudos/${track.slug}`}
                  variant="secondary"
                  className="mt-5 w-full"
                >
                  Abrir conteúdo
                </LinkButton>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <SectionTitle
            eyebrow="Quiz"
            title="Questões mais claras, feedback melhor"
            description="O quiz foi refeito para ficar mais objetivo, com perguntas mais equilibradas e resultado mais útil no fim da partida."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((quiz) => (
              <Link
                key={quiz.slug}
                to={`/quiz/${quiz.slug}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:bg-white/8"
              >
                <div className="text-sm font-semibold text-white">{quiz.title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{quiz.description}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionTitle
            eyebrow="Navegação"
            title="Fluxo mais intuitivo"
            description="Conteúdo, quiz, ranking e perfil agora conversam melhor entre si. Menos ruído visual, mais foco no que importa."
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Conteúdo', 'Leitura em blocos curtos e objetivos.'],
              ['Quiz', 'Progressão com feedback e pontuação.'],
              ['Ranking', 'Classificação clara e sem poluição visual.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="text-sm font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}