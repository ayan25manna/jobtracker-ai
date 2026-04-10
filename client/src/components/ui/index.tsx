import { ApplicationStatus, STATUS_META } from '@/types';
import { ReactNode } from 'react';

// ── Spinner ──────────────────────────────────────────────────────────────────
interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string }
export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div className={`${s} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin ${className}`} />
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
interface BadgeProps { status: ApplicationStatus }
export function StatusBadge({ status }: BadgeProps) {
  const m = STATUS_META[status];
  return (
    <span className={`badge ${m.bg} ${m.color} ${m.border} border ${m.darkBg}`}>
      <span>{m.emoji}</span> {status}
    </span>
  );
}

// ── Skill chip ───────────────────────────────────────────────────────────────
export function SkillChip({ label }: { label: string }) {
  return <span className="skill-chip">{label}</span>;
}

// ── Empty state ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}
export function EmptyState({ emoji, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-5xl animate-float">{emoji}</div>
      <p className="text-slate-700 dark:text-slate-300 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      {action}
    </div>
  );
}

// ── Full-page loader ──────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-4xl animate-bounce-slow">🚀</div>
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm">Loading your empire…</p>
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
      <span>💥</span> {message}
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
import { useState } from 'react';
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-1 flex-shrink-0"
    >
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
interface ModalProps { children: ReactNode; onClose: () => void; wide?: boolean }
export function Modal({ children, onClose, wide = false }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`card w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
interface Tab { id: string; label: string; badge?: number }
interface TabBarProps { tabs: Tab[]; active: string; onChange: (id: string) => void }
export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${
            active === t.id
              ? 'text-brand-600 border-b-2 border-brand-600 -mb-px'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.label}
          {t.badge !== undefined && t.badge > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-brand-100 text-brand-700 rounded-full">
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Dark mode toggle ──────────────────────────────────────────────────────────
import { useEffect } from 'react';
export function useDarkMode() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('jt-dark', dark ? '1' : '0');
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}
