'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    city?: string | null;
  } | null;
}

export function UserNavMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2.5 rounded-full border border-parchment-300 bg-white p-1 pr-3 text-xs font-medium text-ink-800 transition hover:border-parchment-400 focus:outline-none"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-800 text-[11px] font-bold text-white">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <p className="font-semibold text-ink-950 leading-tight">{user.name}</p>
          <p className="text-[10px] text-ink-500 uppercase tracking-wider">{user.role}</p>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-ink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-parchment-300 bg-white p-2 shadow-xl z-50">
          <div className="border-b border-parchment-200 px-3 py-2">
            <p className="text-xs font-bold text-ink-950">{user.name}</p>
            <p className="text-[11px] text-ink-500 truncate">{user.email}</p>
            <span className="mt-1 inline-block rounded bg-parchment-100 px-2 py-0.5 text-[9px] font-bold text-forest-800 uppercase">
              {user.role === 'ADMIN' ? 'Operations Lead' : 'Author Account'}
            </span>
          </div>

          <div className="pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 text-left"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
