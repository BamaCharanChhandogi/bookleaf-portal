import Link from 'next/link';
import { BookOpen, Shield, Sparkles, ArrowRight, Zap, CheckCircle2, IndianRupee, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-[#fbfbfa]">
      {/* Background Subtle Ink Circles */}
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-forest-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-gilded-100/50 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Editorial Masthead */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-forest-600/20 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>BookLeaf Technical Evaluation Showcase</span>
          </div>

          <h1 className="font-editorial mt-6 text-4xl font-extrabold tracking-tight text-ink-950 sm:text-6xl sm:leading-tight">
            Author Support & <br />
            <span className="italic text-forest-800">Communication Portal</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-600 sm:text-lg">
            A production-grade, AI-assisted platform empowering BookLeaf Publishing to manage over 22,000+ catalog titles, 
            author royalties, and real-time operational tickets with grounded knowledge base AI.
          </p>
        </div>

        {/* Two Portals Selection Cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Author Portal Entry */}
          <div className="group relative rounded-2xl border border-parchment-300 bg-white p-8 shadow-book transition-all hover:-translate-y-1 hover:border-ink-800 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-parchment-100 text-ink-900 group-hover:bg-ink-900 group-hover:text-white transition">
              <BookOpen className="h-6 w-6" />
            </div>

            <div className="mt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                Author Experience
              </span>
              <h2 className="font-editorial mt-1 text-2xl font-bold text-ink-950">
                Author Portal & Bookshelf
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Explore published books, ISBN status, sales figures, and royalty payouts (with ₹1,000 minimum rollover notifications).
                Submit support tickets with instant real-time conversational sync.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink-700">
              <span className="rounded bg-parchment-100 px-2.5 py-1">📚 My Books & ISBNs</span>
              <span className="rounded bg-parchment-100 px-2.5 py-1">💰 Royalty Ledger</span>
              <span className="rounded bg-parchment-100 px-2.5 py-1">⚡ Live Real-Time Thread</span>
            </div>

            <div className="mt-8 border-t border-parchment-200 pt-6">
              <Link
                href="/author?authorId=AUTH001"
                className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink-950"
              >
                <span>Enter Author Dashboard (Priya Sharma)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Admin Operations Entry */}
          <div className="group relative rounded-2xl border border-parchment-300 bg-white p-8 shadow-book transition-all hover:-translate-y-1 hover:border-forest-700 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-800 group-hover:bg-forest-800 group-hover:text-white transition">
              <Shield className="h-6 w-6" />
            </div>

            <div className="mt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-gilded-600">
                Operations Command Center
              </span>
              <h2 className="font-editorial mt-1 text-2xl font-bold text-ink-950">
                Admin Triage & AI Co-Pilot
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Unified ticket triage queue with AI auto-classification, priority scoring, author financial dossier side-panel, 
                and knowledge-base grounded draft generator with 1-click approval.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink-700">
              <span className="rounded bg-parchment-100 px-2.5 py-1">✨ Automated Query Triage</span>
              <span className="rounded bg-parchment-100 px-2.5 py-1">📖 Policy-Grounded Drafts</span>
              <span className="rounded bg-parchment-100 px-2.5 py-1">🔒 Private Internal Notes</span>
            </div>

            <div className="mt-8 border-t border-parchment-200 pt-6">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-forest-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-900"
              >
                <span>Enter Operations Command Desk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 rounded-2xl border border-parchment-300 bg-parchment-100/70 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-editorial text-xl font-bold text-ink-950">
              Publishing Desk Highlights
            </h3>
            <Link
              href="/api/docs"
              target="_blank"
              className="text-xs font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-900"
            >
              View API Documentation ↗
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-start space-x-3">
              <Cpu className="mt-0.5 h-5 w-5 text-forest-700 shrink-0" />
              <div>
                <p className="text-sm font-bold text-ink-900">Policy-Grounded Intelligence</p>
                <p className="text-xs text-ink-600 mt-1">
                  Semantic knowledge retrieval grounds every operational draft directly in verified BookLeaf guidelines.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Zap className="mt-0.5 h-5 w-5 text-gilded-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-ink-900">Zero-Reload Live Sync</p>
                <p className="text-xs text-ink-600 mt-1">
                  Server-Sent Events (SSE) updates the author ticket view instantaneously when an ops admin replies.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-forest-700 shrink-0" />
              <div>
                <p className="text-sm font-bold text-ink-900">Fault-Tolerant Fallback</p>
                <p className="text-xs text-ink-600 mt-1">
                  Full graceful degradation: If the AI API is rate-limited or offline, rule-based heuristics keep the portal running 100%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
