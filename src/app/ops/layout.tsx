'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Inbox, BarChart3, Clock, Sparkles } from 'lucide-react';
import { UserNavMenu } from '@/components/navigation/UserNavMenu';

interface OpsLayoutProps {
  children: React.ReactNode;
}

export default function OpsLayout({ children }: OpsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (!data.currentUser || data.currentUser.role !== 'ADMIN') {
          router.push('/login');
        } else {
          setUser(data.currentUser);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fbfbfa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fbfbfa]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-parchment-300 bg-white p-5 md:flex">
        <div>
          {/* Brand */}
          <Link href="/ops/queue" className="flex items-center space-x-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-editorial text-lg font-bold tracking-tight text-ink-950">
                BookLeaf
              </span>
              <p className="text-[10px] text-forest-700 uppercase tracking-wider font-bold">Ops Command Desk</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="mt-8 space-y-1.5">
            <Link
              href="/ops/queue"
              className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                pathname.startsWith('/ops/queue') || pathname.startsWith('/ops/tickets')
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'text-ink-700 hover:bg-parchment-100 hover:text-ink-950'
              }`}
            >
              <Inbox className="h-4 w-4 shrink-0" />
              <span>Triage Queue</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Shell */}
      <div className="flex flex-1 flex-col">
        {/* Top Operations Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-parchment-300 bg-[#fbfbfa]/95 px-6 backdrop-blur-md">
          <div className="flex items-center space-x-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-800 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-editorial text-base font-bold text-ink-950">Ops Command</span>
          </div>

          <div className="hidden text-xs text-ink-600 md:block">
            <span>Operations Center</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-ink-950 capitalize">Support Triage Queue</span>
          </div>

          <div className="flex items-center space-x-3.5">
            {/* Top-Right Smart Operations Status Badge */}
            <div className="hidden sm:inline-flex items-center space-x-2 rounded-full border border-forest-600/20 bg-forest-50/90 px-3.5 py-1.5 text-xs font-semibold text-forest-900 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <Sparkles className="h-3.5 w-3.5 text-forest-700" />
              <span>Smart Operations Active</span>
              <span className="hidden lg:inline text-[10px] text-forest-700/70 font-normal border-l border-forest-600/20 pl-2">
                Policy Grounding & SLA Tracking
              </span>
            </div>

            <UserNavMenu user={user} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
