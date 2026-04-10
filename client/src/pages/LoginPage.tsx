import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

interface FormValues { email: string; password: string }

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => login(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="card w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-float">🚀</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">JobTracker AI</h1>
          <p className="text-slate-500 text-sm mt-1">Your job hunt command center 🎯</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoggingIn} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoggingIn ? <><Spinner size="sm" /> Signing in…</> : '🔑 Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
            Create one free →
          </Link>
        </p>

        <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-xs text-slate-500 text-center">
          💡 Demo: register with any email + 6-char password
        </div>
      </div>
    </div>
  );
}
