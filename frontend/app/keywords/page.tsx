'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, Sparkles, TrendingUp, Loader2, AlertCircle,
  ArrowLeft, BarChart3, Zap, Menu, X, ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface KeywordAnalysis {
  keyword: string;
  word_count: number;
  intent: string;
  difficulty: string;
  character_length: number;
}

interface KeywordResponse {
  success: boolean;
  topic: string;
  industry: string;
  seed_keywords: string[];
  geo_keywords: string[] | null;
  analysis: KeywordAnalysis[];
  total_keywords: number;
}

export default function KeywordGenerator() {
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [optimizationType, setOptimizationType] = useState('both');
  const [keywordCount, setKeywordCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordResponse | null>(null);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const generateKeywords = async () => {
    if (!topic.trim() || !industry.trim()) {
      setError('Please enter both topic and industry');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/keywords/generate`, {
        topic: topic.trim(),
        industry: industry.trim(),
        optimization_type: optimizationType,
        keyword_count: keywordCount
      });

      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate keywords. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-gray-400 border-white/20';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'Informational': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Commercial': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Transactional': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-white/10 text-gray-400 border-white/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[150px]" />
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
              <Link href="/keywords" className="text-sm transition-colors" style={{ color: '#34d399' }}>
                Keywords
              </Link>
              <Link href="/content" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: '#d1d5db' }}>
                Content
              </Link>
              <Link href="/optimizer" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: '#d1d5db' }}>
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
              <Link href="/keywords" className="block py-2" style={{ color: '#34d399' }}>Keywords</Link>
              <Link href="/content" className="block py-2" style={{ color: '#ffffff' }}>Content</Link>
              <Link href="/optimizer" className="block py-2" style={{ color: '#ffffff' }}>Optimizer</Link>
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
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#ffffff' }}>
                Keyword Generator
              </h1>
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                AI-powered keywords for SEO & GEO optimization
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in Healthcare"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-500"
                style={{ color: '#ffffff' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Industry *
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Healthcare"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-500"
                style={{ color: '#ffffff' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Optimization Type
              </label>
              <div className="flex gap-2">
                {['seo', 'geo', 'both'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setOptimizationType(type)}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
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

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Keywords: <span style={{ color: '#34d399' }}>{keywordCount}</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={keywordCount}
                onChange={(e) => setKeywordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#6b7280' }}>
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          <button
            onClick={generateKeywords}
            disabled={loading || !topic.trim() || !industry.trim()}
            className="w-full bg-emerald-500 text-black py-4 rounded-lg font-semibold text-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Keywords...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Keywords
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#9ca3af' }}>SEO Keywords</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#ffffff' }}>
                      {results.seed_keywords.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              {results.geo_keywords && (
                <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>GEO Keywords</p>
                      <p className="text-3xl font-bold mt-1" style={{ color: '#ffffff' }}>
                        {results.geo_keywords.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#9ca3af' }}>Total Keywords</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#34d399' }}>
                      {results.total_keywords}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Keywords */}
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                  SEO Keywords ({results.seed_keywords.length})
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.seed_keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm font-medium hover:bg-blue-500/20 transition cursor-pointer"
                    style={{ color: '#93c5fd' }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* GEO Keywords */}
            {results.geo_keywords && (
              <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                    GEO Keywords (AI-Optimized) ({results.geo_keywords.length})
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.geo_keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm font-medium hover:bg-purple-500/20 transition cursor-pointer"
                      style={{ color: '#c4b5fd' }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Analysis */}
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#ffffff' }}>
                Keyword Analysis
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#9ca3af' }}>Keyword</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#9ca3af' }}>Intent</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#9ca3af' }}>Difficulty</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#9ca3af' }}>Words</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: '#9ca3af' }}>Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.analysis.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="py-3 px-4 font-medium" style={{ color: '#ffffff' }}>
                          {item.keyword}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getIntentColor(item.intent)}`}>
                            {item.intent}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4" style={{ color: '#9ca3af' }}>
                          {item.word_count}
                        </td>
                        <td className="py-3 px-4" style={{ color: '#9ca3af' }}>
                          {item.character_length} chars
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
