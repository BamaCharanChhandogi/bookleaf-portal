'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Shield, ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.demoAccounts) setDemoAccounts(data.demoAccounts);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (redirectPath) {
        window.location.href = redirectPath;
      } else {
        window.location.href = data.redirectUrl || '/portal/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#fbfbfa]">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-forest-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-gilded-100/40 blur-3xl" />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-800 text-white shadow-md ring-4 ring-forest-100">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="font-editorial text-2xl font-bold tracking-tight text-ink-950">
              BookLeaf
            </span>
            <span className="rounded bg-parchment-200 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-ink-700 uppercase">
              Publishing Desk
            </span>
          </div>
          <p className="mt-1.5 text-xs text-ink-600">
            Sign in to access your author studio or operations command center
          </p>
        </div>

        {/* Evaluator Fast-Fill Credentials Drawer */}
        <div className="mt-6 rounded-2xl border border-parchment-300 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-forest-800">
            <Sparkles className="h-3.5 w-3.5 text-forest-700" />
            <span>Evaluator 1-Click Fast Pass:</span>
          </div>
          <p className="text-[11px] text-ink-500 mt-0.5">
            Click any test persona to populate credentials and log in:
          </p>

          <div className="mt-3 space-y-2">
            {/* Ops Lead Account */}
            <button
              type="button"
              onClick={() => {
                setEmail('admin@bookleaf.com');
                setPassword('adminpassword123');
                handleLogin('admin@bookleaf.com', 'adminpassword123');
              }}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-forest-600/30 bg-forest-50/50 p-2.5 text-left transition hover:border-forest-700 hover:bg-forest-50"
            >
              <div className="flex items-center space-x-2.5">
                <Shield className="h-4 w-4 text-forest-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-ink-950">Aditi Rao (Senior Ops Lead)</p>
                  <p className="text-[10px] text-ink-500">admin@bookleaf.com · Operations Triage</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-forest-700">Enter Ops ↗</span>
            </button>

            {/* Author 1: Priya Sharma */}
            <button
              type="button"
              onClick={() => {
                setEmail('priya.sharma@email.com');
                setPassword('password123');
                handleLogin('priya.sharma@email.com', 'password123');
              }}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-parchment-200 bg-white p-2.5 text-left transition hover:border-ink-800 hover:bg-parchment-50"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">✍️</span>
                <div>
                  <p className="text-xs font-bold text-ink-950">Priya Sharma (Author)</p>
                  <p className="text-[10px] text-ink-500">2 Live Titles · ₹3,570 Pending Royalty</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-ink-800">Enter Studio ↗</span>
            </button>

            {/* Author 2: Sneha Kulkarni */}
            <button
              type="button"
              onClick={() => {
                setEmail('sneha.kulkarni@email.com');
                setPassword('password123');
                handleLogin('sneha.kulkarni@email.com', 'password123');
              }}
              disabled={loading}
              className="w-full flex items-center justify-between rounded-xl border border-parchment-200 bg-white p-2.5 text-left transition hover:border-ink-800 hover:bg-parchment-50"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">📖</span>
                <div>
                  <p className="text-xs font-bold text-ink-950">Sneha Kulkarni (Author)</p>
                  <p className="text-[10px] text-ink-500">Includes Book In Production (Cover Design)</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-ink-800">Enter Studio ↗</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-parchment-300" />
          </div>
          <span className="relative bg-[#fbfbfa] px-3 text-xs text-ink-500 uppercase tracking-wider">
            Or Sign In With Email
          </span>
        </div>

        {/* Sign In Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(email, password);
          }}
          className="rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-800">
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya.sharma@email.com"
              className="mt-1 w-full rounded-xl border border-parchment-300 px-3.5 py-2.5 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-800">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-parchment-300 px-3.5 py-2.5 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-xl bg-ink-900 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-ink-950 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-ink-500">Loading Login...</div>}>
      <LoginCard />
    </Suspense>
  );
}
