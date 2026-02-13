'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Zap,
  BarChart3,
  ArrowRight,
  Check,
  Bot,
  LineChart,
  Menu,
  X,
  ChevronRight,
  Shield,
  Target,
  Gauge
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/10' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-400 transition-colors duration-300">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">
                SEO<span className="text-emerald-400">&</span>GEO
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10">
              {['Features', 'Tools', 'Pricing'].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.2, duration: 0.4 }}
                  className="text-sm hover:text-emerald-400 transition-colors duration-300"
                  style={{ color: '#e5e7eb' }}
                >
                  {item}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Link
                  href="/audit"
                  className="text-sm px-5 py-2.5 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-all duration-300"
                >
                  Start Free Audit
                </Link>
              </motion.div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center hover:text-emerald-400 transition-colors"
              style={{ color: '#ffffff' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                {['Features', 'Tools', 'Pricing'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-emerald-400 transition-colors py-2"
                    style={{ color: '#ffffff' }}
                  >
                    {item}
                  </a>
                ))}
                <Link
                  href="/audit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-3 bg-emerald-500 text-black font-medium rounded-lg mt-4"
                >
                  Start Free Audit
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 pt-36 pb-24 md:pt-44 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium">AI-Powered Optimization</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
              style={{ color: '#ffffff' }}
            >
              <span style={{ color: '#ffffff' }}>Rank Higher.</span>
              <br />
              <span style={{ color: '#ffffff' }}>Get Cited by </span>
              <span style={{ color: '#34d399' }}>AI.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
              style={{ color: '#e5e7eb' }}
            >
              The complete toolkit for modern SEO. Optimize for Google,
              Bing, ChatGPT, Claude, and Perplexity — all in one platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/audit">
                <button className="group w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2">
                  Start Free Site Audit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
              <Link href="/keywords">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/20 font-semibold rounded-lg border border-white/30 hover:bg-white/25 hover:border-white/40 transition-all duration-300" style={{ color: '#ffffff' }}>
                  Generate Keywords
                </button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-8 mt-12 pt-12 border-t border-white/10"
            >
              {[
                { value: '10K+', label: 'Keywords Generated' },
                { value: '500+', label: 'Sites Audited' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: '#34d399' }}>{stat.value}</span>
                  <span className="text-sm" style={{ color: '#d1d5db' }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

              <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden">
                {/* Window Controls */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-white/20">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-white/10 rounded text-xs font-mono" style={{ color: '#9ca3af' }}>
                      seo-geo.app/audit
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Score */}
                    <div className="relative overflow-hidden bg-[#111111] rounded-xl p-6 border border-white/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-sm" style={{ color: '#d1d5db' }}>Overall Score</span>
                          <Gauge className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-bold" style={{ color: '#ffffff' }}>78</span>
                          <span className="mb-2" style={{ color: '#9ca3af' }}>/100</span>
                        </div>
                        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full w-[78%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Issues */}
                    <div className="relative overflow-hidden bg-[#111111] rounded-xl p-6 border border-white/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-sm" style={{ color: '#d1d5db' }}>Issues Found</span>
                          <Target className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: 'Critical', count: 2, color: 'bg-red-500' },
                            { label: 'Warnings', count: 5, color: 'bg-amber-500' },
                            { label: 'Passed', count: 18, color: 'bg-emerald-500' },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                <span className="text-sm" style={{ color: '#e5e7eb' }}>{item.label}</span>
                              </div>
                              <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Wins */}
                    <div className="relative overflow-hidden bg-[#111111] rounded-xl p-6 border border-white/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-sm" style={{ color: '#d1d5db' }}>Quick Wins</span>
                          <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="space-y-3">
                          {['Add meta descriptions', 'Compress images', 'Fix broken links'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-emerald-400" />
                              </div>
                              <span className="text-sm" style={{ color: '#ffffff' }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <span className="text-sm font-medium tracking-wide uppercase" style={{ color: '#34d399' }}>Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4" style={{ color: '#ffffff' }}>
              Built for the Future of Search
            </h2>
            <p className="text-lg max-w-xl" style={{ color: '#d1d5db' }}>
              Comprehensive tools to optimize your content for both traditional search engines and AI-powered platforms.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'SEO Keywords',
                description: 'Generate high-performing keywords optimized for Google and Bing search algorithms.',
                glow: 'bg-blue-500/20'
              },
              {
                icon: Bot,
                title: 'GEO Keywords',
                description: 'Keywords designed to get your content cited by ChatGPT, Claude, and Perplexity.',
                glow: 'bg-purple-500/20'
              },
              {
                icon: BarChart3,
                title: 'Site Audit',
                description: 'Comprehensive analysis of your website with actionable improvement suggestions.',
                glow: 'bg-emerald-500/20'
              },
              {
                icon: Sparkles,
                title: 'Content Generator',
                description: 'Create SEO and GEO optimized content that ranks and gets cited by AI systems.',
                glow: 'bg-amber-500/20'
              },
              {
                icon: Zap,
                title: 'Content Optimizer',
                description: 'Transform existing content for better search rankings and AI visibility.',
                glow: 'bg-orange-500/20'
              },
              {
                icon: LineChart,
                title: 'Analytics',
                description: 'Track your rankings and AI citations with comprehensive analytics dashboards.',
                glow: 'bg-cyan-500/20'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                {/* Card glow */}
                <div className={`absolute -inset-0.5 ${feature.glow} rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />

                <div className="relative p-6 bg-[#111111] rounded-xl border border-white/20 hover:border-white/30 transition-all duration-500 h-full">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors duration-500">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="relative z-10 py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium tracking-wide uppercase" style={{ color: '#34d399' }}>Tools</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4" style={{ color: '#ffffff' }}>
              Everything You Need
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#d1d5db' }}>
              Professional-grade tools powered by Claude AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Search,
                title: 'Keywords',
                description: 'SEO & GEO keywords',
                href: '/keywords',
                badge: null,
                glow: 'from-blue-500/30 to-blue-500/0'
              },
              {
                icon: Sparkles,
                title: 'Content',
                description: 'AI content generation',
                href: '/content',
                badge: null,
                glow: 'from-purple-500/30 to-purple-500/0'
              },
              {
                icon: Zap,
                title: 'Optimizer',
                description: 'Content optimization',
                href: '/optimizer',
                badge: null,
                glow: 'from-amber-500/30 to-amber-500/0'
              },
              {
                icon: BarChart3,
                title: 'Site Audit',
                description: 'Website analysis',
                href: '/audit',
                badge: 'NEW',
                glow: 'from-emerald-500/30 to-emerald-500/0'
              }
            ].map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={tool.href}>
                  <div className="group relative h-full">
                    {/* Hover glow */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-b ${tool.glow} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative h-full p-6 bg-[#111111] rounded-xl border border-white/20 hover:border-white/30 transition-all duration-500 cursor-pointer">
                      {tool.badge && (
                        <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-emerald-500 text-black text-xs font-bold rounded-md">
                          {tool.badge}
                        </div>
                      )}
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors duration-500">
                        <tool.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-base font-semibold mb-1" style={{ color: '#ffffff' }}>{tool.title}</h3>
                      <p className="text-sm mb-4" style={{ color: '#d1d5db' }}>{tool.description}</p>
                      <div className="flex items-center gap-1 text-sm group-hover:text-emerald-400 transition-colors duration-500" style={{ color: '#9ca3af' }}>
                        <span>Open</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-sm font-medium tracking-wide uppercase" style={{ color: '#34d399' }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6" style={{ color: '#ffffff' }}>
                Future-Proof Your SEO Strategy
              </h2>
              <p className="text-lg mb-8" style={{ color: '#d1d5db' }}>
                As AI chatbots become a primary source of information, traditional SEO isn&apos;t enough.
                Our platform helps you optimize for both search engines and AI systems.
              </p>

              <div className="space-y-4">
                {[
                  'Optimized for Google, Bing, and AI chatbots',
                  'Powered by Claude AI for intelligent suggestions',
                  'Real-time analysis and actionable insights',
                  'No credit card required to start'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500/30 rounded flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span style={{ color: '#ffffff' }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { icon: Search, label: 'SEO Analysis', value: 'Advanced' },
                  { icon: Bot, label: 'AI Optimization', value: 'Built-in' },
                  { icon: Shield, label: 'Data Security', value: 'Encrypted' },
                  { icon: Zap, label: 'Response Time', value: '<2s' },
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-[#111111] rounded-xl border border-white/20">
                    <item.icon className="w-5 h-5 text-emerald-400 mb-3" />
                    <div className="text-sm mb-1" style={{ color: '#9ca3af' }}>{item.label}</div>
                    <div className="text-lg font-semibold" style={{ color: '#ffffff' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="relative z-10 py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative group"
          >
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

            <div className="relative text-center p-10 md:p-14 bg-[#111111] rounded-2xl border border-white/20 overflow-hidden">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: '#d1d5db' }}>
                Start optimizing your content for search engines and AI systems today. Free to start, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/audit">
                  <button className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-all duration-300">
                    Start Free Site Audit
                  </button>
                </Link>
                <Link href="/keywords">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white/20 font-semibold rounded-lg border border-white/30 hover:bg-white/25 transition-all duration-300" style={{ color: '#ffffff' }}>
                    Try Keywords Generator
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-medium" style={{ color: '#ffffff' }}>SEO & GEO Optimizer</span>
            </div>
            <div className="flex items-center gap-8">
              {['Features', 'Tools', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm hover:text-emerald-400 transition-colors duration-300" style={{ color: '#d1d5db' }}>
                  {item}
                </a>
              ))}
            </div>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              © 2026 SEO & GEO Optimizer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
