import { useEffect, useState } from 'react';
import { LinkButton, Badge, Card, Button } from '../components/Ui';
import { useNavigate, useParams } from 'react-router-dom';
import { contentMap } from '../data/content';
import { api } from '../lib/api';

// 🔥 CORREÇÃO PRINCIPAL
function mergeTrack(remoteTrack, slug) {
  const localTrack = contentMap[slug] || null;

  if (!remoteTrack && !localTrack) return null;

  return {
    ...localTrack,
    ...remoteTrack,

    image: remoteTrack?.image || localTrack?.image || '',

    summary:
      Array.isArray(remoteTrack?.summary) && remoteTrack.summary.length
        ? remoteTrack.summary
        : localTrack?.summary || [],

    highlights:
      Array.isArray(remoteTrack?.highlights) && remoteTrack.highlights.length
        ? remoteTrack.highlights
        : localTrack?.highlights || [],

    sections:
      Array.isArray(remoteTrack?.sections) && remoteTrack.sections.length
        ? remoteTrack.sections
        : localTrack?.sections || [],
  };
}

function handleImageError(event, fallbackSrc) {
  const img = event.currentTarget;

  if (img.dataset.fallbackApplied === '1') {
    img.style.display = 'none';
    return;
  }

  img.dataset.fallbackApplied = '1';
  if (fallbackSrc) {
    img.src = fallbackSrc;
  } else {
    img.style.display = 'none';
  }
}

export default function ContentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const fallbackItem = contentMap[slug] || null;

  const [item, setItem] = useState(() => fallbackItem);
  const [loading, setLoading] = useState(!fallbackItem);

  useEffect(() => {
    let alive = true;

    setLoading(true);

    api
      .getTrackBySlug(slug)
      .then((data) => {
        if (!alive) return;
        setItem(mergeTrack(data, slug));
      })
      .catch(() => {
        if (!alive) return;
        setItem(mergeTrack(fallbackItem, slug));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading && !item) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold text-white">Carregando conteúdo</h1>
        <p className="mt-3 text-slate-300">Buscando os dados no Supabase...</p>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold text-white">Conteúdo não encontrado</h1>
        <p className="mt-3 text-slate-300">Essa página não existe na nova estrutura.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="secondary">Voltar</Button>
          <LinkButton to="/conteudos">Ver conteúdos</LinkButton>
        </div>
      </Card>
    );
  }

  const imageFallback = fallbackItem?.image || '';

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-5 p-6 sm:p-8 lg:p-10">
            <Badge>{item.shortTitle}</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {item.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300">
              {item.intro}
            </p>

            <div className="flex flex-wrap gap-3">
              <LinkButton to={`/quiz/${item.slug}`}>Ir para o quiz</LinkButton>
              <LinkButton to="/conteudos" variant="secondary">
                Voltar aos conteúdos
              </LinkButton>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(item.highlights || []).map((itemHighlight) => (
                <div
                  key={itemHighlight}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  {itemHighlight}
                </div>
              ))}
            </div>
          </div>

          <img
            src={item.image || imageFallback}
            alt={item.title}
            className="h-full min-h-[320px] w-full object-cover"
            loading="lazy"
            onError={(e) => handleImageError(e, imageFallback)}
          />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {(item.sections || []).map((section) => (
            <Card key={section.title}>
              <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-base leading-8 text-slate-300">{section.text}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Resumo rápido
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>• Leia o resumo antes de iniciar o quiz.</li>
              <li>• Observe os termos em destaque.</li>
              <li>• Use o resultado do quiz para revisar os pontos fracos.</li>
            </ul>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Próximo passo
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Depois de ler, faça o quiz do tema para fixar o conteúdo e conferir sua evolução.
            </p>
            <LinkButton to={`/quiz/${item.slug}`} className="mt-5 w-full">
              Começar quiz
            </LinkButton>
          </Card>
        </div>
      </div>
    </div>
  );
}