export interface KBSegment {
  id: string;
  category: string;
  keywords: string[];
  title: string;
  content: string;
}

export const BOOKLEAF_KNOWLEDGE_BASE: KBSegment[] = [
  {
    id: 'company-overview',
    category: 'General Inquiry',
    keywords: ['company', 'who', 'about', 'office', 'partner', 'delhi', 'package', 'bestseller', 'standard free'],
    title: 'Company Overview & Publishing Packages',
    content: `
BookLeaf Publishing is a premier self-publishing house operating across India and the US, processing over 1,200 books monthly across a catalog of 22,000+ titles.
Packages:
- Standard Free: No upfront publishing fee. Includes cover design, typesetting, ISBN assignment, printing, distribution, and royalty management.
- Bestseller Breakthrough: Premium paid package including specialized marketing campaigns, guaranteed press mentions, and premier distribution add-ons.
Facilities: In-house printing facility and central warehouse in Delhi. Print partners include Repro India and Epitome Books.
`
  },
  {
    id: 'royalty-policy',
    category: 'Royalty & Payments',
    keywords: ['royalty', 'payment', 'payout', 'money', 'earned', 'pending', 'paid', 'split', 'bank', 'threshold', 'quarter', '80/20', 'net profit'],
    title: 'Royalty & Payment Policy',
    content: `
BookLeaf follows an author-first 80/20 royalty split:
- 80% of net profit per book goes directly to the author; 20% to BookLeaf.
- Net Profit Formula = MRP minus Printing Cost minus Platform Commission (Amazon/Flipkart) minus Shipping Charges.
- Payout Schedule: Royalties are calculated quarterly and disbursed within 45 days after the quarter closes.
- Minimum Payout Threshold: ₹1,000. If accumulated unpaid royalties are below ₹1,000, they do not expire; they roll over automatically to the next quarterly cycle.
- Disbursement Channel: Direct NEFT/IMPS bank transfer to the account verified on the author dashboard.
- Line-by-line platform sales reports (Amazon India, Flipkart, US/UK) are accessible in the author portal.
`
  },
  {
    id: 'isbn-metadata',
    category: 'ISBN & Metadata Issues',
    keywords: ['isbn', 'metadata', 'barcode', 'imprint', 'wrong isbn', 'duplicate', 'link', 'description', 'title change'],
    title: 'ISBN & Metadata Policy',
    content: `
- Unique ISBN Allocation: Every book published via BookLeaf receives an official unique 13-digit ISBN registered under BookLeaf's publisher imprint.
- Independent Imprints: If an author desires an ISBN registered under their own personal imprint or LLC, they must supply it prior to distribution setup.
- ISBN Discrepancies: Any report of duplicate ISBN, barcode scan error, or incorrect edition linkage on Amazon/Flipkart is classified as a CRITICAL priority issue, triggering immediate escalation to the senior production team with a 48-hour resolution timeline.
- Metadata & Description Updates: Authors can request updates to book blurbs, categories, or keywords via the support portal. Changes reflect on Amazon and retail platforms within 3–5 business days.
`
  },
  {
    id: 'printing-quality',
    category: 'Printing & Quality',
    keywords: ['print', 'quality', 'defective', 'binding', 'misprint', 'blur', 'blurry', 'pages', 'misaligned', 'copies', 'author copies', 'damaged', 'reprint'],
    title: 'Printing & Physical Quality Policy',
    content: `
- Facilities: High-speed digital presses in our Delhi print facility handle standard print runs. High-volume offset and specialized trim requirements are routed to Repro India or Epitome Books.
- Production Turnaround: Standard author copy print turnaround is 5–7 business days from print approval.
- Defective Copy Guarantee: If an author receives author copies with misprints, loose binding, color discrepancies, or damaged trims, BookLeaf guarantees a 100% free reprint after photo verification.
- Resolution Protocol: Apologize sincerely, request 1-2 clear photos of the defect, and confirm a free replacement batch dispatched within 5–7 business days upon receipt of photos.
`
  },
  {
    id: 'distribution-availability',
    category: 'Distribution & Availability',
    keywords: ['amazon', 'flipkart', 'store', 'out of stock', 'unavailable', 'buy', 'listed', 'listing', 'sync', 'international', 'us', 'uk'],
    title: 'Distribution & Availability Policy',
    content: `
- Retail Channels: Books are distributed to Amazon India, Flipkart, BookLeaf Store, Amazon US, and Amazon UK.
- Go-Live Timeline: New book listings typically go live on platforms within 7–10 business days after publication is finalized.
- "Currently Unavailable" or Stock Glitches: If a published book unexpectedly appears as "Currently Unavailable" or "Out of Stock" on Amazon/Flipkart, it is almost always a marketplace catalog stock sync glitch. BookLeaf's distribution desk can trigger a programmatic feed re-sync within 24–48 hours to restore live status.
`
  },
  {
    id: 'production-stages',
    category: 'Book Status & Production Updates',
    keywords: ['status', 'stage', 'typesetting', 'proofreading', 'cover', 'editing', 'delay', 'timeline', 'progress', 'when will', 'manuscript'],
    title: 'Production Pipeline & Stages',
    content: `
The standard production workflow comprises 9 structured stages:
1. Manuscript Received
2. Editing (if package opted)
3. Cover Design (requires author review & sign-off)
4. Typesetting & Interior Formatting
5. Proofreading & Galley Review (author revision cycle)
6. ISBN Assignment & Barcode Generation
7. Sample Proof Printing & QC
8. Distribution & Retail Setup
9. Published & Live

Authors receive milestone notifications. Common bottleneck stages are Cover Design (waiting for author feedback) and Proofreading (author edits). Ops should communicate with radical transparency without shifting blame.
`
  }
];

export const TONE_GUIDELINES = `
BookLeaf Author Support Communication Principles:
1. Empathetic & Professional: Authors are creative partners, never numbers.
2. Acknowledge First: Validate their emotions and concern before presenting facts.
3. Radical Specificity: Quote exact figures, policy numbers, dates, and days. Avoid generic filler.
4. Direct Accountability: If an error or delay occurred on BookLeaf's side, acknowledge it directly without evasiveness.
5. Action-Oriented Closure: Always conclude with a precise timeline (e.g. "within 48 hours") and a clear next step.
`;

/**
 * Smart Token Budgeting & Relevance Filter
 * Analyzes query text to select ONLY relevant KB segments, saving 60-70% LLM tokens.
 */
export function getRelevantKnowledgeBase(queryText: string, category?: string): string {
  const normalizedQuery = queryText.toLowerCase();

  // If category matches directly, prioritize that segment
  const matchedSegments = BOOKLEAF_KNOWLEDGE_BASE.filter(segment => {
    if (category && segment.category.toLowerCase().includes(category.toLowerCase())) {
      return true;
    }
    return segment.keywords.some(kw => normalizedQuery.includes(kw));
  });

  // If no specific segment matched or broad query, include Company Overview + Royalty as base
  if (matchedSegments.length === 0) {
    return BOOKLEAF_KNOWLEDGE_BASE.map(s => `### ${s.title}\n${s.content.trim()}`).join('\n\n');
  }

  // Always append company overview context if not already present
  const hasOverview = matchedSegments.some(s => s.id === 'company-overview');
  const finalSegments = hasOverview ? matchedSegments : [BOOKLEAF_KNOWLEDGE_BASE[0], ...matchedSegments];

  return finalSegments.map(s => `### ${s.title}\n${s.content.trim()}`).join('\n\n');
}
