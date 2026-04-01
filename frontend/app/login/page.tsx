'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login, register, isAuthenticated, isLoading } = useAuth();

  const [tab, setTab] = useState<Tab>('login');

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign-up fields
  const [signupEmail, setSignupEmail]       = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm]   = useState('');
  const [signupName, setSignupName]         = useState('');

  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, isLoading, redirect, router]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields.'); return; }
    clearMessages();
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      router.replace(redirect);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Sign up ────────────────────────────────────────────────────────────────

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!signupEmail || !signupPassword || !signupConfirm) {
      setError('Please fill in all required fields.'); return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.'); return;
    }

    setSubmitting(true);
    try {
      await register(signupEmail, signupPassword, signupName || undefined);
      router.replace(redirect);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-base font-semibold" style={{ color: '#ffffff' }}>
            SEO<span style={{ color: '#34d399' }}>&</span>GEO
          </span>
        </Link>
      </header>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Tab switcher */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
            {(['login', 'signup'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); clearMessages(); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  tab === t ? 'bg-emerald-500 text-black' : 'hover:bg-white/5'
                }`}
                style={{ color: tab === t ? undefined : '#9ca3af' }}
              >
                {t === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="bg-[#111111] rounded-2xl border border-white/10 p-7">
            <AnimatePresence mode="wait">
              {/* ── Login form ── */}
              {tab === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                >
                  <h1 className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>Welcome back</h1>
                  <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Log in to your SEO & GEO account</p>

                  {error && <ErrorBanner message={error} />}

                  <div className="space-y-4 mb-5">
                    <Field
                      label="Email"
                      icon={<Mail className="w-4 h-4" />}
                      type="email"
                      value={loginEmail}
                      onChange={setLoginEmail}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    <PasswordField
                      label="Password"
                      value={loginPassword}
                      onChange={setLoginPassword}
                      show={showPassword}
                      onToggle={() => setShowPassword(v => !v)}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="text-right mb-5">
                    <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: '#34d399' }}>
                      Forgot password?
                    </Link>
                  </div>

                  <SubmitButton loading={submitting} label="Log In" />

                  <p className="text-center text-sm mt-5" style={{ color: '#6b7280' }}>
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => { setTab('signup'); clearMessages(); }}
                      className="hover:underline" style={{ color: '#34d399' }}>
                      Sign up
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── Sign-up form ── */}
              {tab === 'signup' && (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignup}
                >
                  <h1 className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>Create account</h1>
                  <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Start optimising with AI today</p>

                  {error && <ErrorBanner message={error} />}
                  {success && <SuccessBanner message={success} />}

                  <div className="space-y-4 mb-5">
                    <Field
                      label="Full name (optional)"
                      icon={<User className="w-4 h-4" />}
                      type="text"
                      value={signupName}
                      onChange={setSignupName}
                      placeholder="Jane Smith"
                      autoComplete="name"
                    />
                    <Field
                      label="Email *"
                      icon={<Mail className="w-4 h-4" />}
                      type="email"
                      value={signupEmail}
                      onChange={setSignupEmail}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    <PasswordField
                      label="Password * (min 8 chars)"
                      value={signupPassword}
                      onChange={setSignupPassword}
                      show={showPassword}
                      onToggle={() => setShowPassword(v => !v)}
                      autoComplete="new-password"
                    />
                    <PasswordField
                      label="Confirm password *"
                      value={signupConfirm}
                      onChange={setSignupConfirm}
                      show={showConfirm}
                      onToggle={() => setShowConfirm(v => !v)}
                      autoComplete="new-password"
                    />
                  </div>

                  {/* Password strength bar */}
                  {signupPassword && <PasswordStrength password={signupPassword} />}

                  <div className="mb-5" />
                  <SubmitButton loading={submitting} label="Create Account" />

                  <p className="text-center text-sm mt-5" style={{ color: '#6b7280' }}>
                    Already have an account?{' '}
                    <button type="button" onClick={() => { setTab('login'); clearMessages(); }}
                      className="hover:underline" style={{ color: '#34d399' }}>
                      Log in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Field({
  label, icon, type, value, onChange, placeholder, autoComplete,
}: {
  label: string; icon: React.ReactNode; type: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-600"
          style={{ color: '#ffffff' }}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }}>
          <Lock className="w-4 h-4" />
        </span>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          style={{ color: '#ffffff' }}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-300 transition"
          style={{ color: '#4b5563' }}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/]
    .filter(r => r.test(password)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  return (
    <div className="mb-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      {score > 0 && <p className="text-xs" style={{ color: colors[score] }}>{labels[score]}</p>}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
      {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{label}...</> : label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm" style={{ color: '#fca5a5' }}>{message}</p>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2">
      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm" style={{ color: '#6ee7b7' }}>{message}</p>
    </div>
  );
}
