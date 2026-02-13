'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe, Loader2, AlertCircle, CheckCircle, TrendingUp,
  FileText, AlertTriangle, Info, Sparkles, BarChart3, Menu, X
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface IssueItem {
  severity: string;
  category: string;
  title: string;
  description: string;
}

interface SuggestionItem {
  priority: string;
  title: string;
  description: string;
  impact: string;
}

interface AuditResults {
  success: boolean;
  domain: string;
  pages_analyzed: number;
  overall_score: number;
  seo_score: number;
  design_score: number;
  content_score: number;
  total_issues: number;
  critical_issues: number;
  warnings: number;
  issues: IssueItem[];
  suggestions: SuggestionItem[];
  screenshot_url?: string;
  seo_analysis: any;
  design_analysis: any;
  content_analysis: any;
}

export default function SiteAuditPage() {
  const [url, setUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'seo' | 'design' | 'content'>('seo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleUrlSubmit = () => {
    if (!url.trim() || !url.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setShowModal(true);
    setError('');
  };

  const analyzeSite = async () => {
    if (!userName.trim() || !userRole.trim() || !userEmail.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setShowModal(false);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/site-audit/analyze`, {
        url: url,
        depth: 5,
        include_screenshot: true,
        user_name: userName,
        user_role: userRole,
        user_email: userEmail,
      });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze site. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/10 text-gray-400 border-white/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-white/10 text-gray-400 border-white/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 80) return '#34d399';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                SEO<span style={{ color: '#34d399' }}>&</span>GEO
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: '#d1d5db' }}>
                Home
              </Link>
              <Link href="/keywords" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: '#d1d5db' }}>
                Keywords
              </Link>
              <Link href="/content" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: '#d1d5db' }}>
                Content
              </Link>
              <Link href="/optimizer" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: '#d1d5db' }}>
                Optimizer
              </Link>
              <Link href="/audit" className="text-sm px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg">
                Site Audit
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center"
              style={{ color: '#ffffff' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-white/10 mt-4">
              <Link href="/" className="block py-2" style={{ color: '#ffffff' }}>Home</Link>
              <Link href="/keywords" className="block py-2" style={{ color: '#ffffff' }}>Keywords</Link>
              <Link href="/content" className="block py-2" style={{ color: '#ffffff' }}>Content</Link>
              <Link href="/optimizer" className="block py-2" style={{ color: '#ffffff' }}>Optimizer</Link>
              <Link href="/audit" className="block py-2" style={{ color: '#34d399' }}>Site Audit</Link>
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Form - if no results and not loading */}
        {!results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Title */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#ffffff' }}>
                    AI Site Audit
                  </h1>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>
                    Comprehensive website analysis powered by AI
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                  Analyze Your Website
                </h2>
              </div>
              <p className="mb-6" style={{ color: '#9ca3af' }}>
                Get a comprehensive AI-powered analysis of your website's SEO, design, and content quality.
                Receive actionable insights and improvement suggestions.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                  Website URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-500"
                  style={{ color: '#ffffff' }}
                />
              </div>

              <button
                onClick={handleUrlSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-400 text-black py-4 rounded-lg font-semibold text-lg hover:from-emerald-400 hover:to-green-300 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Analyze Website
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] rounded-2xl border border-white/10 p-12 text-center"
          >
            <Loader2 className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
              Analyzing Your Website...
            </h3>
            <p style={{ color: '#9ca3af' }}>
              This may take 30-60 seconds. We're checking SEO, design, content quality, and more.
            </p>
          </motion.div>
        )}

        {/* Lead Capture Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111111] rounded-2xl border border-white/10 max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                  Almost there!
                </h3>
                <p style={{ color: '#9ca3af' }}>
                  Please provide your details to receive your personalized website audit report.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-500"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="Marketing Manager"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-500"
                    style={{ color: '#ffffff' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-500"
                    style={{ color: '#ffffff' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 font-semibold transition"
                  style={{ color: '#ffffff' }}
                >
                  Cancel
                </button>
                <button
                  onClick={analyzeSite}
                  className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 font-semibold transition"
                >
                  Start Analysis
                </button>
              </div>

              <p className="text-xs mt-4 text-center" style={{ color: '#6b7280' }}>
                Your information is used solely for providing your audit report.
              </p>
            </motion.div>
          </div>
        )}

        {/* Results Dashboard */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Score Gauge */}
              <div className="bg-[#111111] rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl mb-6" style={{ color: '#ffffff' }}>Your site score</h3>
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#1f2937"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={getScoreStrokeColor(results.overall_score)}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={553}
                      strokeDashoffset={553 - (results.overall_score / 100) * 553}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreColor(results.overall_score)}`}>
                      {results.overall_score}
                    </span>
                    <span style={{ color: '#9ca3af' }}>/100</span>
                  </div>
                </div>
              </div>

              {/* Right: Current Status */}
              <div className="bg-[#111111] rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl mb-6" style={{ color: '#ffffff' }}>Current Status</h3>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-red-400">
                    {results.total_issues}+
                  </div>
                  <p className="text-red-400 mt-2">issues found</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-blue-400">{results.seo_score}</div>
                    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>SEO</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-purple-400">{results.design_score}</div>
                    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>Design</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-400">{results.content_score}</div>
                    <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>Content</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Summary */}
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
                Issues found on your site may affect user experience
              </h2>
              <p className="mb-6" style={{ color: '#9ca3af' }}>
                {results.overall_score >= 80
                  ? "Your site is performing well! Review the suggestions below for further optimization."
                  : results.overall_score >= 50
                  ? "You have a strong base, but clarity and flow need work."
                  : "Significant improvements needed. Focus on critical issues first."}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span style={{ color: '#d1d5db' }}>Access the complete breakdown with detailed scoring.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span style={{ color: '#d1d5db' }}>Get a clear to-do list of what needs to be improved.</span>
                </li>
              </ul>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-indigo-500 rounded-lg hover:bg-indigo-500/10 font-semibold transition"
                style={{ color: '#818cf8' }}
              >
                Analyze Another Site
              </button>
            </div>

            {/* Detailed Analysis Tabs */}
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#ffffff' }}>Detailed Analysis</h2>

              {/* Tab Buttons */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTab === 'seo'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  style={{ color: activeTab === 'seo' ? undefined : '#ffffff' }}
                >
                  SEO Analysis
                </button>
                <button
                  onClick={() => setActiveTab('design')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTab === 'design'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  style={{ color: activeTab === 'design' ? undefined : '#ffffff' }}
                >
                  Design & Performance
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTab === 'content'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  style={{ color: activeTab === 'content' ? undefined : '#ffffff' }}
                >
                  Content Quality
                </button>
              </div>

              {/* Tab Content - Issues by Category */}
              <div className="space-y-3">
                {results.issues
                  .filter((issue) => issue.category === activeTab)
                  .map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-l-4 ${
                        issue.severity === 'critical'
                          ? 'border-l-red-500 bg-red-500/10'
                          : issue.severity === 'warning'
                          ? 'border-l-amber-500 bg-amber-500/10'
                          : 'border-l-blue-500 bg-blue-500/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={
                            issue.severity === 'critical'
                              ? 'text-red-400'
                              : issue.severity === 'warning'
                              ? 'text-amber-400'
                              : 'text-blue-400'
                          }
                        >
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold" style={{ color: '#ffffff' }}>{issue.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: '#9ca3af' }}>{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                {results.issues.filter((issue) => issue.category === activeTab).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p style={{ color: '#9ca3af' }}>No issues found in this category! Great work!</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#ffffff' }}>
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                AI-Powered Suggestions
              </h2>
              <p className="mb-6" style={{ color: '#9ca3af' }}>
                Our AI analyzed your site and generated these prioritized recommendations:
              </p>
              <div className="space-y-4">
                {results.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 rounded-xl p-5 hover:bg-white/5 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold" style={{ color: '#ffffff' }}>{suggestion.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority} priority
                          </span>
                        </div>
                        <p className="mb-3" style={{ color: '#9ca3af' }}>{suggestion.description}</p>
                        <div className="flex items-center gap-2 text-sm bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg inline-flex">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span style={{ color: '#34d399' }}>{suggestion.impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
