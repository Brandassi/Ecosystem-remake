import { useEffect, useState } from 'react';
import { Badge, Card, SectionTitle, LinkButton } from '../components/Ui';
import { studyTracks as fallbackTracks, contentMap } from '../data/content';
import { api } from '../lib/api';

function mergeTrack(track) {
  const localTrack = contentMap[track.slug] || null;

  return {
    ...localTrack,
    ...track,
    image: track.image || localTrack?.image || '',
    summary: Array.isArray(track.summary) && track.summary.length ? track.summary : localTrack?.summary || [],
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

export default function Contents() {
  const [tracks, setTracks] = useState(fallbackTracks);

  useEffect(() => {
    let alive = true;

    api
      .getTracks()
      .then((data) => {
        if (!alive) return;

        setTracks(
          data?.length ? data.map(mergeTrack) : fallbackTracks
        );
      })
      .catch(() => {
        if (alive) setTracks(fallbackTracks);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Conteúdos"
        title="Leitura mais leve, estrutura mais clara"
        description="As páginas foram reorganizadas para priorizar títulos, blocos curtos e resumos práticos."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {tracks.map((track) => {
          const fallbackImage = contentMap[track.slug]?.image || '';

          return (
            <Card key={track.slug} className="flex h-full flex-col overflow-hidden p-0">
              <img
                src={track.image || fallbackImage}
                alt={track.title}
                className="h-48 w-full object-cover"
                loading="lazy"
                onError={(e) => handleImageError(e, fallbackImage)}
              />
              <div className="flex flex-1 flex-col p-5">
                <Badge>{track.shortTitle}</Badge>
                <h2 className="mt-4 text-2xl font-semibold text-white">{track.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{track.intro}</p>
                <div className="mt-4 space-y-2">
                  {(track.summary || []).map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <LinkButton
                  to={`/conteudos/${track.slug}`}
                  variant="secondary"
                  className="mt-5 w-full"
                >
                  Ler conteúdo completo
                </LinkButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}