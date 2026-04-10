import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

interface FormValues { email: string; password: string; confirm: string }

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();

  const onSubmit = ({ email, password }: FormValues) => registerUser({ email, password });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-bounce-slow">🕵️</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Join the Hunt</h1>
          <p className="text-slate-500 text-sm mt-1">Track every application, ace every interview</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="future.employee@bigtech.com"
              {...register('email', { required: 'Email required' })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Something strong (not 'password123')"
              {...register('password', {
                required: 'Password required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              className="input"
              type="password"
              placeholder="Type it again, carefully"
              {...register('confirm', {
                required: 'Please confirm',
                validate: (v) => v === watch('password') || 'Passwords don\'t match! 🤦',
              })}
            />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
          </div>

          <button type="submit" disabled={isRegistering} className="btn-primary w-full flex items-center justify-center gap-2">
            {isRegistering ? <><Spinner size="sm" /> Creating account…</> : '🚀 Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already hunting?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
