import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Início' },
  { to: '/conteudos', label: 'Conteúdos' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/ranking', label: 'Ranking' },
];

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <img src="/logo.png" alt="Ecosystem" className="h-8 w-8 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Ecosystem</div>
            <div className="text-sm text-slate-300">Aprender com clareza</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white text-slate-950 shadow-glow' : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to={isLoggedIn ? '/perfil' : '/auth'}
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
          >
            {isLoggedIn ? user?.username || 'Perfil' : 'Entrar'}
          </NavLink>
          {isLoggedIn && (
            <button
              onClick={logout}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              Sair
            </button>
          )}
        </nav>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950/90 md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/8'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to={isLoggedIn ? '/perfil' : '/auth'} className="rounded-2xl bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-100">
              {isLoggedIn ? `Perfil · ${user?.username || 'usuário'}` : 'Entrar'}
            </NavLink>
            {isLoggedIn && (
              <button onClick={logout} className="rounded-2xl border border-white/10 px-4 py-3 text-left text-sm text-slate-300">
                Sair
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
