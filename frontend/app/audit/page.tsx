'use client';

import { useState } from 'react';
import axios from 'axios';
import {
  Globe, Loader2, AlertCircle, CheckCircle, TrendingUp,
  FileText, AlertTriangle, Info, Sparkles, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';

// Interfaces matching backend schemas
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
  // Form states
  const [url, setUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Result states
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'seo' | 'design' | 'content'>('seo');

  const handleUrlSubmit = () => {
    // Validate URL format
    if (!url.trim() || !url.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    // Show lead capture modal
    setShowModal(true);
    setError('');
  };

  const analyzeSite = async () => {
    // Validate lead info
    if (!userName.trim() || !userRole.trim() || !userEmail.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
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
        user_email: userEmail
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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Site Audit
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive website analysis powered by AI
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Keywords
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
        {/* Input Form - if no results and not loading */}
        {!results && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Analyze Your Website
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Get a comprehensive AI-powered analysis of your website's SEO, design, and content quality.
              Receive actionable insights and improvement suggestions.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              onClick={handleUrlSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Analyze Website
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Your Website...
            </h3>
            <p className="text-gray-600">
              This may take 30-60 seconds. We're checking SEO, design, content quality, and more.
            </p>
          </div>
        )}

        {/* Lead Capture Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Almost there!
                </h3>
                <p className="text-gray-600">
                  Please provide your details to receive your personalized website audit report.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="Marketing Manager"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={analyzeSite}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition shadow-lg"
                >
                  Start Analysis
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                🔒 We respect your privacy. Your information is used solely for providing your audit report.
              </p>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {results && (
          <>
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Left: Score Gauge */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-8">
                <h3 className="text-white text-xl mb-6">Your site score</h3>
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={553}
                      strokeDashoffset={553 - (results.overall_score / 100) * 553}
                      className={`${getScoreColor(results.overall_score)} transition-all duration-1000`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{results.overall_score}</span>
                    <span className="text-white text-lg">/100</span>
                  </div>
                </div>
              </div>

              {/* Right: Current Status */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-8">
                <h3 className="text-white text-xl mb-6">Current Status</h3>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-red-400">
                    {results.total_issues}+
                  </div>
                  <p className="text-red-400 text-lg mt-2">issues found</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{results.seo_score}</div>
                    <div className="text-xs text-gray-400 mt-1">SEO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{results.design_score}</div>
                    <div className="text-xs text-gray-400 mt-1">Design</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{results.content_score}</div>
                    <div className="text-xs text-gray-400 mt-1">Content</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Issues found on your site may affect user experience and overall performance
              </h2>
              <p className="text-gray-600 mb-6">
                {results.overall_score >= 80
                  ? "Your site is performing well! Review the suggestions below for further optimization."
                  : results.overall_score >= 50
                  ? "You have a strong base, but clarity and flow need work."
                  : "Significant improvements needed. Focus on critical issues first."}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Access the complete breakdown with detailed scoring.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span>Get a clear to-do list of what needs to be improved.</span>
                </li>
              </ul>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold transition"
              >
                Analyze Another Site
              </button>
            </div>

            {/* Detailed Analysis Tabs */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Detailed Analysis</h2>

              {/* Tab Buttons */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                    activeTab === 'seo'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SEO Analysis
                </button>
                <button
                  onClick={() => setActiveTab('design')}
                  className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                    activeTab === 'design'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Design & Performance
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                    activeTab === 'content'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Content Quality
                </button>
              </div>

              {/* Tab Content - Issues by Category */}
              <div className="space-y-3">
                {results.issues
                  .filter(issue => issue.category === activeTab)
                  .map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        issue.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        issue.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${
                          issue.severity === 'critical' ? 'text-red-600' :
                          issue.severity === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                {results.issues.filter(issue => issue.category === activeTab).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p>No issues found in this category! Great work! 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                AI-Powered Suggestions
              </h2>
              <p className="text-gray-600 mb-6">
                Our AI analyzed your site and generated these prioritized recommendations:
              </p>
              <div className="space-y-4">
                {results.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{suggestion.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{suggestion.description}</p>
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg inline-flex">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">{suggestion.impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
