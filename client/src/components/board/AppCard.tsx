import { Draggable } from '@hello-pangea/dnd';
import { Application, STATUS_META } from '@/types';

interface AppCardProps {
  app: Application;
  index: number;
  onClick: (app: Application) => void;
}

export default function AppCard({ app, index, onClick }: AppCardProps) {
  const m = STATUS_META[app.status];
  const dateStr = new Date(app.dateApplied).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
  const daysAgo = Math.floor(
    (Date.now() - new Date(app.dateApplied).getTime()) / 86_400_000
  );
  const isStale = daysAgo > 14 && app.status === 'Applied';

  return (
    <Draggable draggableId={app._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(app)}
          className={`app-card ${snapshot.isDragging ? 'rotate-1 shadow-xl ring-2 ring-brand-400' : ''} ${
            isStale ? 'border-l-4 border-l-orange-400' : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                {app.company || '❓ Unknown Co.'}
              </p>
              <p className="text-xs text-slate-500 truncate">{app.role || 'Mystery Role'}</p>
            </div>
            <span className="text-xl flex-shrink-0">{m.emoji}</span>
          </div>

          {/* Skills preview */}
          {app.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {app.requiredSkills.slice(0, 3).map((s) => (
                <span key={s} className="skill-chip">{s}</span>
              ))}
              {app.requiredSkills.length > 3 && (
                <span className="text-xs text-slate-400">+{app.requiredSkills.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className="text-xs text-slate-400">
              {dateStr}
              {isStale && <span className="ml-1 text-orange-500">⏰ Follow up!</span>}
            </span>
            {app.salaryRange && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {app.salaryRange}
              </span>
            )}
          </div>

          {app.resumeSuggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-brand-600 dark:text-brand-400">
                ✨ {app.resumeSuggestions.length} resume bullets ready
              </p>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
