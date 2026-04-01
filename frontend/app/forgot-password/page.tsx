'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Loader2, AlertCircle, Copy, CheckCircle, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [copied, setCopied]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setSubmitting(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: email.trim() });
      if (data.reset_url) {
        setResetUrl(data.reset_url);
      } else {
        // Email not found — backend returns blank reset_url but still 200
        setResetUrl('');
        setError('No account found with that email address.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/8 rounded-full blur-[150px]" />
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
          <Link href="/login"
            className="inline-flex items-center gap-1.5 text-sm mb-6 hover:text-white transition"
            style={{ color: '#6b7280' }}>
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>

          <div className="bg-[#111111] rounded-2xl border border-white/10 p-7">
            {!resetUrl ? (
              <>
                <div className="w-11 h-11 bg-amber-500/15 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>Forgot password?</h1>
                <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                  Enter your registered email and we&apos;ll generate a reset link for you.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4b5563' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition placeholder-gray-600"
                        style={{ color: '#ffffff' }}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black py-3 rounded-lg text-sm font-semibold hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Generating link...</>
                      : 'Generate Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              /* ── Success state: show reset link ── */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <div className="w-11 h-11 bg-emerald-500/15 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>Reset link ready</h2>
                <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
                  Copy the link below and open it in your browser to set a new password. This link
                  expires in <span style={{ color: '#fbbf24' }}>1 hour</span>.
                </p>

                {/* Reset link box */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg mb-4 flex items-start gap-2">
                  <LinkIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs break-all flex-1" style={{ color: '#9ca3af' }}>{resetUrl}</p>
                </div>

                <div className="flex gap-2 mb-6">
                  <button onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                  <Link href={resetUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition">
                    Open link
                  </Link>
                </div>

                <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-lg">
                  <p className="text-xs" style={{ color: '#fbbf24' }}>
                    In a production environment this link would be emailed to you automatically.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
