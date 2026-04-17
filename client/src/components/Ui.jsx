import { Link } from 'react-router-dom';
export function SectionTitle({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-7 text-slate-300">{description}</p>}
    </div>
  );
}

export function Card({ className = '', children }) {
  return <div className={`rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur ${className}`}>{children}</div>;
}

export function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 ${className}`}>{children}</span>;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60';
  const styles = {
    primary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
    secondary: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
    ghost: 'text-slate-200 hover:bg-white/8',
  };
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ to, children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60';
  const styles = {
    primary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
    secondary: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
    ghost: 'text-slate-200 hover:bg-white/8',
  };
  return (
    <Link to={to} className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function ArrowLink({ children, className = '', ...props }) {
  return (
    <a className={`inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200 ${className}`} {...props}>
      {children} <span aria-hidden>→</span>
    </a>
  );
}
