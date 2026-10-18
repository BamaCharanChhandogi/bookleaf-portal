'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, Library, MessageSquare, LifeBuoy } from 'lucide-react';
import { UserNavMenu } from '@/components/navigation/UserNavMenu';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (!data.currentUser || data.currentUser.role !== 'AUTHOR') {
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

  const navLinks = [
    { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/books', label: 'My Books', icon: Library },
    { href: '/portal/tickets', label: 'Support Queries', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfbfa]">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-parchment-300 bg-white p-5 md:flex">
        <div>
          {/* Brand (Typographic, No Logo Icon) */}
          <Link href="/portal/dashboard" className="block px-2">
            <span className="font-editorial text-2xl font-bold tracking-tight text-ink-950">
              BookLeaf
            </span>
            <p className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Author Studio</p>
          </Link>

          {/* Navigation Items */}
          <nav className="mt-8 space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-ink-700 hover:bg-parchment-100 hover:text-ink-950'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Support Info */}
        <div className="rounded-2xl border border-parchment-200 bg-parchment-50 p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-ink-900">
            <LifeBuoy className="h-4 w-4 text-forest-700" />
            <span>Author Support</span>
          </div>
          <p className="mt-1 text-[11px] text-ink-600 leading-relaxed">
            Need urgent guidance regarding royalties, printing, or ISBN issues?
          </p>
          <Link
            href="/portal/tickets"
            className="mt-3 inline-block text-xs font-bold text-forest-800 underline underline-offset-4"
          >
            Submit Query ↗
          </Link>
        </div>
      </aside>

      {/* Main Content Shell with Scroll Container */}
      <div className="flex flex-1 flex-col h-screen overflow-y-auto">
        {/* Top Header (Permanently Sticky) */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-parchment-300 bg-[#fbfbfa]/95 px-6 backdrop-blur-md">
          {/* Mobile Brand Link */}
          <div className="flex items-center md:hidden">
            <span className="font-editorial text-xl font-bold text-ink-950">BookLeaf</span>
          </div>

          {/* Breadcrumb / Section indicator */}
          <div className="hidden text-xs text-ink-600 md:block">
            <span>Author Workspace</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-ink-950 capitalize">
              {pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>

          {/* User Profile Menu */}
          <div className="flex items-center space-x-4">
            <UserNavMenu user={user} />
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
