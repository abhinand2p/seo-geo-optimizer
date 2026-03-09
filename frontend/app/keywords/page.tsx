'use client';

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Search, Sparkles, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle,
  ChevronDown, Copy, Download, Globe, HelpCircle, Layers, Filter,
  CheckCircle, ArrowRight, BarChart3
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { API_BASE_URL } from '@/lib/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeywordAnalysis {
  keyword: string;
  word_count: number;
  intent: string;
  difficulty: string;
  character_length: number;
  volume_estimate: string;
  cpc_estimate: string;
  trend: string;
  competition_level: string;
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

interface QuestionsResponse {
  success: boolean;
  topic: string;
  questions: string[];
  analysis: KeywordAnalysis[];
  total: number;
}

interface CompetitorResponse {
  success: boolean;
  competitor_domain: string;
  inferred_keywords: string[];
  analysis: KeywordAnalysis[];
  content_gaps: string[];
  total: number;
  disclaimer: string;
}

interface ClusterItem {
  cluster_name: string;
  theme: string;
  primary_keyword: string;
  intent: string;
  keywords: string[];
}

interface ClustersResponse {
  success: boolean;
  topic: string;
  clusters: ClusterItem[];
  unclustered: string[];
  total_clusters: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDifficultyColor(d: string) {
  if (d === 'Easy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (d === 'Hard') return 'bg-red-500/20 text-red-400 border-red-500/30';
  return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
}

function getIntentColor(i: string) {
  if (i === 'Informational') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (i === 'Commercial') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (i === 'Transactional') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-white/10 text-gray-400 border-white/20';
}

function getTrendIcon(trend: string) {
  if (trend === 'Rising') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'Declining') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-gray-400" />;
}

function getTrendColor(trend: string) {
  if (trend === 'Rising') return '#34d399';
  if (trend === 'Declining') return '#f87171';
  return '#9ca3af';
}

const clusterColors = [
  { border: 'border-blue-500/40', bg: 'bg-blue-500/10', badge: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-400' },
  { border: 'border-purple-500/40', bg: 'bg-purple-500/10', badge: 'bg-purple-500/20 text-purple-400', dot: 'bg-purple-400' },
  { border: 'border-amber-500/40', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
  { border: 'border-rose-500/40', bg: 'bg-rose-500/10', badge: 'bg-rose-500/20 text-rose-400', dot: 'bg-rose-400' },
];

function exportToCSV(analysis: KeywordAnalysis[], filename: string) {
  const headers = ['Keyword', 'Intent', 'Difficulty', 'Volume (Est.)', 'CPC (Est.)', 'Trend', 'Competition', 'Words'];
  const rows = analysis.map(a => [
    `"${a.keyword}"`, a.intent, a.difficulty, a.volume_estimate, a.cpc_estimate, a.trend, a.competition_level, a.word_count
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function trackActivity(type: string, description: string) {
  try {
    const existing = JSON.parse(localStorage.getItem('seo_activity') || '[]');
    const updated = [{ id: Date.now().toString(), type, description, timestamp: Date.now() }, ...existing].slice(0, 20);
    localStorage.setItem('seo_activity', JSON.stringify(updated));
  } catch {}
}

function updateKeywordsCount(count: number) {
  try {
    const current = parseInt(localStorage.getItem('seo_keywords_count') || '0') || 0;
    localStorage.setItem('seo_keywords_count', String(current + count));
  } catch {}
}

// ─── Keyword Table ─────────────────────────────────────────────────────────────

function KeywordTable({ analysis }: { analysis: KeywordAnalysis[] }) {
  if (analysis.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-10 h-10 mx-auto mb-3" style={{ color: '#1f2937' }} />
        <p className="text-sm" style={{ color: '#6b7280' }}>No keywords match your filters.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>KEYWORD</th>
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>INTENT</th>
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>DIFFICULTY</th>
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>VOLUME</th>
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>CPC</th>
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>TREND</th>
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>COMPETITION</th>
            <th className="text-left py-3 px-3 text-xs font-medium" style={{ color: '#6b7280' }}>WORDS</th>
          </tr>
        </thead>
        <tbody>
          {analysis.map((item, idx) => (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/3 transition">
              <td className="py-3 px-3 font-medium text-sm" style={{ color: '#ffffff' }}>{item.keyword}</td>
              <td className="py-3 px-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getIntentColor(item.intent)}`}>
                  {item.intent}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
              </td>
              <td className="py-3 px-3 text-sm" style={{ color: '#d1d5db' }}>{item.volume_estimate}</td>
              <td className="py-3 px-3 text-sm" style={{ color: '#d1d5db' }}>{item.cpc_estimate}</td>
              <td className="py-3 px-3">
                <span className="flex items-center gap-1 text-xs" style={{ color: getTrendColor(item.trend) }}>
                  {getTrendIcon(item.trend)} {item.trend}
                </span>
              </td>
              <td className="py-3 px-3 text-sm" style={{ color: '#9ca3af' }}>{item.competition_level}</td>
              <td className="py-3 px-3 text-sm" style={{ color: '#6b7280' }}>{item.word_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KeywordGenerator() {
  // Form state
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [optimizationType, setOptimizationType] = useState('both');
  const [keywordCount, setKeywordCount] = useState(30);

  // Results state
  const [results, setResults] = useState<KeywordResponse | null>(null);
  const [questionsData, setQuestionsData] = useState<QuestionsResponse | null>(null);
  const [competitorData, setCompetitorData] = useState<CompetitorResponse | null>(null);
  const [clustersData, setClustersData] = useState<ClustersResponse | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [clustersLoading, setClustersLoading] = useState(false);
  const [error, setError] = useState('');
  const [competitorDomain, setCompetitorDomain] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  // Filters
  const [filterIntent, setFilterIntent] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterTrend, setFilterTrend] = useState('All');

  // ── Generate Keywords ───────────────────────────────────────────────────────

  const generateKeywords = async () => {
    if (!topic.trim() || !industry.trim()) {
      setError('Please enter both topic and industry');
      return;
    }
    setLoading(true);
    setError('');
    setResults(null);
    setQuestionsData(null);
    setCompetitorData(null);
    setClustersData(null);
    setActiveTab('all');

    try {
      const response = await axios.post(`${API_BASE_URL}/keywords/generate`, {
        topic: topic.trim(),
        industry: industry.trim(),
        optimization_type: optimizationType,
        keyword_count: keywordCount,
      });
      setResults(response.data);

      // Update checklist + activity
      try {
        const cl = JSON.parse(localStorage.getItem('seo_checklist') || '{}');
        localStorage.setItem('seo_checklist', JSON.stringify({ ...cl, keywords_generated: true }));
      } catch {}
      trackActivity('keywords', `Generated ${response.data.total_keywords} keywords for "${topic.trim()}"`);
      updateKeywordsCount(response.data.total_keywords);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate keywords. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Generate Questions ──────────────────────────────────────────────────────

  const generateQuestions = async () => {
    if (!topic.trim() || !industry.trim()) return;
    setQuestionsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/keywords/questions`, {
        topic: topic.trim(),
        industry: industry.trim(),
        count: 20,
      });
      setQuestionsData(response.data);
      trackActivity('keywords', `Generated question keywords for "${topic.trim()}"`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate question keywords.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // ── Competitor Analysis ─────────────────────────────────────────────────────

  const analyzeCompetitor = async () => {
    if (!competitorDomain.trim() || !topic.trim() || !industry.trim()) return;
    setCompetitorLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/keywords/competitor`, {
        competitor_domain: competitorDomain.trim(),
        your_topic: topic.trim(),
        industry: industry.trim(),
        count: 25,
      });
      setCompetitorData(response.data);

      // Update checklist
      try {
        const cl = JSON.parse(localStorage.getItem('seo_checklist') || '{}');
        localStorage.setItem('seo_checklist', JSON.stringify({ ...cl, competitor_analyzed: true }));
      } catch {}
      trackActivity('competitor', `Analyzed competitor "${competitorDomain.trim()}"`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze competitor.');
    } finally {
      setCompetitorLoading(false);
    }
  };

  // ── Cluster Keywords ────────────────────────────────────────────────────────

  const clusterKeywords = async () => {
    if (!results?.seed_keywords?.length) return;
    setClustersLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/keywords/clusters`, {
        keywords: results.seed_keywords,
        topic: topic.trim() || results.topic,
        max_clusters: 5,
      });
      setClustersData(response.data);
      trackActivity('keywords', `Clustered keywords for "${topic.trim()}"`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cluster keywords.');
    } finally {
      setClustersLoading(false);
    }
  };

  // ── Filter + Export ─────────────────────────────────────────────────────────

  const filteredAnalysis = (results?.analysis || []).filter(a => {
    if (filterIntent !== 'All' && a.intent !== filterIntent) return false;
    if (filterDifficulty !== 'All' && a.difficulty !== filterDifficulty) return false;
    if (filterTrend !== 'All' && a.trend !== filterTrend) return false;
    return true;
  });

  const longTailKeywords = (results?.analysis || []).filter(a => a.word_count >= 3);

  const copyAll = (keywords: string[]) => {
    navigator.clipboard.writeText(keywords.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);

    try {
      const cl = JSON.parse(localStorage.getItem('seo_checklist') || '{}');
      localStorage.setItem('seo_checklist', JSON.stringify({ ...cl, keywords_exported: true }));
    } catch {}
    trackActivity('export', `Copied ${keywords.length} keywords to clipboard`);
  };

  const handleExportCSV = (analysis: KeywordAnalysis[], filename: string) => {
    exportToCSV(analysis, filename);
    try {
      const cl = JSON.parse(localStorage.getItem('seo_checklist') || '{}');
      localStorage.setItem('seo_checklist', JSON.stringify({ ...cl, keywords_exported: true }));
    } catch {}
    trackActivity('export', `Exported ${analysis.length} keywords as CSV`);
  };

  // ── Question grouping ───────────────────────────────────────────────────────

  function groupQuestions(questions: string[]) {
    const groups: Record<string, string[]> = { 'How To': [], 'What Is': [], 'Why': [], 'Other': [] };
    for (const q of questions) {
      const lower = q.toLowerCase();
      if (lower.startsWith('how')) groups['How To'].push(q);
      else if (lower.startsWith('what')) groups['What Is'].push(q);
      else if (lower.startsWith('why')) groups['Why'].push(q);
      else groups['Other'].push(q);
    }
    return groups;
  }

  const tabs = [
    { id: 'all', label: 'All Keywords', icon: Search },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'longtail', label: 'Long-tail', icon: TrendingUp },
    { id: 'competitor', label: 'Competitor', icon: Globe },
    { id: 'clusters', label: 'Clusters', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <AppHeader activeRoute="keywords" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#ffffff' }}>Keyword Research</h1>
              <p className="text-sm" style={{ color: '#9ca3af' }}>AI-powered keywords for SEO & GEO optimization</p>
            </div>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#111111] rounded-2xl border border-white/10 p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>Topic *</label>
              <input
                type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in Healthcare"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600"
                style={{ color: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>Industry *</label>
              <input
                type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Healthcare"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600"
                style={{ color: '#ffffff' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>Optimization Type</label>
              <div className="flex gap-2">
                {['seo', 'geo', 'both'].map((type) => (
                  <button key={type} onClick={() => setOptimizationType(type)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      optimizationType === type ? 'bg-blue-500 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    style={{ color: optimizationType === type ? '#ffffff' : '#d1d5db' }}>
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Keywords: <span style={{ color: '#60a5fa' }}>{keywordCount}</span>
              </label>
              <input type="range" min="5" max="100" value={keywordCount} onChange={(e) => setKeywordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#6b7280' }}>
                <span>5</span><span>100</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          <button onClick={generateKeywords} disabled={loading || !topic.trim() || !industry.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-lg font-semibold text-base hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating Keywords...</> : <><Sparkles className="w-5 h-5" />Generate Keywords</>}
          </button>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                <p className="text-xs mb-1" style={{ color: '#6b7280' }}>SEO Keywords</p>
                <p className="text-2xl font-bold" style={{ color: '#60a5fa' }}>{results.seed_keywords.length}</p>
              </div>
              <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                <p className="text-xs mb-1" style={{ color: '#6b7280' }}>GEO Keywords</p>
                <p className="text-2xl font-bold" style={{ color: '#a78bfa' }}>{results.geo_keywords?.length ?? 0}</p>
              </div>
              <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                <p className="text-xs mb-1" style={{ color: '#6b7280' }}>Total</p>
                <p className="text-2xl font-bold" style={{ color: '#34d399' }}>{results.total_keywords}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-[#111111] rounded-xl border border-white/10 mb-6 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                    activeTab === tab.id ? 'bg-white/10 text-white' : 'hover:bg-white/5'
                  }`}
                  style={{ color: activeTab === tab.id ? '#ffffff' : '#9ca3af' }}>
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── Tab: All Keywords ── */}
            {activeTab === 'all' && (
              <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
                {/* Filter bar + Export */}
                <div className="p-5 border-b border-white/10 flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="w-4 h-4" style={{ color: '#6b7280' }} />
                    {/* Intent filter */}
                    <select value={filterIntent} onChange={e => setFilterIntent(e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs outline-none cursor-pointer"
                      style={{ color: '#d1d5db' }}>
                      {['All', 'Informational', 'Commercial', 'Transactional', 'Navigational'].map(v => (
                        <option key={v} value={v} style={{ background: '#111111' }}>{v === 'All' ? 'All Intents' : v}</option>
                      ))}
                    </select>
                    {/* Difficulty filter */}
                    <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs outline-none cursor-pointer"
                      style={{ color: '#d1d5db' }}>
                      {['All', 'Easy', 'Medium', 'Hard'].map(v => (
                        <option key={v} value={v} style={{ background: '#111111' }}>{v === 'All' ? 'All Difficulties' : v}</option>
                      ))}
                    </select>
                    {/* Trend filter */}
                    <select value={filterTrend} onChange={e => setFilterTrend(e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs outline-none cursor-pointer"
                      style={{ color: '#d1d5db' }}>
                      {['All', 'Rising', 'Stable', 'Declining'].map(v => (
                        <option key={v} value={v} style={{ background: '#111111' }}>{v === 'All' ? 'All Trends' : v}</option>
                      ))}
                    </select>
                    <span className="text-xs px-2 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full" style={{ color: '#fbbf24' }}>
                      AI Estimated
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyAll(results.seed_keywords)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                      style={{ color: '#d1d5db' }}>
                      {copiedAll ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAll ? 'Copied!' : 'Copy All'}
                    </button>
                    <button onClick={() => handleExportCSV(filteredAnalysis, `keywords-${topic}.csv`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                      style={{ color: '#d1d5db' }}>
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </div>
                </div>

                <div className="p-1">
                  <KeywordTable analysis={filteredAnalysis} />
                </div>

                {/* GEO Keywords */}
                {results.geo_keywords && results.geo_keywords.length > 0 && (
                  <div className="border-t border-white/10 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-sm" style={{ color: '#ffffff' }}>
                        GEO Keywords — AI Citation Optimized ({results.geo_keywords.length})
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {results.geo_keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs"
                          style={{ color: '#c4b5fd' }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Questions ── */}
            {activeTab === 'questions' && (
              <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Question Keywords</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>High-converting how/what/why questions</p>
                  </div>
                  <button onClick={generateQuestions} disabled={questionsLoading || !topic.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition">
                    {questionsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                    Generate Questions
                  </button>
                </div>

                {questionsLoading && (
                  <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
                    <p className="text-sm" style={{ color: '#9ca3af' }}>Generating question keywords...</p>
                  </div>
                )}

                {!questionsLoading && !questionsData && (
                  <div className="text-center py-16">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#1f2937' }} />
                    <p className="text-sm" style={{ color: '#6b7280' }}>Click "Generate Questions" to get how/what/why keywords</p>
                  </div>
                )}

                {questionsData && (() => {
                  const groups = groupQuestions(questionsData.questions);
                  const groupColors: Record<string, { bg: string; border: string; color: string }> = {
                    'How To': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: 'text-emerald-400' },
                    'What Is': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', color: 'text-blue-400' },
                    'Why': { bg: 'bg-purple-500/10', border: 'border-purple-500/20', color: 'text-purple-400' },
                    'Other': { bg: 'bg-white/5', border: 'border-white/10', color: 'text-gray-400' },
                  };
                  return (
                    <div className="space-y-6">
                      {Object.entries(groups).filter(([, qs]) => qs.length > 0).map(([group, qs]) => {
                        const c = groupColors[group];
                        return (
                          <div key={group}>
                            <h3 className={`text-sm font-semibold mb-3 ${c.color}`}>{group} ({qs.length})</h3>
                            <div className="flex flex-wrap gap-2">
                              {qs.map((q, i) => (
                                <span key={i} className={`px-3 py-1.5 ${c.bg} border ${c.border} rounded-lg text-xs`}
                                  style={{ color: '#d1d5db' }}>
                                  {q}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-4 border-t border-white/10">
                        <button onClick={() => handleExportCSV(questionsData.analysis, `questions-${topic}.csv`)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                          style={{ color: '#d1d5db' }}>
                          <Download className="w-4 h-4" /> Export Questions CSV
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── Tab: Long-tail ── */}
            {activeTab === 'longtail' && (
              <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold" style={{ color: '#ffffff' }}>Long-tail Keywords</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
                      {longTailKeywords.length} keywords with 3+ words — lower competition, higher intent
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyAll(longTailKeywords.map(k => k.keyword))}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                      style={{ color: '#d1d5db' }}>
                      <Copy className="w-3.5 h-3.5" /> Copy All
                    </button>
                    <button onClick={() => handleExportCSV(longTailKeywords, `longtail-${topic}.csv`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                      style={{ color: '#d1d5db' }}>
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </div>
                </div>
                <div className="p-1">
                  <KeywordTable analysis={longTailKeywords} />
                </div>
              </div>
            )}

            {/* ── Tab: Competitor ── */}
            {activeTab === 'competitor' && (
              <div className="space-y-5">
                {/* Competitor input */}
                <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
                  <h2 className="font-semibold mb-1" style={{ color: '#ffffff' }}>Competitor Keyword Analysis</h2>
                  <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>AI infers keywords your competitor likely targets based on their domain</p>
                  <div className="flex gap-3">
                    <input type="text" value={competitorDomain} onChange={e => setCompetitorDomain(e.target.value)}
                      placeholder="competitor.com"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition placeholder-gray-600 text-sm"
                      style={{ color: '#ffffff' }} />
                    <button onClick={analyzeCompetitor} disabled={competitorLoading || !competitorDomain.trim() || !topic.trim()}
                      className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-black rounded-lg text-sm font-semibold hover:bg-amber-400 disabled:opacity-50 transition whitespace-nowrap">
                      {competitorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                      Analyze
                    </button>
                  </div>
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-xs" style={{ color: '#fbbf24' }}>
                      AI-inferred only — no live crawl. Results are based on domain name & industry context.
                    </p>
                  </div>
                </div>

                {competitorLoading && (
                  <div className="bg-[#111111] rounded-2xl border border-white/10 p-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
                    <p className="text-sm" style={{ color: '#9ca3af' }}>Analyzing competitor...</p>
                  </div>
                )}

                {competitorData && !competitorLoading && (
                  <>
                    <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
                      <div className="p-5 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-semibold" style={{ color: '#ffffff' }}>
                          Inferred Keywords for {competitorData.competitor_domain}
                        </h3>
                        <button onClick={() => handleExportCSV(competitorData.analysis, `competitor-${competitorData.competitor_domain}.csv`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                          style={{ color: '#d1d5db' }}>
                          <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                      </div>
                      <div className="p-1">
                        <KeywordTable analysis={competitorData.analysis} />
                      </div>
                    </div>

                    <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
                      <h3 className="font-semibold mb-4" style={{ color: '#ffffff' }}>Content Gaps — Topics to Target</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {competitorData.content_gaps.map((gap, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 bg-white/3 rounded-lg border border-white/5">
                            <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span className="text-sm" style={{ color: '#d1d5db' }}>{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Tab: Clusters ── */}
            {activeTab === 'clusters' && (
              <div>
                {!clustersData && (
                  <div className="bg-[#111111] rounded-2xl border border-white/10 p-10 text-center">
                    <Layers className="w-12 h-12 mx-auto mb-4" style={{ color: '#1f2937' }} />
                    <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Cluster Your Keywords</h3>
                    <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
                      Group {results.seed_keywords.length} keywords into thematic clusters for content strategy
                    </p>
                    <button onClick={clusterKeywords} disabled={clustersLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-medium hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 transition">
                      {clustersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                      Cluster My Keywords
                    </button>
                  </div>
                )}

                {clustersLoading && (
                  <div className="bg-[#111111] rounded-2xl border border-white/10 p-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
                    <p className="text-sm" style={{ color: '#9ca3af' }}>Clustering keywords with AI...</p>
                  </div>
                )}

                {clustersData && !clustersLoading && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm" style={{ color: '#9ca3af' }}>
                        {clustersData.total_clusters} clusters from {results.seed_keywords.length} keywords
                      </p>
                      <button onClick={clusterKeywords} disabled={clustersLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                        style={{ color: '#d1d5db' }}>
                        <Layers className="w-3.5 h-3.5" /> Re-cluster
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clustersData.clusters.map((cluster, i) => {
                        const c = clusterColors[i % clusterColors.length];
                        return (
                          <div key={i} className={`bg-[#111111] rounded-2xl border ${c.border} p-6`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${c.dot} mt-1`} />
                                <h3 className="font-semibold" style={{ color: '#ffffff' }}>{cluster.cluster_name}</h3>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>
                                {cluster.keywords.length} kws
                              </span>
                            </div>
                            <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{cluster.theme}</p>
                            <div className="mb-3">
                              <span className="text-xs" style={{ color: '#6b7280' }}>Primary: </span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${c.badge}`}>
                                {cluster.primary_keyword}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cluster.keywords.slice(0, 8).map((kw, j) => (
                                <span key={j} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs"
                                  style={{ color: '#9ca3af' }}>
                                  {kw}
                                </span>
                              ))}
                              {cluster.keywords.length > 8 && (
                                <span className="px-2 py-0.5 text-xs" style={{ color: '#4b5563' }}>
                                  +{cluster.keywords.length - 8} more
                                </span>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getIntentColor(cluster.intent)} border`}>
                                {cluster.intent}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {clustersData.unclustered.length > 0 && (
                      <div className="bg-[#111111] rounded-xl border border-white/10 p-5">
                        <h3 className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>
                          Unclustered ({clustersData.unclustered.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {clustersData.unclustered.map((kw, i) => (
                            <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs"
                              style={{ color: '#6b7280' }}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
}
