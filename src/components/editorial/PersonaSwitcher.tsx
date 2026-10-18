'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Shield, UserCheck, RefreshCw, ChevronDown } from 'lucide-react';

interface AuthorOption {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  _count: {
    books: number;
    tickets: number;
  };
}

export function PersonaSwitcher() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AuthorOption[]>([]);
  const [currentId, setCurrentId] = useState<string>('AUTH001');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load accounts
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.authors) {
          setAccounts(data.authors);
          // Check local storage or default to Priya Sharma
          const savedId = localStorage.getItem('bookleaf_active_user_id') || 'AUTH001';
          setCurrentId(savedId);
          const found = data.authors.find((a: any) => a.id === savedId);
          if (found) setCurrentUser(found);
        }
      })
      .catch((err) => console.error('Failed to load accounts', err));
  }, []);

  const handleSwitch = async (id: string) => {
    setLoading(true);
    setCurrentId(id);
    localStorage.setItem('bookleaf_active_user_id', id);
    const target = accounts.find((a) => a.id === id);
    if (target) {
      setCurrentUser(target);
      if (target.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(`/author?authorId=${target.id}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800 text-white shadow-sm ring-1 ring-forest-900/20">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-editorial text-lg font-bold tracking-tight text-ink-950">
              BookLeaf
            </span>
            <span className="rounded bg-parchment-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-ink-700 uppercase">
              Publishing Desk
            </span>
          </div>
          <p className="text-[11px] text-ink-600">Author Support & Operations Portal</p>
        </div>
      </div>

      {/* Reviewer 1-Click Interactive Persona Switcher */}
      <div className="flex items-center space-x-3">
        <div className="hidden text-right md:block">
          <p className="text-[11px] font-medium text-ink-600">Reviewer Test Switcher:</p>
          <p className="text-xs font-semibold text-ink-900">
            {currentUser?.role === 'ADMIN' ? '🛡️ BookLeaf Operations Lead' : `✍️ Author: ${currentUser?.name}`}
          </p>
        </div>

        <div className="relative">
          <select
            value={currentId}
            onChange={(e) => handleSwitch(e.target.value)}
            disabled={loading}
            className="cursor-pointer rounded-lg border border-parchment-300 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-ink-900 shadow-sm transition hover:border-forest-600 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            <optgroup label="Operations Lead (Admin)">
              {accounts
                .filter((a) => a.role === 'ADMIN')
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    🛡️ {a.name} (Admin Dashboard)
                  </option>
                ))}
            </optgroup>
            <optgroup label="Seeded Authors (10 Authors)">
              {accounts
                .filter((a) => a.role === 'AUTHOR')
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    ✍️ {a.name} ({a._count.books} books · {a.city})
                  </option>
                ))}
            </optgroup>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-ink-600" />
        </div>

        {/* Quick Direct Link to Portal */}
        {currentUser?.role === 'ADMIN' ? (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-1.5 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-forest-900"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Queue</span>
          </button>
        ) : (
          <button
            onClick={() => router.push(`/author?authorId=${currentId}`)}
            className="flex items-center space-x-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-ink-950"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Author Portal</span>
          </button>
        )}
      </div>
    </div>
  );
}
