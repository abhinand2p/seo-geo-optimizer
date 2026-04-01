'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  activeRoute: string;
}

const navItems = [
  { label: 'Home',      href: '/',          route: 'home' },
  { label: 'Dashboard', href: '/dashboard', route: 'dashboard' },
  { label: 'Keywords',  href: '/keywords',  route: 'keywords' },
  { label: 'Content',   href: '/content',   route: 'content' },
  { label: 'Optimizer', href: '/optimizer', route: 'optimizer' },
];

export default function AppHeader({ activeRoute }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen]       = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

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
          <nav className="hidden md:flex items-center gap-5">
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
                activeRoute === 'audit' ? 'bg-emerald-400 text-black' : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              Site Audit
            </Link>

            {/* Auth area */}
            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5 transition"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-semibold"
                    style={{ color: '#34d399' }}>
                    {initials}
                  </div>
                  <span className="text-sm max-w-[120px] truncate hidden lg:block" style={{ color: '#d1d5db' }}>
                    {user.full_name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs font-medium truncate" style={{ color: '#ffffff' }}>
                        {user.full_name || 'Account'}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#6b7280' }}>{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition"
                      style={{ color: '#d1d5db' }}>
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-500/10 transition"
                      style={{ color: '#f87171' }}>
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="text-sm px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition"
                style={{ color: '#d1d5db' }}>
                Log in
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center"
            style={{ color: '#ffffff' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-white/10 mt-4">
            {navItems.map((item) => (
              <Link
                key={item.route}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-2 text-sm rounded-lg"
                style={{ color: activeRoute === item.route ? '#34d399' : '#ffffff' }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-4 bg-emerald-500 text-black font-medium rounded-lg text-center mt-2"
            >
              Site Audit
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2 py-2.5 px-2 text-sm rounded-lg mt-1"
                style={{ color: '#f87171' }}
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-2 text-sm"
                style={{ color: '#d1d5db' }}>
                Log in
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
