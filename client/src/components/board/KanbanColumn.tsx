import { Droppable } from '@hello-pangea/dnd';
import { Application, ApplicationStatus, STATUS_META } from '@/types';
import AppCard from './AppCard';
// import { EmptyState } from '@/components/ui';

interface KanbanColumnProps {
  status: ApplicationStatus;
  apps: Application[];
  onCardClick: (app: Application) => void;
}

export default function KanbanColumn({ status, apps, onCardClick }: KanbanColumnProps) {
  const m = STATUS_META[status];

  return (
    <div className="kanban-col">
      {/* Column header */}
      <div className={`flex items-center justify-between px-1 pb-2 border-b border-slate-200 dark:border-slate-700`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{m.emoji}</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{status}</span>
        </div>
        <span className={`badge ${m.bg} ${m.color} ${m.border} border text-xs px-2 py-0.5 rounded-full`}>
          {apps.length}
        </span>
      </div>

      {/* Cards drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 min-h-[200px] rounded-xl transition-colors duration-150 ${
              snapshot.isDraggingOver ? `${m.bg} ${m.darkBg}` : ''
            }`}
          >
            {apps.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <div className="text-3xl mb-2 opacity-40">{m.emoji}</div>
                <p className="text-xs text-slate-400 text-center">Drop cards here</p>
              </div>
            )}

            {apps.map((app, idx) => (
              <AppCard
                key={app._id}
                app={app}
                index={idx}
                onClick={onCardClick}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
