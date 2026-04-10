import { useState, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Application, ApplicationStatus, COLUMNS } from '@/types';
import { useApplications, useUpdateApplication } from '@/hooks/useApplications';
import KanbanColumn from '@/components/board/KanbanColumn';
import StatsBar from '@/components/board/StatsBar';
import Navbar from '@/components/Navbar';
import AppModal from '@/components/modals/AppModal';
import DetailModal from '@/components/modals/DetailModal';
import { PageLoader, EmptyState } from '@/components/ui';

export default function BoardPage() {
  const { data: apps = [], isLoading, isError } = useApplications();
  const updateApp = useUpdateApplication();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  // Filter apps by search
  const filtered = useMemo(() => {
    if (!search.trim()) return apps;
    const q = search.toLowerCase();
    return apps.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }, [apps, search]);

  // Group by status for columns
  const grouped = useMemo(
    () =>
      COLUMNS.reduce(
        (acc, col) => ({
          ...acc,
          [col]: filtered.filter((a) => a.status === col),
        }),
        {} as Record<ApplicationStatus, Application[]>
      ),
    [filtered]
  );

  function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as ApplicationStatus;
    const app = apps.find((a) => a._id === draggableId);
    if (!app || app.status === newStatus) return;

    // Optimistic update + persist
    updateApp.mutate({ id: draggableId, data: { status: newStatus } });
  }

  function handleCardClick(app: Application) {
    setDetailApp(app);
  }

  if (isLoading) return (
    <>
      <Navbar search={search} onSearch={setSearch} onAdd={() => setAddOpen(true)} />
      <PageLoader />
    </>
  );

  if (isError) return (
    <>
      <Navbar search={search} onSearch={setSearch} onAdd={() => setAddOpen(true)} />
      <div className="p-6">
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="text-5xl mb-4">💥</div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-500">
            Could not load your applications. Is the server running?
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar search={search} onSearch={setSearch} onAdd={() => setAddOpen(true)} />

      <main className="p-4">
        {/* Stats */}
        {apps.length > 0 && <StatsBar apps={apps} />}

        {/* Empty state */}
        {apps.length === 0 && (
          <EmptyState
            emoji="🎯"
            title="No applications yet!"
            subtitle="Start tracking your job hunt. Add your first application below."
            action={
              <button onClick={() => setAddOpen(true)} className="btn-primary">
                ➕ Add Application
              </button>
            }
          />
        )}

        {/* Board */}
        {apps.length > 0 && (
          <>
            {search && filtered.length === 0 && (
              <EmptyState
                emoji="🔍"
                title={`No results for "${search}"`}
                subtitle="Try a different company name or skill."
              />
            )}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col}
                    status={col}
                    apps={grouped[col]}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            </DragDropContext>
          </>
        )}
      </main>

      {/* Modals */}
      {addOpen && (
        <AppModal onClose={() => setAddOpen(false)} />
      )}

      {editApp && (
        <AppModal
          app={editApp}
          onClose={() => setEditApp(null)}
        />
      )}

      {detailApp && (
        <DetailModal
          app={detailApp}
          onClose={() => setDetailApp(null)}
          onEdit={() => {
            setEditApp(detailApp);
            setDetailApp(null);
          }}
        />
      )}
    </div>
  );
}
