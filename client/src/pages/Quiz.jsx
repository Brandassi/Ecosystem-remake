import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, SectionTitle, LinkButton } from '../components/Ui';
import { quizzes as fallbackQuizzes, quizCategories as fallbackCategories } from '../data/quizzes';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function getStoredHistory() {
  try {
    return JSON.parse(localStorage.getItem('guestScores') || '[]');
  } catch {
    return [];
  }
}

export default function Quiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [catalog, setCatalog] = useState(fallbackCategories);
  const [loadedQuiz, setLoadedQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(Boolean(slug));

  useEffect(() => {
    let alive = true;
    api.getQuizCatalog()
      .then((data) => {
        if (!alive) return;
        setCatalog(data?.length ? data : fallbackCategories);
      })
      .catch(() => {
        if (alive) setCatalog(fallbackCategories);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoadedQuiz(null);
      setLoadingQuiz(false);
      return;
    }

    let alive = true;
    setLoadingQuiz(true);

    api.getQuizBySlug(slug)
      .then((data) => {
        if (!alive) return;
        if (data) {
          setLoadedQuiz(data);
        } else {
          const fallback = fallbackQuizzes[slug];
          setLoadedQuiz(
            fallback
              ? {
                  slug,
                  title: fallbackCategories.find((item) => item.slug === slug)?.title || slug,
                  description: fallbackCategories.find((item) => item.slug === slug)?.description || '',
                  questions: fallback.map((item) => ({
                    question: item.question,
                    options: item.options,
                    answer: item.answer,
                    explanation: item.explanation,
                  })),
                }
              : null
          );
        }
      })
      .catch(() => {
        if (!alive) return;
        const fallback = fallbackQuizzes[slug];
        setLoadedQuiz(
          fallback
            ? {
                slug,
                title: fallbackCategories.find((item) => item.slug === slug)?.title || slug,
                description: fallbackCategories.find((item) => item.slug === slug)?.description || '',
                questions: fallback.map((item) => ({
                  question: item.question,
                  options: item.options,
                  answer: item.answer,
                  explanation: item.explanation,
                })),
              }
            : null
        );
      })
      .finally(() => {
        if (alive) setLoadingQuiz(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  if (!slug) {
    return (
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Quiz"
          title="Escolha um tema e comece"
          description="A experiência foi reorganizada para ser simples: selecione a trilha, responda, veja o resultado e acompanhe o ranking."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {catalog.map((item) => (
            <Card key={item.slug} className="flex h-full flex-col">
              <Badge>{item.title}</Badge>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.description}</p>
              <div className="mt-6 flex gap-3">
                <LinkButton to={`/quiz/${item.slug}`} variant="primary" className="w-full flex-1">Iniciar</LinkButton>
                <LinkButton to={`/conteudos/${item.slug}`} variant="secondary" className="w-full flex-1">Ler</LinkButton>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (loadingQuiz && !loadedQuiz) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold text-white">Carregando quiz</h1>
        <p className="mt-3 text-slate-300">Buscando perguntas no Supabase...</p>
      </Card>
    );
  }

  if (!loadedQuiz) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold text-white">Quiz não encontrado</h1>
        <p className="mt-3 text-slate-300">Esse tema não existe na nova estrutura.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/quiz')}>Voltar</Button>
        </div>
      </Card>
    );
  }

  return <QuizRunner quiz={loadedQuiz} onExit={() => navigate('/quiz')} isLoggedIn={isLoggedIn} />;
}

function QuizRunner({ quiz, onExit, isLoggedIn }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  const current = quiz.questions[index];
  const total = quiz.questions.length;
  const score = useMemo(
    () => answers.filter((value, i) => value === quiz.questions[i]?.answer).length,
    [answers, quiz.questions]
  );
  const percentage = total ? Math.round((score / total) * 100) : 0;

  const finishQuiz = async (finalAnswers) => {
    const finalScore = finalAnswers.filter((value, i) => value === quiz.questions[i]?.answer).length;
    setFinished(true);

    const payload = {
      category: quiz.slug,
      score: finalScore,
      totalQuestions: total,
      answers: finalAnswers,
    };

    if (isLoggedIn) {
      try {
        setSaving(true);
        setSaveError('');
        await api.saveScore(payload);
        setSaveOk(true);
      } catch (error) {
        setSaveError(error.message || 'Não foi possível salvar a pontuação.');
      } finally {
        setSaving(false);
      }
    } else {
      const history = getStoredHistory();
      history.unshift({ ...payload, createdAt: new Date().toISOString() });
      localStorage.setItem('guestScores', JSON.stringify(history.slice(0, 10)));
      setSaveOk(true);
    }
  };

  const choose = (optionIndex) => {
    if (finished || selected !== null) return;
    setSelected(optionIndex);
    const nextAnswers = [...answers];
    nextAnswers[index] = optionIndex;
    setAnswers(nextAnswers);
  };

  const next = async () => {
    if (selected === null) return;
    const nextAnswers = [...answers];
    nextAnswers[index] = selected;
    const nextIndex = index + 1;
    if (nextIndex < total) {
      setAnswers(nextAnswers);
      setIndex(nextIndex);
      setSelected(null);
    } else {
      setAnswers(nextAnswers);
      await finishQuiz(nextAnswers);
    }
  };

  if (finished) {
    const review = quiz.questions.map((q, i) => ({ ...q, chosen: answers[i], right: q.answer }));
    return (
      <div className="space-y-8">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge>{quiz.title}</Badge>
              <h1 className="mt-4 text-4xl font-semibold text-white">Resultado do quiz</h1>
              <p className="mt-3 text-slate-300">Você concluiu a trilha e agora pode revisar as respostas e continuar estudando.</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/70 px-6 py-5 text-center">
              <div className="text-5xl font-semibold text-white">{score}/{total}</div>
              <p className="mt-2 text-sm text-slate-400">{percentage}% de acerto</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton to={`/conteudos/${quiz.slug}`} variant="secondary">Revisar conteúdo</LinkButton>
            <Button onClick={() => window.location.reload()}>Refazer quiz</Button>
            <Button variant="secondary" onClick={onExit}>Trocar de tema</Button>
          </div>
          {saving && <p className="mt-4 text-sm text-slate-300">Salvando resultado...</p>}
          {saveOk && <p className="mt-4 text-sm text-emerald-300">Resultado registrado com sucesso.</p>}
          {saveError && <p className="mt-4 text-sm text-rose-300">{saveError}</p>}
        </Card>

        <div className="grid gap-4">
          {review.map((item, i) => {
            const correct = item.chosen === item.right;
            return (
              <Card key={item.question} className={correct ? 'border-emerald-400/20' : 'border-rose-400/20'}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Pergunta {i + 1}</p>
                    <h2 className="mt-2 text-lg font-semibold text-white">{item.question}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${correct ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                    {correct ? 'Acertou' : 'Errou'}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.explanation}</p>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const progress = total ? ((index + 1) / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Badge>{quiz.title}</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Quiz interativo</h1>
        </div>
        <Button variant="secondary" onClick={onExit}>Sair</Button>
      </div>

      <Card>
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>{index + 1} de {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="mt-6 text-2xl font-semibold text-white">{current.question}</h2>
        <div className="mt-6 grid gap-3">
          {current.options.map((option, optionIndex) => {
            const isChosen = selected === optionIndex;
            const isCorrect = current.answer === optionIndex;
            const finishedCurrent = selected !== null;
            const stateClass = !finishedCurrent
              ? 'border-white/10 bg-white/5 hover:bg-white/10'
              : isCorrect
                ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100'
                : isChosen
                  ? 'border-rose-400/40 bg-rose-400/15 text-rose-100'
                  : 'border-white/10 bg-white/5 text-slate-300';

            return (
              <button
                key={option}
                onClick={() => choose(optionIndex)}
                className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${stateClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-7 text-slate-300">
            {current.explanation}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-400">Pontuação parcial: {score}/{total}</div>
          <Button onClick={next} disabled={selected === null} className={selected === null ? 'cursor-not-allowed opacity-50' : ''}>
            {index + 1 === total ? 'Finalizar' : 'Próxima'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
