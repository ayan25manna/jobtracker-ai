import { Application, STATUS_META } from '@/types';
import { Modal, StatusBadge, SkillChip, CopyButton } from '@/components/ui';

interface Props {
  app: Application;
  onClose: () => void;
  onEdit: () => void;
}

export default function DetailModal({ app, onClose, onEdit }: Props) {
  const m = STATUS_META[app.status];
  const dateStr = new Date(app.dateApplied).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {m.emoji} {app.company}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">{app.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="btn-secondary text-sm">✏️ Edit</button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-2">×</button>
          </div>
        </div>

        {/* Status + meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={app.status} />
          {app.seniority && (
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              ⭐ {app.seniority}
            </span>
          )}
          {app.location && (
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              📍 {app.location}
            </span>
          )}
          {app.salaryRange && (
            <span className="badge bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200">
              💰 {app.salaryRange}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-5">Applied on {dateStr}</p>

        {/* Skills */}
        {app.requiredSkills.length > 0 && (
          <div className="mb-4">
            <p className="label mb-2">Required skills</p>
            <div className="flex flex-wrap gap-1.5">
              {app.requiredSkills.map((s) => <SkillChip key={s} label={s} />)}
            </div>
          </div>
        )}
        {app.niceToHaveSkills.length > 0 && (
          <div className="mb-4">
            <p className="label mb-2">Nice-to-have</p>
            <div className="flex flex-wrap gap-1.5">
              {app.niceToHaveSkills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {app.notes && (
          <div className="mb-4">
            <p className="label mb-1">Notes</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 leading-relaxed">
              {app.notes}
            </p>
          </div>
        )}

        {/* JD Link */}
        {app.jdLink && (
          <div className="mb-4">
            <p className="label mb-1">Job posting</p>
            <a
              href={app.jdLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:text-brand-700 underline break-all"
            >
              {app.jdLink}
            </a>
          </div>
        )}

        {/* Resume bullets */}
        {app.resumeSuggestions.length > 0 && (
          <div>
            <p className="label mb-2">✨ Resume bullets ({app.resumeSuggestions.length})</p>
            <div className="space-y-2">
              {app.resumeSuggestions.map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3">
                  <span className="text-brand-400 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">{b}</p>
                  <CopyButton text={b} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
