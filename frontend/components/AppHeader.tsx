'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';

interface AppHeaderProps {
  activeRoute: string;
}

const navItems = [
  { label: 'Home', href: '/', route: 'home' },
  { label: 'Dashboard', href: '/dashboard', route: 'dashboard' },
  { label: 'Keywords', href: '/keywords', route: 'keywords' },
  { label: 'Content', href: '/content', route: 'content' },
  { label: 'Optimizer', href: '/optimizer', route: 'optimizer' },
];

export default function AppHeader({ activeRoute }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
            {navItems.map((item) => (
              <Link
                key={item.route}
                href={item.href}
                className="text-sm transition-colors hover:text-emerald-400"
                style={{ color: activeRoute === item.route ? '#34d399' : '#d1d5db' }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/audit"
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                activeRoute === 'audit'
                  ? 'bg-emerald-400 text-black'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              Site Audit
            </Link>
          </nav>

          {/* Mobile Toggle */}
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
            {navItems.map((item) => (
              <Link
                key={item.route}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm"
                style={{ color: activeRoute === item.route ? '#34d399' : '#ffffff' }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-4 bg-emerald-500 text-black font-medium rounded-lg text-center"
            >
              Site Audit
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
