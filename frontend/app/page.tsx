'use client';

import Link from 'next/link';
import { Sparkles, Search, Zap, BarChart3, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header/Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SEO & GEO Optimizer</span>
            </div>
            <nav className="flex gap-6">
              <Link href="#features" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                Features
              </Link>
              <Link href="#tools" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                Tools
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered SEO & GEO Optimization
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Optimize Your Content for
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Search Engines & AI Chatbots
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Generate keywords, create optimized content, and audit websites with AI-powered tools.
            Rank higher on Google and get cited by ChatGPT, Claude, and Perplexity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/audit"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              Try Site Audit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/keywords"
              className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all"
            >
              Generate Keywords
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Dominate Search
            </h2>
            <p className="text-xl text-gray-600">
              Powered by Claude AI for intelligent optimization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">SEO Keywords</h3>
              <p className="text-gray-600 mb-4">
                Generate high-performing keywords optimized for traditional search engines like Google and Bing.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Long-tail keyword suggestions</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Difficulty & intent analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Question-based keywords</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">GEO Keywords</h3>
              <p className="text-gray-600 mb-4">
                Get keywords optimized for Generative AI Engines - ChatGPT, Claude, and Perplexity.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>AI-citation worthy phrases</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Authoritative content topics</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Definition-style keywords</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Site Audit</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive AI-powered website analysis with actionable improvement suggestions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>SEO & performance scores</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Design & content analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>AI-powered suggestions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Tool
            </h2>
            <p className="text-xl text-gray-600">
              All tools are powered by Claude AI for intelligent results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Keywords Tool */}
            <Link
              href="/keywords"
              className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-100 hover:border-blue-300"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Keyword Generator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate SEO & GEO optimized keywords for any topic
              </p>
              <div className="flex items-center text-blue-600 font-medium text-sm">
                Launch Tool
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Content Generator */}
            <Link
              href="/content"
              className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-100 hover:border-purple-300"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Content Generator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create SEO & GEO optimized content with AI
              </p>
              <div className="flex items-center text-purple-600 font-medium text-sm">
                Launch Tool
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Content Optimizer */}
            <Link
              href="/optimizer"
              className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-100 hover:border-green-300"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Content Optimizer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Optimize existing content for better rankings
              </p>
              <div className="flex items-center text-green-600 font-medium text-sm">
                Launch Tool
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Site Audit */}
            <Link
              href="/audit"
              className="group bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-bl-lg">
                NEW
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Site Audit</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Comprehensive website analysis with AI insights
              </p>
              <div className="flex items-center text-white font-medium text-sm">
                Launch Tool
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Dominate Search Results?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Start optimizing your content for both traditional search engines and AI chatbots today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/audit"
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              Get Free Site Audit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/keywords"
              className="px-8 py-4 bg-indigo-700 text-white rounded-xl font-semibold text-lg hover:bg-indigo-800 transition-all"
            >
              Generate Keywords
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SEO & GEO Optimizer</span>
          </div>
          <p className="text-sm">
            © 2026 SEO & GEO Optimizer. Powered by Claude AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
