'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3, Search, FileText, Zap, CheckCircle, Circle,
  TrendingUp, Lightbulb, ArrowRight, ChevronRight, Bot, Globe, Loader2
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
}

interface Checklist {
  audit_run: boolean;
  keywords_generated: boolean;
  content_created: boolean;
  competitor_analyzed: boolean;
  keywords_exported: boolean;
}

const defaultChecklist: Checklist = {
  audit_run: false,
  keywords_generated: false,
  content_created: false,
  competitor_analyzed: false,
  keywords_exported: false,
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [checklist, setChecklist] = useState<Checklist>(defaultChecklist);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [keywordsCount, setKeywordsCount] = useState(0);

  // Client-side auth guard (middleware handles server-side)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seo_checklist');
      if (saved) setChecklist(JSON.parse(saved));

      const acts = localStorage.getItem('seo_activity');
      if (acts) setActivity(JSON.parse(acts));

      const kc = localStorage.getItem('seo_keywords_count');
      if (kc) setKeywordsCount(parseInt(kc) || 0);
    } catch {}
  }, []);

  const checklistItems = [
    { key: 'audit_run', label: 'Run your first site audit', href: '/audit' },
    { key: 'keywords_generated', label: 'Generate your first keywords', href: '/keywords' },
    { key: 'content_created', label: 'Create optimized content', href: '/content' },
    { key: 'competitor_analyzed', label: 'Analyze a competitor', href: '/keywords' },
    { key: 'keywords_exported', label: 'Export a keyword list', href: '/keywords' },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPct = Math.round((completedCount / checklistItems.length) * 100);

  const quickActions = [
    { icon: BarChart3, label: 'Site Audit', desc: 'Analyze your website', href: '/audit', color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', glow: 'hover:border-indigo-500/50' },
    { icon: Search, label: 'Keywords', desc: 'Research & discover keywords', href: '/keywords', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', glow: 'hover:border-blue-500/50' },
    { icon: FileText, label: 'Content Generator', desc: 'Create AI-optimized content', href: '/content', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', glow: 'hover:border-purple-500/50' },
    { icon: Zap, label: 'Content Optimizer', desc: 'Improve existing content', href: '/optimizer', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', glow: 'hover:border-amber-500/50' },
  ];

  const tips = [
    { icon: Search, title: 'Focus on Long-tail Keywords', desc: 'Long-tail keywords (4+ words) have lower competition and higher conversion rates. Use the Keywords tab to filter by word count.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Bot, title: 'Optimize for AI Citations', desc: 'Use GEO keywords to get cited by ChatGPT, Claude, and Perplexity. Authoritative, factual phrasing gets cited more often.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: TrendingUp, title: 'Cluster Keywords by Topic', desc: 'Group related keywords into topic clusters and create dedicated pages for each. This signals topical authority to search engines.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const activityIcons: Record<string, typeof Search> = {
    audit: BarChart3,
    keywords: Search,
    content: FileText,
    competitor: Globe,
    export: TrendingUp,
  };

  // Show spinner while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/8 rounded-full blur-[150px]" />
      </div>

      <AppHeader activeRoute="dashboard" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>
            Welcome to SEO & GEO Optimizer
          </h1>
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Your AI-powered optimization hub — all tools in one place
          </p>
        </motion.div>

        {/* Visibility Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        >
          {/* SEO Visibility */}
          <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-white/5 rounded-full" style={{ color: '#9ca3af' }}>SEO</span>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#34d399' }}>
              {checklist.audit_run ? '—' : '—'}
            </p>
            <p className="text-sm font-medium mb-1" style={{ color: '#ffffff' }}>Visibility Score</p>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Google & Bing visibility</p>
            {!checklist.audit_run && (
              <Link href="/audit" className="text-xs flex items-center gap-1 hover:text-emerald-400 transition-colors" style={{ color: '#9ca3af' }}>
                Run audit to calculate <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* AI Visibility */}
          <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-white/5 rounded-full" style={{ color: '#9ca3af' }}>AI</span>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#a78bfa' }}>—</p>
            <p className="text-sm font-medium mb-1" style={{ color: '#ffffff' }}>AI Visibility</p>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Citations in ChatGPT, Claude, Perplexity</p>
            <Link href="/keywords" className="text-xs flex items-center gap-1 hover:text-purple-400 transition-colors" style={{ color: '#9ca3af' }}>
              Generate GEO keywords <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Keywords Researched */}
          <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-white/5 rounded-full" style={{ color: '#9ca3af' }}>Keywords</span>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#60a5fa' }}>{keywordsCount}</p>
            <p className="text-sm font-medium mb-1" style={{ color: '#ffffff' }}>Keywords Researched</p>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Total keywords analyzed</p>
            <Link href="/keywords" className="text-xs flex items-center gap-1 hover:text-blue-400 transition-colors" style={{ color: '#9ca3af' }}>
              Research more keywords <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={`group bg-[#111111] rounded-xl border ${action.border} ${action.glow} p-5 hover:bg-white/5 transition-all duration-300 cursor-pointer`}>
                    <div className={`w-10 h-10 ${action.bg} rounded-lg flex items-center justify-center mb-3`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#ffffff' }}>{action.label}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{action.desc}</p>
                    <div className={`flex items-center gap-1 mt-3 text-xs ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Open <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Setup Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#111111] rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Setup Checklist</h2>
              <span className="text-xs font-medium px-2 py-1 bg-emerald-500/20 rounded-full" style={{ color: '#34d399' }}>
                {completedCount}/{checklistItems.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full mb-5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-3">
              {checklistItems.map((item) => {
                const done = checklist[item.key as keyof Checklist];
                return (
                  <Link key={item.key} href={item.href}>
                    <div className="flex items-center gap-3 py-1.5 group cursor-pointer">
                      {done
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: '#374151' }} />
                      }
                      <span
                        className={`text-sm ${done ? 'line-through' : ''} group-hover:text-emerald-400 transition-colors`}
                        style={{ color: done ? '#6b7280' : '#d1d5db' }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity + Growth Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#111111] rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#ffffff' }}>Recent Activity</h2>
            {activity.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: '#1f2937' }} />
                <p className="text-sm" style={{ color: '#6b7280' }}>No recent activity.</p>
                <p className="text-xs mt-1" style={{ color: '#374151' }}>Start by running a site audit or generating keywords.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 8).map((act) => {
                  const Icon = activityIcons[act.type] || TrendingUp;
                  return (
                    <div key={act.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: '#d1d5db' }}>{act.description}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: '#6b7280' }}>{timeAgo(act.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Growth Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-[#111111] rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Growth Tips</h2>
            </div>
            <div className="space-y-4">
              {tips.map((tip, i) => (
                <div key={i} className={`p-4 ${tip.bg} rounded-xl border border-white/5`}>
                  <div className="flex items-center gap-2 mb-1">
                    <tip.icon className={`w-4 h-4 ${tip.color}`} />
                    <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>{tip.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{tip.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
