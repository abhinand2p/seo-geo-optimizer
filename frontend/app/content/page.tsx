"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api`;

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
  content: string | string[]; // Can be single or array
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
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("neutral");
  const [optimizationType, setOptimizationType] = useState("seo");
  const [contentType, setContentType] = useState("paragraph");
  const [wordCount, setWordCount] = useState(150);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [tones, setTones] = useState<Tone[]>([]);
  const [seoTypes, setSeoTypes] = useState<ContentType[]>([]);
  const [geoTypes, setGeoTypes] = useState<ContentType[]>([]);
  const [selectedOption, setSelectedOption] = useState(0);

  useEffect(() => {
    // Load available tones
    axios
      .get(`${API_BASE_URL}/content/tones`)
      .then((res) => setTones(res.data.tones))
      .catch((err) => console.error("Error loading tones:", err));

    // Load content types
    axios
      .get(`${API_BASE_URL}/content/content-types`)
      .then((res) => {
        setSeoTypes(res.data.seo_types);
        setGeoTypes(res.data.geo_types);
      })
      .catch((err) => console.error("Error loading content types:", err));
  }, []);

  const generateContent = async () => {
    if (!topic.trim() || !keywords.trim()) {
      setError("Please enter both topic and keywords");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSelectedOption(0);

    try {
      const keywordList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      // Generate 5 variations
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

      // Combine all results
      const combinedResult = {
        ...responses[0].data,
        content: responses.map((r) => r.data.content),
      };

      setResult(combinedResult);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to generate content. Please try again."
      );
      console.error("Error:", err);
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

  const availableTypes = optimizationType === "geo" ? geoTypes : seoTypes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3">
  <Link 
    href="/"
    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
  >
    ← Keywords
  </Link>
  <Link 
    href="/optimizer"
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
  >
    Optimizer
  </Link>
</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Configure Content
            </h2>

            {/* Topic */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Email Marketing Strategies"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords (comma-separated) *
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., email automation, marketing tools, campaigns"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Optimization Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Optimization Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["seo", "geo", "both"].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setOptimizationType(type);
                      // Reset content type when switching
                      setContentType(
                        type === "geo" ? "definition" : "paragraph"
                      );
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      optimizationType === type
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                {availableTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                {tones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} - {t.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Word Count */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Word Count: {wordCount}
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50</span>
                <span>2000</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={generateContent}
              disabled={loading || !topic.trim() || !keywords.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
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
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <p className="text-sm font-medium text-gray-600">
                      Word Count
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {result.word_count}
                    </p>
                  </div>

                  {result.seo_score !== undefined && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-600">
                        SEO Score
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {result.seo_score}/100
                      </p>
                    </div>
                  )}

                  {result.citeability_score !== undefined && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                      <p className="text-sm font-medium text-gray-600">
                        GEO Score
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {result.citeability_score}/100
                      </p>
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
                    <p className="text-sm font-medium text-gray-600">Tone</p>
                    <p className="text-lg font-bold text-gray-900 mt-1 capitalize">
                      {result.tone}
                    </p>
                  </div>
                </div>

                {/* Generated Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Generated Content
                    </h3>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            Copied!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option Selector */}
                  {Array.isArray(result.content) && (
                    <div className="mb-4 flex gap-2">
                      {result.content.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedOption(idx)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            selectedOption === idx
                              ? "bg-purple-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Option {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="prose max-w-none">
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap">
                      {Array.isArray(result.content)
                        ? result.content[selectedOption]
                        : result.content}
                    </div>
                  </div>

                  {/* Keyword Usage */}
                  {result.keywords_used && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Keyword Usage:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.keywords_used).map(
                          ([kw, count]) => (
                            <span
                              key={kw}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                            >
                              {kw}: {count}x
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!result && !loading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Configure your content settings and click generate to see
                  results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
