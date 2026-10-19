# BookLeaf Publishing: Architectural Approach & Engineering Write-Up
**Author:** Bama Charan Chhandogi  
**Position:** Full-Stack Developer  
**Live Production URL:** [https://bookleaf-portal-phi.vercel.app](https://bookleaf-portal-phi.vercel.app)  
**GitHub Repository:** [https://github.com/BamaCharanChhandogi/bookleaf-portal](https://github.com/BamaCharanChhandogi/bookleaf-portal)

---

## 1. Executive Summary & Approach
BookLeaf processes 1,200+ monthly titles across a catalog of 22,000+ books. Managing author inquiries at this scale requires solving two fundamental bottlenecks: **delayed manual communication** and **inconsistent operational policy adherence**.

Rather than treating AI as a simple chatbot or wrapper, this application is engineered as an **intelligence-assisted operations desk** coupled with a transparent **author self-service studio**. Every architectural layer—from schema design to prompt calibration—is anchored in BookLeaf's verified operating guidelines (80/20 royalty split, ₹1,000 rollover thresholds, 5–7 day Delhi reprint guarantees).

---

## 2. Key Priorities Chosen

### A. ACID Financial Integrity Over Loose Document Schemas
We prioritized a **Relational SQL schema (PostgreSQL via Prisma ORM)** over NoSQL. Self-publishing businesses rely heavily on financial ledgers: royalties per book, paid amounts, pending balances, and quarterly rollover thresholds. Relational foreign-key constraints ensure zero orphaned records between authors, books, tickets, and internal notes.

### B. High-Fidelity Knowledge Base Grounding & Token Budgeting
Dumping the entire 3,000+ token knowledge base into every LLM call is expensive and slow. We implemented a **RAG-lite semantic keyword slice retriever** (`getRelevantKnowledgeBase`). It selectively extracts only the policy domain matching the query (e.g. Royalty Policy vs. Printing & Defective Reprint Protocol), reducing token overhead by **~65%** and achieving sub-800ms draft generation with **Google Gemini 1.5 Flash**.

### C. Zero-Downtime Graceful Degradation (Circuit Breaker)
In production, third-party AI APIs will encounter rate limits or network latency. We built a deterministic **heuristic fallback classifier and rule-based template engine**. If the Gemini API is unreachable, tickets are still automatically categorized, scored, and seeded with structured drafts. The application **never crashes or blocks an author ticket submission**.

### D. Operations Ergonomics & Context-Preserving Layout
Operations leads handle hundreds of tickets daily. Instead of a crowded interface, we designed a **balanced 2-column workbench** (Live Conversation Thread & Internal Notes $\leftrightarrow$ Grounded Policy Draft Assistant) with a dedicated **horizontal Author & Book Dossier strip** on top. The reviewer has full visibility into the author's pending royalties and book sales without context switching.

---

## 3. Architectural Trade-Offs

| Decision | Chosen Path | Trade-Off & Mitigation |
| :--- | :--- | :--- |
| **Real-Time Layer** | **Server-Sent Events (SSE)** | SSE is unidirectional (server-to-client). While WebSockets allow full-duplex communication, SSE operates natively over standard HTTP/2, requires zero stateful socket servers or Redis adapters, and deploys reliably on serverless platforms (Vercel). We combined SSE with a 5-second polling fallback. |
| **Edge Authentication** | **HttpOnly Signed JWT Cookies** | Avoids storing authentication tokens in `localStorage` (protecting against XSS). Edge middleware handles route protection and role-based redirects before rendering pages. |
| **File Attachments** | **Frontend Validation UI** | The brief specified file attachment support as UI-only. We built an interactive drag-and-drop file interface with client validation; in a full enterprise deployment, this would pipe directly to S3 / Cloudflare R2 via presigned URLs. |

---

## 4. Future Evolution into an Enterprise Production System

1. **Hybrid Vector Search (pgvector):** Upgrade the keyword slice matcher to semantic vector embeddings in PostgreSQL for complex, multi-clause policy manuals spanning hundreds of pages.
2. **Omni-Channel Webhook Ingestion:** Ingest support tickets directly from author emails (SendGrid Inbound Parse) and WhatsApp Business API into the unified conversation stream.
3. **Automated Marketplace Sync Verification:** Implement automated cron jobs that check Amazon Seller Central and Flipkart APIs to detect stock synchronization issues before authors submit tickets.
4. **Audit Trail & SLA Monitoring:** Track first-response times (FRT) and mean-time-to-resolution (MTTR) with automated alerts for tickets nearing their 48-hour SLA deadline.
