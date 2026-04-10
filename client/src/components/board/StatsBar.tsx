import { Application, COLUMNS, STATUS_META } from '@/types';

interface StatsBarProps { apps: Application[] }

export default function StatsBar({ apps }: StatsBarProps) {
  const total = apps.length;
  const offerRate = total
    ? Math.round((apps.filter((a) => a.status === 'Offer').length / total) * 100)
    : 0;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="card px-4 py-2 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{total}</p>
        </div>
      </div>

      {COLUMNS.map((col) => {
        const count = apps.filter((a) => a.status === col).length;
        const m = STATUS_META[col];
        return (
          <div key={col} className={`card px-4 py-2 flex items-center gap-2 ${m.bg} ${m.darkBg}`}>
            <span className="text-lg">{m.emoji}</span>
            <div>
              <p className={`text-xs ${m.color}`}>{col}</p>
              <p className={`text-lg font-bold ${m.color}`}>{count}</p>
            </div>
          </div>
        );
      })}

      <div className="card px-4 py-2 flex items-center gap-2 bg-green-50 dark:bg-green-900/20">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-xs text-green-700">Offer rate</p>
          <p className="text-lg font-bold text-green-700">{offerRate}%</p>
        </div>
      </div>
    </div>
  );
}
