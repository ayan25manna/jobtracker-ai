import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/components/ui';

interface NavbarProps {
  search: string;
  onSearch: (v: string) => void;
  onAdd: () => void;
}

export default function Navbar({ search, onSearch, onAdd }: NavbarProps) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const initials = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-4 h-14 flex items-center gap-3">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-4">
        <span className="text-2xl">🚀</span>
        <span className="font-bold text-slate-900 dark:text-white hidden sm:block">JobTracker AI</span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="🔍 Search companies, roles…"
        className="input flex-1 max-w-xs"
      />

      <div className="flex items-center gap-2 ml-auto">
        {/* Add button */}
        <button onClick={onAdd} className="btn-primary flex items-center gap-1.5 text-sm">
          <span>+</span>
          <span className="hidden sm:block">Add Application</span>
        </button>

        {/* Dark mode */}
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-lg"
          title="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
