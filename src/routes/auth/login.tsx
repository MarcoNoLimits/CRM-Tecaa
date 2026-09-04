import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/use-auth';
import { cn } from '../../lib/utils';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  type?: string;
  error?: string;
  placeholder?: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
}

function Field({ label, type = 'text', error, placeholder, registration }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-[510] text-text-secondary">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2.5 bg-bg-surface text-text-primary placeholder:text-text-quaternary',
          'border rounded-radius-md text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
          error ? 'border-error' : 'border-border-default hover:border-border-hover',
        )}
        {...registration}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

// ─── Login Form ──────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      await signIn(values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      if (msg.toLowerCase().includes('failed to fetch')) {
        setServerError(
          'Network error: Failed to connect to Supabase. If you are using an ad-blocker (uBlock, Brave Shields, AdGuard), please pause it for localhost:5173, or check your internet/VPN connection.',
        );
      } else {
        setServerError(msg);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field
        label="Email"
        type="email"
        placeholder="you@company.com"
        error={errors.email?.message}
        registration={register('email')}
      />
      <Field
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        registration={register('password')}
      />

      {serverError && (
        <div className="rounded-radius-md bg-error/10 border border-error/20 px-3 py-2.5 text-sm text-error">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'mt-1 w-full py-2.5 rounded-radius-md font-[510] text-sm transition-colors',
          'bg-accent text-bg-primary hover:bg-accent-hover',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-text-tertiary">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-accent hover:text-accent-hover font-[510]">
          Create account
        </button>
      </p>
    </form>
  );
}

// ─── Sign Up Form ─────────────────────────────────────────────────────────────

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpValues) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      await signUp(values.email, values.password, values.fullName);
      // Supabase may require email confirmation
      setSuccessMsg('Check your email to confirm your account, then sign in.');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field
        label="Full name"
        placeholder="Alex Johnson"
        error={errors.fullName?.message}
        registration={register('fullName')}
      />
      <Field
        label="Email"
        type="email"
        placeholder="you@company.com"
        error={errors.email?.message}
        registration={register('email')}
      />
      <Field
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        registration={register('password')}
      />

      {serverError && (
        <div className="rounded-radius-md bg-error/10 border border-error/20 px-3 py-2.5 text-sm text-error">
          {serverError}
        </div>
      )}
      {successMsg && (
        <div className="rounded-radius-md bg-success/10 border border-success/20 px-3 py-2.5 text-sm text-success">
          {successMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'mt-1 w-full py-2.5 rounded-radius-md font-[510] text-sm transition-colors',
          'bg-accent text-bg-primary hover:bg-accent-hover',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-text-tertiary">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-accent hover:text-accent-hover font-[510]">
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-border-default) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-default) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-radius-xl bg-accent mb-4">
            <span className="text-xl font-[590] text-bg-primary">T</span>
          </div>
          <h1 className="text-2xl font-[590] text-text-primary">CRM Tecaa</h1>
          <p className="text-sm text-text-tertiary mt-1">
            {mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-panel border border-border-default rounded-radius-xl p-6 shadow-lg">
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('signup')} />
          ) : (
            <SignUpForm onSwitch={() => setMode('login')} />
          )}
        </div>

        <p className="text-center text-xs text-text-quaternary mt-6">
          © {new Date().getFullYear()} Tecaa. All rights reserved.
        </p>
      </div>
    </div>
  );
}
