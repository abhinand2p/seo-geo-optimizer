'use client';

import { useState } from 'react';
import axios from 'axios';
import { Zap, Sparkles, Loader2, AlertCircle, Copy, Check, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api`;

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
        ? keywords.split(',').map(k => k.trim()).filter(k => k)
        : null;

      const response = await axios.post(`${API_BASE_URL}/content/analyze`, {
        content: content.trim(),
        target_keywords: keywordList
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
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);

      const response = await axios.post(`${API_BASE_URL}/content/optimize`, {
        content: content.trim(),
        target_keywords: keywordList,
        optimization_type: optimizationType,
        preserve_meaning: preserveMeaning,
        tone
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Content Optimizer
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Transform Your Content into SEO & GEO Optimized Masterpieces
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                ← Keywords
              </Link>
              <Link 
                href="/content"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Content Gen
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-green-600" />
                Your Content
              </h2>

              {/* Content Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste Your Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your existing content here... It can be rough, we'll make it amazing!"
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length} characters, {content.trim().split(/\s+/).filter(w => w).length} words
                </p>
              </div>

              {/* Keywords */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Keywords (comma-separated) *
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., AI marketing, automation tools, digital strategy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Settings */}
              <div className="space-y-4 mb-6">
                {/* Optimization Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Optimization Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['seo', 'geo', 'both'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setOptimizationType(type)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          optimizationType === type
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="professional">Professional</option>
                    <option value="engaging">Engaging</option>
                    <option value="casual">Casual</option>
                    <option value="inspirational">Inspirational</option>
                  </select>
                </div>

                {/* Preserve Meaning */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="preserve"
                    checked={preserveMeaning}
                    onChange={(e) => setPreserveMeaning(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="preserve" className="text-sm text-gray-700">
                    Preserve original meaning (conservative optimization)
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={analyzeContent}
                  disabled={analyzing || !content.trim()}
                  className="bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
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
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg"
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
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Content Analysis
                </h3>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">SEO Score</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {analysis.seo_score}/100
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-600 font-medium">GEO Score</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {analysis.geo_score}/100
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Metrics:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Words:</span>
                      <span className="font-medium">{analysis.metrics.word_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sentences:</span>
                      <span className="font-medium">{analysis.metrics.sentence_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paragraphs:</span>
                      <span className="font-medium">{analysis.metrics.paragraph_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reading Time:</span>
                      <span className="font-medium">{analysis.metrics.reading_time_minutes} min</span>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {analysis.seo_issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">SEO Issues:</h4>
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
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Suggestions:</h4>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {result && (
              <div className="space-y-6">
                {/* Score Improvements */}
                <div className="grid grid-cols-2 gap-4">
                  {result.seo_score_before !== undefined && result.seo_score_after !== undefined && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-600">SEO Score</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-400">
                          {result.seo_score_before}
                        </span>
                        <ArrowRight className="w-5 h-5 text-green-600" />
                        <span className="text-3xl font-bold text-green-600">
                          {result.seo_score_after}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.geo_score_before !== undefined && result.geo_score_after !== undefined && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-gray-600">GEO Score</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-400">
                          {result.geo_score_before}
                        </span>
                        <ArrowRight className="w-5 h-5 text-green-600" />
                        <span className="text-3xl font-bold text-green-600">
                          {result.geo_score_after}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs for SEO/GEO versions */}
                {result.seo_optimized && result.geo_optimized && (
                  <div className="bg-white rounded-2xl shadow-xl p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('seo')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          activeTab === 'seo'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        SEO Optimized
                      </button>
                      <button
                        onClick={() => setActiveTab('geo')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          activeTab === 'geo'
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        GEO Optimized
                      </button>
                    </div>
                  </div>
                )}

                {/* Optimized Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {activeTab === 'seo' ? 'SEO Optimized' : 'GEO Optimized'} Content
                    </h3>
                    <button
                      onClick={() => copyToClipboard(activeTab)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      {copied === activeTab ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap mb-6">
                    {activeTab === 'seo' ? result.seo_optimized : result.geo_optimized}
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      What We Improved:
                    </h4>
                    <ul className="space-y-2">
                      {(activeTab === 'seo' ? result.seo_improvements : result.geo_improvements)?.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!result && !loading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center h-full flex flex-col items-center justify-center">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  Paste your content and click optimize
                </p>
                <p className="text-sm text-gray-400">
                  We'll transform it into SEO & GEO optimized content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}