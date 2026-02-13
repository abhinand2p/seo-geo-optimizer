'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText, Sparkles, Loader2, AlertCircle, Copy, Check,
  Menu, X
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface Tone {
  value: string;
  label: string;
  description: string;
}

interface ContentType {
  value: string;
  label: string;
  description: string;
}

interface ContentResponse {
  success: boolean;
  content: string | string[];
  content_type: string;
  tone: string;
  word_count: number;
  optimization_type: string;
  seo_score?: number;
  citeability_score?: number;
  primary_keyword: string;
  keywords_used?: { [key: string]: number };
}

export default function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('neutral');
  const [optimizationType, setOptimizationType] = useState('seo');
  const [contentType, setContentType] = useState('paragraph');
  const [wordCount, setWordCount] = useState(150);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [tones, setTones] = useState<Tone[]>([]);
  const [seoTypes, setSeoTypes] = useState<ContentType[]>([]);
  const [geoTypes, setGeoTypes] = useState<ContentType[]>([]);
  const [selectedOption, setSelectedOption] = useState(0);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/content/tones`)
      .then((res) => setTones(res.data.tones))
      .catch((err) => console.error('Error loading tones:', err));

    axios
      .get(`${API_BASE_URL}/content/content-types`)
      .then((res) => {
        setSeoTypes(res.data.seo_types);
        setGeoTypes(res.data.geo_types);
      })
      .catch((err) => console.error('Error loading content types:', err));
  }, []);

  const generateContent = async () => {
    if (!topic.trim() || !keywords.trim()) {
      setError('Please enter both topic and keywords');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setSelectedOption(0);

    try {
      const keywordList = keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);

      const promises = Array(5)
        .fill(null)
        .map(() =>
          axios.post(`${API_BASE_URL}/content/generate`, {
            topic: topic.trim(),
            keywords: keywordList,
            tone,
            optimization_type: optimizationType,
            content_type: contentType,
            word_count: wordCount,
          })
        );

      const responses = await Promise.all(promises);

      const combinedResult = {
        ...responses[0].data,
        content: responses.map((r) => r.data.content),
      };

      setResult(combinedResult);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to generate content. Please try again.'
      );
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.content) {
      const textToCopy = Array.isArray(result.content)
        ? result.content[selectedOption]
        : result.content;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const availableTypes = optimizationType === 'geo' ? geoTypes : seoTypes;

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
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
              <Link href="/content" className="text-sm transition-colors" style={{ color: '#34d399' }}>
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
              <Link href="/keywords" className="block py-2" style={{ color: '#ffffff' }}>Keywords</Link>
              <Link href="/content" className="block py-2" style={{ color: '#34d399' }}>Content</Link>
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
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#ffffff' }}>
                Content Generator
              </h1>
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Create SEO & GEO optimized content with AI
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8 h-fit"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#ffffff' }}>
              <Sparkles className="w-5 h-5 text-purple-400" />
              Configure Content
            </h2>

            {/* Topic */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Email Marketing Strategies"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition placeholder-gray-500"
                style={{ color: '#ffffff' }}
              />
            </div>

            {/* Keywords */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Keywords (comma-separated) *
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., email automation, marketing tools"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition placeholder-gray-500"
                style={{ color: '#ffffff' }}
              />
            </div>

            {/* Optimization Type */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Optimization Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['seo', 'geo', 'both'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setOptimizationType(type);
                      setContentType(type === 'geo' ? 'definition' : 'paragraph');
                    }}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                      optimizationType === type
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    style={{ color: optimizationType === type ? undefined : '#ffffff' }}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                style={{ color: '#ffffff' }}
              >
                {availableTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[#111111]">
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                style={{ color: '#ffffff' }}
              >
                {tones.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#111111]">
                    {t.label} - {t.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Word Count */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Target Word Count: <span style={{ color: '#a78bfa' }}>{wordCount}</span>
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#6b7280' }}>
                <span>50</span>
                <span>2000</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            )}

            <button
              onClick={generateContent}
              disabled={loading || !topic.trim() || !keywords.trim()}
              className="w-full bg-purple-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </motion.div>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                    <p className="text-sm" style={{ color: '#9ca3af' }}>Word Count</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#ffffff' }}>
                      {result.word_count}
                    </p>
                  </div>

                  {result.seo_score !== undefined && (
                    <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                      <p className="text-sm" style={{ color: '#9ca3af' }}>SEO Score</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#60a5fa' }}>
                        {result.seo_score}/100
                      </p>
                    </div>
                  )}

                  {result.citeability_score !== undefined && (
                    <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                      <p className="text-sm" style={{ color: '#9ca3af' }}>GEO Score</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#34d399' }}>
                        {result.citeability_score}/100
                      </p>
                    </div>
                  )}

                  <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                    <p className="text-sm" style={{ color: '#9ca3af' }}>Tone</p>
                    <p className="text-lg font-bold mt-1 capitalize" style={{ color: '#ffffff' }}>
                      {result.tone}
                    </p>
                  </div>
                </div>

                {/* Generated Content */}
                <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                      Generated Content
                    </h3>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium" style={{ color: '#34d399' }}>
                            Copied!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" style={{ color: '#9ca3af' }} />
                          <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option Selector */}
                  {Array.isArray(result.content) && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {result.content.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedOption(idx)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedOption === idx
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                          style={{ color: selectedOption === idx ? undefined : '#ffffff' }}
                        >
                          Option {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-5 bg-white/5 rounded-xl border border-white/10 whitespace-pre-wrap" style={{ color: '#e5e7eb' }}>
                    {Array.isArray(result.content)
                      ? result.content[selectedOption]
                      : result.content}
                  </div>

                  {/* Keyword Usage */}
                  {result.keywords_used && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>
                        Keyword Usage:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.keywords_used).map(([kw, count]) => (
                          <span
                            key={kw}
                            className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm"
                            style={{ color: '#c4b5fd' }}
                          >
                            {kw}: {count}x
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#111111] rounded-2xl border border-white/10 p-12 text-center"
              >
                <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#374151' }} />
                <p style={{ color: '#9ca3af' }}>
                  Configure your content settings and click generate to see results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
