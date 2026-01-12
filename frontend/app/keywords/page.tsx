'use client';

import { useState } from 'react';
import axios from 'axios';
import { Search, Sparkles, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
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
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'Informational': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Commercial': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Transactional': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* NEW: Prominent Site Audit Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
              NEW
            </span>
            <p className="text-sm font-medium">
              🚀 Try our new AI-powered Site Audit tool - Get comprehensive website analysis in seconds!
            </p>
          </div>
          <Link
            href="/audit"
            className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-bold text-sm"
          >
            Try Site Audit →
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">  {/* CHANGED: added justify-between */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            SEO & GEO Optimizer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            AI-Powered Keyword Generation for Search Engines & AI Chatbots
          </p>
        </div>
      </div>
      {/* Navigation buttons */}
      <div className="flex gap-3">
  <Link
    href="/"
    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
  >
    ← Home
  </Link>
  <Link
    href="/audit"
    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
  >
    Site Audit
  </Link>
  <Link
    href="/content"
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
  >
    Content Gen
  </Link>
  <Link
    href="/optimizer"
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
  >
    Optimizer
  </Link>
</div>
    </div>
  </div>
</header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Generate Keywords
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in Healthcare"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industry *
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Healthcare"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Optimization Type
              </label>
              <div className="flex gap-3">
                {['seo', 'geo', 'both'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setOptimizationType(type)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      optimizationType === type
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Keywords: {keywordCount}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={keywordCount}
                onChange={(e) => setKeywordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={generateKeywords}
            disabled={loading || !topic.trim() || !industry.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
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
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">SEO Keywords</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {results.seed_keywords.length}
                    </p>
                  </div>
                  <Search className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              {results.geo_keywords && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">GEO Keywords</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {results.geo_keywords.length}
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-500" />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Keywords</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {results.total_keywords}
                    </p>
                  </div>
                  <Sparkles className="w-10 h-10 text-green-500" />
                </div>
              </div>
            </div>

            {/* SEO Keywords */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Search className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  SEO Keywords ({results.seed_keywords.length})
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {results.seed_keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* GEO Keywords */}
            {results.geo_keywords && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    GEO Keywords (AI-Optimized) ({results.geo_keywords.length})
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {results.geo_keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-purple-50 text-purple-800 rounded-full text-sm font-medium border border-purple-200 hover:bg-purple-100 transition cursor-pointer"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Analysis */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Keyword Analysis
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Keyword
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Intent
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Difficulty
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Words
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Length
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.analysis.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
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
                        <td className="py-3 px-4 text-gray-600">
                          {item.word_count}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.character_length} chars
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}