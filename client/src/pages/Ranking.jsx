import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, SectionTitle, LinkButton } from '../components/Ui';
import { api } from '../lib/api';

export default function Ranking() {
  const [category, setCategory] = useState('');
  const [rows, setRows] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.getQuizCatalog()
      .then((data) => {
        if (!alive) return;
        setCatalog(data || []);
      })
      .catch(() => {
        if (alive) setCatalog([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.ranking(category)
      .then((data) => {
        if (!alive) return;
        setRows(data);
        setError('');
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message || 'Não foi possível carregar o ranking.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [category]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Ranking"
        title="Pontuação mais clara e comparável"
        description="O ranking foi refeito para mostrar desempenho por tema e reduzir ruído visual."
      />

      <Card>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory('')} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === '' ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300'}`}>
            Geral
          </button>
          {catalog.map((item) => (
            <button key={item.slug} onClick={() => setCategory(item.slug)} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === item.slug ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-300'}`}>
              {item.title}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-white/10 px-5 py-4 text-sm text-slate-300">
          {category ? `Tema: ${catalog.find((item) => item.slug === category)?.title}` : 'Ranking geral'}
        </div>
        {loading ? (
          <div className="p-6 text-slate-300">Carregando ranking...</div>
        ) : error ? (
          <div className="p-6 text-rose-300">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-slate-300">
            Ninguém pontuou ainda. <Link to="/quiz" className="text-emerald-300 underline">Faça o primeiro quiz</Link>.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <div key={`${row.username}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 text-sm font-bold text-white">{index + 1}</div>
                  <div>
                    <div className="text-base font-semibold text-white">{row.username}</div>
                    <div className="text-sm text-slate-400">{row.quizzes} quiz(s)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-white">{row.score}</div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">pontos</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge>Consistência</Badge>
          <p className="mt-3 text-sm leading-7 text-slate-300">O ranking agora considera o melhor resultado por tema, evitando pontuação inflada por repetição.</p>
        </div>
        <LinkButton to="/quiz">Ir para o quiz</LinkButton>
      </Card>
    </div>
  );
}
