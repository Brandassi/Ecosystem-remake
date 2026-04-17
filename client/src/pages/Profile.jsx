import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Badge, Button, Card, SectionTitle, LinkButton } from '../components/Ui';

export default function Profile() {
  const { user, logout, checking } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    api.meScores()
      .then(setScores)
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [user]);

  // 🔥 LOADING GLOBAL
  if (checking) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-white">Carregando perfil</h1>
        <p className="mt-3 text-slate-300">Conectando ao Supabase...</p>
      </Card>
    );
  }

  // 🔥 NÃO LOGADO (corrigido)
  if (!user) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-white">Área do usuário</h1>
        <p className="mt-3 text-slate-300">Entre para ver seu histórico de quizzes e pontuações.</p>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton to="/auth">Entrar</LinkButton>
          <LinkButton to="/quiz" variant="secondary">Fazer quiz</LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Perfil"
        title={`Olá, ${user.username || 'usuário'}`}
        description="Aqui você acompanha seus resultados recentes e seus caminhos de estudo."
      />

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge>Conta ativa</Badge>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Use o ranking para comparar seu progresso em cada tema.
          </p>
        </div>
        <div className="flex gap-3">
          <LinkButton to="/quiz">Fazer quiz</LinkButton>
          <Button
            variant="secondary"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            Sair
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-2xl font-semibold text-white">Histórico recente</h2>

          {loading ? (
            <p className="mt-4 text-slate-300">Carregando histórico...</p>
          ) : scores.length === 0 ? (
            <p className="mt-4 text-slate-300">Ainda não há resultados salvos.</p>
          ) : (
            <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
              {scores.map((item) => (
                <div
                  key={`${item.category}-${item.created_at}`}
                  className="flex items-center justify-between gap-3 bg-white/5 px-4 py-4 text-sm"
                >
                  <div>
                    <div className="font-semibold text-white">{item.category}</div>
                    <div className="text-slate-400">
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <div className="text-lg font-semibold">
                      {item.score}/{item.total_questions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-white">Próximos passos</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <li>• Leia o conteúdo antes de fazer o quiz.</li>
            <li>• Repita um tema para melhorar sua pontuação.</li>
            <li>• Compare sua evolução no ranking geral.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}