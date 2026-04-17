import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, SectionTitle } from '../components/Ui';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      if (mode === 'register') {
        await register(form.email, form.password, form.username);
        setMessage('Cadastro concluído. Agora faça login com seu email.');
        setMode('login');
      } else {
        await login(form.email, form.password);
        navigate('/perfil');
      }
    } catch (err) {
      setError(err.message || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SectionTitle
        eyebrow="Conta"
        title="Entre ou cadastre-se"
        description="O login agora usa Supabase Auth e mantém seu progresso sincronizado com o ranking."
        align="center"
      />

      <Card>
        <div className="flex gap-2 rounded-full bg-white/5 p-1">
          <button onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-950' : 'text-slate-300'}`}>
            Login
          </button>
          <button onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'}`}>
            Cadastro
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Nome de usuário</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Seu nome público"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seuemail@exemplo.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Senha</span>
            <input
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Sua senha"
            />
          </label>

          {message && <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}
          {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>
      </Card>

      <Card>
        <Badge>Observação</Badge>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Os dados ficam no Supabase. Se você ativar confirmação de email, o cadastro vai exigir validação antes do primeiro login.
        </p>
      </Card>
    </div>
  );
}
