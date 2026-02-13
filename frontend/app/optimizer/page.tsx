'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Sparkles, Loader2, AlertCircle, Copy, Check,
  TrendingUp, ArrowRight, Menu, X
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface AnalysisResult {
  metrics: {
    word_count: number;
    character_count: number;
    sentence_count: number;
    paragraph_count: number;
    avg_sentence_length: number;
    reading_time_minutes: number;
  };
  seo_issues: Array<{ severity: string; issue: string; detail: string }>;
  geo_issues: Array<{ severity: string; issue: string; detail: string }>;
  keyword_analysis: { [key: string]: { count: number; density: number } };
  readability: { score: string };
  suggestions: string[];
  seo_score: number;
  geo_score: number;
}

interface OptimizationResult {
  success: boolean;
  original_content: string;
  seo_optimized?: string;
  geo_optimized?: string;
  seo_improvements?: string[];
  geo_improvements?: string[];
  seo_score_before?: number;
  geo_score_before?: number;
  seo_score_after?: number;
  geo_score_after?: number;
  original_word_count?: number;
  optimized_word_count?: number;
}

export default function ContentOptimizer() {
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [optimizationType, setOptimizationType] = useState('seo');
  const [preserveMeaning, setPreserveMeaning] = useState(true);
  const [tone, setTone] = useState('neutral');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'seo' | 'geo' | null>(null);
  const [activeTab, setActiveTab] = useState<'seo' | 'geo'>('seo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const analyzeContent = async () => {
    if (!content.trim()) {
      setError('Please enter content to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const keywordList = keywords.trim()
        ? keywords.split(',').map((k) => k.trim()).filter((k) => k)
        : null;

      const response = await axios.post(`${API_BASE_URL}/content/analyze`, {
        content: content.trim(),
        target_keywords: keywordList,
      });

      setAnalysis(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze content. Please try again.');
      console.error('Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const optimizeContent = async () => {
    if (!content.trim() || !keywords.trim()) {
      setError('Please enter both content and keywords');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const keywordList = keywords.split(',').map((k) => k.trim()).filter((k) => k);

      const response = await axios.post(`${API_BASE_URL}/content/optimize`, {
        content: content.trim(),
        target_keywords: keywordList,
        optimization_type: optimizationType,
        preserve_meaning: preserveMeaning,
        tone,
      });

      setResult(response.data);
      if (response.data.seo_optimized) {
        setActiveTab('seo');
      } else if (response.data.geo_optimized) {
        setActiveTab('geo');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to optimize content. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (type: 'seo' | 'geo') => {
    const textToCopy = type === 'seo' ? result?.seo_optimized : result?.geo_optimized;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/10 text-gray-400 border-white/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px]" />
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
              <Link href="/optimizer" className="text-sm transition-colors" style={{ color: '#34d399' }}>
                Optimizer
              </Link>
              <Link href="/audit" className="text-sm px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors">
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
              <Link href="/optimizer" className="block py-2" style={{ color: '#34d399' }}>Optimizer</Link>
              <Link href="/audit" className="block py-2 px-4 bg-emerald-500 text-black font-medium rounded-lg text-center">
                Site Audit
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#ffffff' }}>
                Content Optimizer
              </h1>
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Transform your content into SEO & GEO optimized masterpieces
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#ffffff' }}>
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Your Content
              </h2>

              {/* Content Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                  Paste Your Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your existing content here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none placeholder-gray-500"
                  style={{ color: '#ffffff' }}
                />
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  {content.length} characters, {content.trim().split(/\s+/).filter((w) => w).length} words
                </p>
              </div>

              {/* Keywords */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                  Target Keywords (comma-separated) *
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., AI marketing, automation tools"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-500"
                  style={{ color: '#ffffff' }}
                />
              </div>

              {/* Settings */}
              <div className="space-y-4 mb-6">
                {/* Optimization Type */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                    Optimization Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['seo', 'geo', 'both'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setOptimizationType(type)}
                        className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                          optimizationType === type
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        style={{ color: optimizationType === type ? undefined : '#ffffff' }}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    style={{ color: '#ffffff' }}
                  >
                    <option value="neutral" className="bg-[#111111]">Neutral</option>
                    <option value="professional" className="bg-[#111111]">Professional</option>
                    <option value="engaging" className="bg-[#111111]">Engaging</option>
                    <option value="casual" className="bg-[#111111]">Casual</option>
                    <option value="inspirational" className="bg-[#111111]">Inspirational</option>
                  </select>
                </div>

                {/* Preserve Meaning */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="preserve"
                    checked={preserveMeaning}
                    onChange={(e) => setPreserveMeaning(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="preserve" className="text-sm" style={{ color: '#d1d5db' }}>
                    Preserve original meaning (conservative optimization)
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={analyzeContent}
                  disabled={analyzing || !content.trim()}
                  className="bg-white/10 py-3 rounded-lg font-semibold hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all border border-white/10"
                  style={{ color: '#ffffff' }}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>

                <button
                  onClick={optimizeContent}
                  disabled={loading || !content.trim() || !keywords.trim()}
                  className="bg-emerald-500 text-black py-3 rounded-lg font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Optimize
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Analysis Results */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8"
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
                  Content Analysis
                </h3>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-sm" style={{ color: '#60a5fa' }}>SEO Score</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#ffffff' }}>
                      {analysis.seo_score}/100
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                    <p className="text-sm" style={{ color: '#34d399' }}>GEO Score</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#ffffff' }}>
                      {analysis.geo_score}/100
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>Metrics:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                      <span style={{ color: '#9ca3af' }}>Words:</span>
                      <span style={{ color: '#ffffff' }}>{analysis.metrics.word_count}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                      <span style={{ color: '#9ca3af' }}>Sentences:</span>
                      <span style={{ color: '#ffffff' }}>{analysis.metrics.sentence_count}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                      <span style={{ color: '#9ca3af' }}>Paragraphs:</span>
                      <span style={{ color: '#ffffff' }}>{analysis.metrics.paragraph_count}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                      <span style={{ color: '#9ca3af' }}>Reading Time:</span>
                      <span style={{ color: '#ffffff' }}>{analysis.metrics.reading_time_minutes} min</span>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {analysis.seo_issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>SEO Issues:</h4>
                    <div className="space-y-2">
                      {analysis.seo_issues.slice(0, 5).map((issue, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border text-sm ${getSeverityColor(issue.severity)}`}
                        >
                          <p className="font-medium">{issue.issue}</p>
                          <p className="text-xs mt-1 opacity-80">{issue.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>Suggestions:</h4>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span style={{ color: '#d1d5db' }}>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Improvements */}
                <div className="grid grid-cols-2 gap-4">
                  {result.seo_score_before !== undefined && result.seo_score_after !== undefined && (
                    <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                      <p className="text-sm" style={{ color: '#9ca3af' }}>SEO Score</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold" style={{ color: '#6b7280' }}>
                          {result.seo_score_before}
                        </span>
                        <ArrowRight className="w-5 h-5 text-emerald-400" />
                        <span className="text-2xl font-bold" style={{ color: '#34d399' }}>
                          {result.seo_score_after}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.geo_score_before !== undefined && result.geo_score_after !== undefined && (
                    <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                      <p className="text-sm" style={{ color: '#9ca3af' }}>GEO Score</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold" style={{ color: '#6b7280' }}>
                          {result.geo_score_before}
                        </span>
                        <ArrowRight className="w-5 h-5 text-emerald-400" />
                        <span className="text-2xl font-bold" style={{ color: '#34d399' }}>
                          {result.geo_score_after}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs for SEO/GEO versions */}
                {result.seo_optimized && result.geo_optimized && (
                  <div className="bg-[#111111] rounded-xl border border-white/10 p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('seo')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                          activeTab === 'seo'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        style={{ color: activeTab === 'seo' ? undefined : '#ffffff' }}
                      >
                        SEO Optimized
                      </button>
                      <button
                        onClick={() => setActiveTab('geo')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                          activeTab === 'geo'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        style={{ color: activeTab === 'geo' ? undefined : '#ffffff' }}
                      >
                        GEO Optimized
                      </button>
                    </div>
                  </div>
                )}

                {/* Optimized Content */}
                <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                      {activeTab === 'seo' ? 'SEO Optimized' : 'GEO Optimized'} Content
                    </h3>
                    <button
                      onClick={() => copyToClipboard(activeTab)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition"
                    >
                      {copied === activeTab ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium" style={{ color: '#34d399' }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" style={{ color: '#9ca3af' }} />
                          <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-5 bg-white/5 rounded-xl border border-white/10 whitespace-pre-wrap mb-6" style={{ color: '#e5e7eb' }}>
                    {activeTab === 'seo' ? result.seo_optimized : result.geo_optimized}
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>
                      What We Improved:
                    </h4>
                    <ul className="space-y-2">
                      {(activeTab === 'seo' ? result.seo_improvements : result.geo_improvements)?.map(
                        (improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span style={{ color: '#d1d5db' }}>{improvement}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#111111] rounded-2xl border border-white/10 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]"
              >
                <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: '#374151' }} />
                <p style={{ color: '#9ca3af' }} className="mb-2">
                  Paste your content and click optimize
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  We'll transform it into SEO & GEO optimized content
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
