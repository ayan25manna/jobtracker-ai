import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
  useParseJD,
  useSuggestBullets,
} from '@/hooks/useApplications';
import {
  Application,
  ApplicationStatus,
  COLUMNS,
  CreateApplicationInput,
  ParsedJob,
} from '@/types';
import {
  Modal,
  Spinner,
  TabBar,
  // StatusBadge,
  SkillChip,
  CopyButton,
  ErrorBanner,
} from '@/components/ui';

type Tab = 'details' | 'ai' | 'bullets';

interface Props {
  app?: Application | null;
  onClose: () => void;
}

type FormValues = Omit<CreateApplicationInput, 'requiredSkills' | 'niceToHaveSkills' | 'resumeSuggestions'> & {
  requiredSkillsRaw: string;
  niceToHaveSkillsRaw: string;
};

export default function AppModal({ app, onClose }: Props) {
  const isEdit = !!app;
  const [tab, setTab] = useState<Tab>('details');
  const [jdText, setJdText] = useState('');
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);
  const [bullets, setBullets] = useState<string[]>(app?.resumeSuggestions ?? []);
  const [aiError, setAiError] = useState('');

  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const deleteApp = useDeleteApplication();
  const parseJD = useParseJD();
  const suggestBullets = useSuggestBullets();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      company: app?.company ?? '',
      role: app?.role ?? '',
      jdLink: app?.jdLink ?? '',
      notes: app?.notes ?? '',
      dateApplied: app?.dateApplied
        ? new Date(app.dateApplied).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      status: app?.status ?? 'Applied',
      salaryRange: app?.salaryRange ?? '',
      location: app?.location ?? '',
      seniority: app?.seniority ?? '',
      requiredSkillsRaw: app?.requiredSkills.join(', ') ?? '',
      niceToHaveSkillsRaw: app?.niceToHaveSkills.join(', ') ?? '',
    },
  });

  // When AI parses a JD, fill form fields
  useEffect(() => {
    if (!parsedJob) return;
    setValue('company', parsedJob.company);
    setValue('role', parsedJob.role);
    setValue('seniority', parsedJob.seniority);
    setValue('location', parsedJob.location);
    setValue('salaryRange', parsedJob.salaryRange);
    setValue('requiredSkillsRaw', parsedJob.requiredSkills.join(', '));
    setValue('niceToHaveSkillsRaw', parsedJob.niceToHaveSkills.join(', '));
  }, [parsedJob, setValue]);

  async function handleParse() {
    if (!jdText.trim()) return;
    setAiError('');
    try {
      const result = await parseJD.mutateAsync(jdText);
      setParsedJob(result);
      // Auto-generate bullets right after parsing
      const b = await suggestBullets.mutateAsync(result);
      setBullets(b);
      setTab('details');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI failed. Try again.';
      setAiError(msg);
    }
  }

  async function onSubmit(values: FormValues) {
    const payload: CreateApplicationInput = {
      company: values.company,
      role: values.role,
      jdLink: values.jdLink,
      notes: values.notes,
      dateApplied: values.dateApplied,
      status: values.status as ApplicationStatus,
      salaryRange: values.salaryRange,
      location: values.location,
      seniority: values.seniority,
      requiredSkills: values.requiredSkillsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      niceToHaveSkills: values.niceToHaveSkillsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      resumeSuggestions: bullets,
    };

    if (isEdit && app) {
      await updateApp.mutateAsync({ id: app._id, data: payload });
    } else {
      await createApp.mutateAsync(payload);
    }
    onClose();
  }

  async function handleDelete() {
    if (!app) return;
    if (!window.confirm('Delete this application? No take-backs! 🗑️')) return;
    await deleteApp.mutateAsync(app._id);
    onClose();
  }

  const isSaving = createApp.isPending || updateApp.isPending;
  const isParsing = parseJD.isPending;
  const isSuggesting = suggestBullets.isPending;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'details', label: '📋 Details' },
    { id: 'ai', label: '🤖 AI Parse' },
    { id: 'bullets', label: '✨ Bullets', badge: bullets.length },
  ];

  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEdit ? `✏️ ${app.company} — ${app.role}` : '➕ New Application'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <TabBar tabs={tabs} active={tab} onChange={(t) => setTab(t as Tab)} />

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── DETAILS TAB ── */}
          {tab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Company *</label>
                  <input
                    className="input"
                    placeholder="Google, Meta, Your Dream Co."
                    {...register('company', { required: 'Company required' })}
                  />
                  {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
                </div>
                <div>
                  <label className="label">Role *</label>
                  <input
                    className="input"
                    placeholder="Senior Engineer, PM, Designer…"
                    {...register('role', { required: 'Role required' })}
                  />
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Seniority</label>
                  <input className="input" placeholder="Senior" {...register('seniority')} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" placeholder="Remote / NYC" {...register('location')} />
                </div>
                <div>
                  <label className="label">Salary Range</label>
                  <input className="input" placeholder="$150k–$200k" {...register('salaryRange')} />
                </div>
              </div>

              <div>
                <label className="label">Required Skills (comma-separated)</label>
                <input
                  className="input"
                  placeholder="React, TypeScript, Node.js"
                  {...register('requiredSkillsRaw')}
                />
                {watch('requiredSkillsRaw') && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {watch('requiredSkillsRaw')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s) => <SkillChip key={s} label={s} />)}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Nice-to-Have Skills</label>
                <input
                  className="input"
                  placeholder="GraphQL, Docker, AWS"
                  {...register('niceToHaveSkillsRaw')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date Applied</label>
                  <input className="input" type="date" {...register('dateApplied')} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" {...register('status')}>
                    {COLUMNS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">JD Link</label>
                <input className="input" type="url" placeholder="https://jobs.company.com/…" {...register('jdLink')} />
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Referral from Alex, recruiter name, anything…"
                  {...register('notes')}
                />
              </div>
            </div>
          )}

          {/* ── AI TAB ── */}
          {tab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 text-sm text-brand-700 dark:text-brand-300">
                <p className="font-medium mb-1">🤖 How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-brand-600 dark:text-brand-400">
                  <li>Paste the full job description below</li>
                  <li>Hit "Parse with AI" — we extract all the details</li>
                  <li>Fields auto-fill + 4 resume bullets are generated</li>
                  <li>Switch to Details tab to review and save</li>
                </ol>
              </div>

              <div>
                <label className="label">Job Description</label>
                <textarea
                  className="input resize-none font-mono text-xs"
                  rows={12}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the entire job posting here…

We are looking for a Senior Frontend Engineer to join our team…"
                />
              </div>

              {aiError && <ErrorBanner message={aiError} />}

              {parsedJob && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-sm">
                  <p className="font-medium text-green-700 dark:text-green-400 mb-2">
                    ✅ Parsed! Here's what we found:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-green-600 dark:text-green-500">
                    <span>🏢 {parsedJob.company || '—'}</span>
                    <span>💼 {parsedJob.role || '—'}</span>
                    <span>📍 {parsedJob.location || '—'}</span>
                    <span>⭐ {parsedJob.seniority || '—'}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleParse}
                disabled={isParsing || isSuggesting || !jdText.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isParsing ? (
                  <><Spinner size="sm" /> Parsing job description…</>
                ) : isSuggesting ? (
                  <><Spinner size="sm" /> Generating resume bullets…</>
                ) : (
                  '🤖 Parse with AI'
                )}
              </button>
            </div>
          )}

          {/* ── BULLETS TAB ── */}
          {tab === 'bullets' && (
            <div className="space-y-3">
              {bullets.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3 animate-float">✨</div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No bullets yet</p>
                  <p className="text-sm text-slate-500 mt-1">Go to the AI Parse tab and paste a job description</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-3">
                    {bullets.length} AI-generated bullets tailored to this role. Click Copy to grab any one.
                  </p>
                  {bullets.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3"
                    >
                      <span className="text-brand-400 font-bold text-sm flex-shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">
                        {b}
                      </p>
                      <CopyButton text={b} />
                    </div>
                  ))}

                  {parsedJob && (
                    <button
                      type="button"
                      onClick={async () => {
                        const b = await suggestBullets.mutateAsync(parsedJob);
                        setBullets(b);
                      }}
                      disabled={isSuggesting}
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                    >
                      {isSuggesting ? <><Spinner size="sm" /> Regenerating…</> : '🔄 Regenerate Bullets'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteApp.isPending}
                  className="btn-danger text-sm"
                >
                  {deleteApp.isPending ? 'Deleting…' : '🗑️ Delete'}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary text-sm">
                Cancel
              </button>
              {tab !== 'ai' && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {isSaving ? <><Spinner size="sm" /> Saving…</> : isEdit ? '💾 Save Changes' : '🚀 Add Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
