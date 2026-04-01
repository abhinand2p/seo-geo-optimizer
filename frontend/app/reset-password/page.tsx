'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [done, setDone]             = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid reset link. Please request a new one.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        new_password: password,
      });
      setDone(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.replace('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  // Password strength
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][score];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/8 rounded-full blur-[150px]" />
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

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#111111] rounded-2xl border border-white/10 p-7">
            {done ? (
              /* ── Success state ── */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Password updated!</h2>
                <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                  Your password has been changed. Redirecting you to login...
                </p>
                <Link href="/login"
                  className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition">
                  Go to Login
                </Link>
              </motion.div>
            ) : (
              /* ── Form ── */
              <>
                <div className="w-11 h-11 bg-emerald-500/15 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>Set new password</h1>
                <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                  Choose a strong password for your account.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                  </div>
                )}

                {!token ? (
                  <div className="text-center mt-4">
                    <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: '#34d399' }}>
                      Request a new reset link
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* New password */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                        New password (min 8 chars)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4b5563' }} />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          autoComplete="new-password"
                          className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          style={{ color: '#ffffff' }}
                        />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                          style={{ color: '#4b5563' }}>
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="h-1 flex-1 rounded-full transition-all"
                                style={{ background: i <= score ? strengthColor : 'rgba(255,255,255,0.08)' }} />
                            ))}
                          </div>
                          <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="mb-6">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                        Confirm new password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4b5563' }} />
                        <input
                          type={showConf ? 'text' : 'password'}
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          autoComplete="new-password"
                          className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          style={{ color: '#ffffff' }}
                        />
                        <button type="button" onClick={() => setShowConf(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                          style={{ color: '#4b5563' }}>
                          {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirm && password !== confirm && (
                        <p className="text-xs mt-1" style={{ color: '#f87171' }}>Passwords do not match</p>
                      )}
                      {confirm && password === confirm && confirm.length >= 8 && (
                        <p className="text-xs mt-1" style={{ color: '#34d399' }}>Passwords match ✓</p>
                      )}
                    </div>

                    <button type="submit" disabled={submitting || !token}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                      {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                        : 'Update Password'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
