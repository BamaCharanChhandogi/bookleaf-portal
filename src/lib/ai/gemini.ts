import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRelevantKnowledgeBase, TONE_GUIDELINES } from './knowledge-base';

export interface TicketContext {
  authorName: string;
  authorEmail: string;
  bookTitle?: string | null;
  bookIsbn?: string | null;
  bookStatus?: string | null;
  totalSold?: number | null;
  royaltyPending?: number | null;
  lastPayoutDate?: string | null;
  subject: string;
  description: string;
}

export interface ClassificationResult {
  category: 'Royalty & Payments' | 'ISBN & Metadata Issues' | 'Printing & Quality' | 'Distribution & Availability' | 'Book Status & Production Updates' | 'General Inquiry';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityReason: string;
  confidence: number;
}

export interface AIDraftResult {
  draftResponse: string;
  citedPolicy: string;
  suggestedAction: string;
  tokenStats?: {
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
  };
}

/**
 * Fallback Rule-Based Classifier for Graceful Degradation
 * Ensures tickets get classified and tagged even if the API key is absent or quota is exceeded.
 */
export function fallbackClassify(text: string): ClassificationResult {
  const lower = text.toLowerCase();

  if (lower.includes('royalty') || lower.includes('payment') || lower.includes('money') || lower.includes('payout') || lower.includes('earned') || lower.includes('bank')) {
    const isCritical = lower.includes('never') || lower.includes('6 months') || lower.includes('months') || lower.includes('overdue');
    return {
      category: 'Royalty & Payments',
      priority: isCritical ? 'HIGH' : 'MEDIUM',
      priorityReason: isCritical ? 'Author inquiring about overdue or missing royalty payouts' : 'Standard royalty balance or payout cycle inquiry',
      confidence: 0.88,
    };
  }

  if (lower.includes('isbn') || lower.includes('barcode') || lower.includes('imprint') || lower.includes('wrong book')) {
    return {
      category: 'ISBN & Metadata Issues',
      priority: 'CRITICAL',
      priorityReason: 'ISBN or catalog metadata discrepancies directly impact retail listings',
      confidence: 0.92,
    };
  }

  if (lower.includes('binding') || lower.includes('blur') || lower.includes('misprint') || lower.includes('damaged') || lower.includes('quality') || lower.includes('torn')) {
    return {
      category: 'Printing & Quality',
      priority: 'HIGH',
      priorityReason: 'Physical quality or defective author copy defect requiring reprint protocol',
      confidence: 0.90,
    };
  }

  if (lower.includes('unavailable') || lower.includes('out of stock') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('buy')) {
    return {
      category: 'Distribution & Availability',
      priority: 'MEDIUM',
      priorityReason: 'Retail channel availability or marketplace stock synchronization request',
      confidence: 0.85,
    };
  }

  if (lower.includes('typesetting') || lower.includes('cover') || lower.includes('proofreading') || lower.includes('status') || lower.includes('when will') || lower.includes('stage')) {
    return {
      category: 'Book Status & Production Updates',
      priority: 'MEDIUM',
      priorityReason: 'Author seeking update on active publishing or typesetting pipeline milestones',
      confidence: 0.82,
    };
  }

  return {
    category: 'General Inquiry',
    priority: 'LOW',
    priorityReason: 'General inquiry or procedural question',
    confidence: 0.75,
  };
}

/**
 * Classifies an incoming ticket using Gemini or falls back gracefully
 */
export async function classifyTicket(subject: string, description: string): Promise<ClassificationResult> {
  const combinedText = `${subject}\n${description}`;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️ No GEMINI_API_KEY provided; utilizing high-accuracy rule-based classifier fallback.');
    return fallbackClassify(combinedText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `
You are the Senior Triage AI for BookLeaf Publishing.
Classify the following author support query into exactly one category and assign an operational priority score.

Categories available:
- "Royalty & Payments"
- "ISBN & Metadata Issues"
- "Printing & Quality"
- "Distribution & Availability"
- "Book Status & Production Updates"
- "General Inquiry"

Priority Scoring Rules:
- CRITICAL: Severe data integrity issues (e.g. ISBN mismatch on Amazon, duplicated edition), damaged print runs for book launches, royalties overdue by > 6 months.
- HIGH: Overdue royalty queries above ₹1,000 threshold, defective physical author copies needing reprint, listing completely broken.
- MEDIUM: Standard timeline inquiries, stock sync requests, general royalties status within normal quarterly window.
- LOW: Minor bio/description updates, general curiosity questions.

Input Query:
Subject: "${subject}"
Description: "${description}"

Respond ONLY in valid JSON matching this schema:
{
  "category": "Royalty & Payments | ISBN & Metadata Issues | Printing & Quality | Distribution & Availability | Book Status & Production Updates | General Inquiry",
  "priority": "CRITICAL | HIGH | MEDIUM | LOW",
  "priorityReason": "Concise 1-sentence operational justification",
  "confidence": 0.95
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      category: parsed.category || 'General Inquiry',
      priority: parsed.priority || 'MEDIUM',
      priorityReason: parsed.priorityReason || 'Classified via Gemini AI triage engine',
      confidence: parsed.confidence || 0.9,
    };
  } catch (error) {
    console.error('Gemini Classification Error, degrading gracefully:', error);
    return fallbackClassify(combinedText);
  }
}

/**
 * Generates an empathetic, grounded draft response for operations
 */
export async function generateAIDraftResponse(context: TicketContext, category?: string): Promise<AIDraftResult> {
  const relevantKB = getRelevantKnowledgeBase(`${context.subject} ${context.description}`, category);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return generateFallbackDraft(context, category);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
      },
    });

    const prompt = `
You are drafting an official support response on behalf of BookLeaf Publishing's operations team to an author.

### Tone & Style Directives:
${TONE_GUIDELINES}

### Verified BookLeaf Knowledge Base Context (Ground your response strictly in these policies):
${relevantKB}

### Live Author & Catalog Context:
- Author Name: ${context.authorName}
- Author Email: ${context.authorEmail}
- Linked Book Title: ${context.bookTitle || 'General / Not Book-Specific'}
- Book ISBN: ${context.bookIsbn || 'N/A'}
- Current Status: ${context.bookStatus || 'N/A'}
- Total Sold: ${context.totalSold ?? 'N/A'} copies
- Pending Royalty: ₹${context.royaltyPending ?? 'N/A'}
- Last Payout Date: ${context.lastPayoutDate || 'None recorded'}

### Incoming Author Ticket:
Subject: ${context.subject}
Message: ${context.description}

### Instructions:
1. Address the author warmly by their first name (${context.authorName.split(' ')[0]}).
2. Directly answer their query using the specific BookLeaf policies (quote numbers, timelines like 45-day window, 5-7 business days, ₹1,000 threshold, 80/20 split as applicable).
3. Do NOT give vague corporate promises; state the exact resolution timeline (e.g. 24-48 hours, 5-7 business days).
4. Provide a professional, warm closing.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      draftResponse: text,
      citedPolicy: category ? `BookLeaf ${category} Protocol` : 'BookLeaf Operations Knowledge Base',
      suggestedAction: 'Review details with author ledger and approve draft',
      tokenStats: {
        estimatedInputTokens: Math.round(prompt.length / 4),
        estimatedOutputTokens: Math.round(text.length / 4),
      },
    };
  } catch (error) {
    console.error('Gemini Draft Generation Error, degrading gracefully:', error);
    return generateFallbackDraft(context, category);
  }
}

/**
 * Fallback Draft Generator for Offline / Quota Resilience
 */
function generateFallbackDraft(context: TicketContext, category?: string): AIDraftResult {
  const firstName = context.authorName.split(' ')[0];
  let response = '';
  let policy = '';

  if (category === 'Royalty & Payments' || context.subject.toLowerCase().includes('royalty')) {
    policy = 'Royalty Policy (80/20 Split, Quarterly Cycle, ₹1,000 Threshold)';
    response = `Dear ${firstName},

Thank you for reaching out to BookLeaf Publishing. We completely understand your concern regarding your royalties.

Under BookLeaf's Royalty Policy, royalties are distributed on an 80/20 net profit split, calculated quarterly and disbursed within 45 days of the quarter ending. 

${context.royaltyPending !== undefined && context.royaltyPending !== null
  ? `According to our records for ${context.bookTitle || 'your title'}, your current pending royalty balance is ₹${context.royaltyPending}. ${context.royaltyPending >= 1000 ? 'Since this exceeds our ₹1,000 minimum payout threshold, it is queued for the upcoming quarterly payout cycle.' : 'Please note that because this is currently below the ₹1,000 minimum payout threshold, it safely rolls over to combine with next quarter’s sales.'}`
  : 'Our finance team is currently reviewing your platform sales ledger.'}

We are reviewing your bank transfer linkage to verify everything is in order. You will receive an update from our team within 48 hours.

Warm regards,  
BookLeaf Support Team`;
  } else if (category === 'Printing & Quality') {
    policy = 'Printing & Quality Policy (Complimentary Reprint Guarantee)';
    response = `Dear ${firstName},

We sincerely apologize for the quality issue you observed with your copies of ${context.bookTitle || 'your book'}. 

At BookLeaf, we hold our physical print craftsmanship to high standards. Under our Quality Guarantee, if any copies exhibit defects such as misprints, loose binding, or alignment issues, we will arrange a 100% free reprint batch.

Could you kindly share 1-2 photographs displaying the defective copies? Once our Delhi production team confirms the details, a replacement batch will be dispatched within 5–7 business days.

Warm regards,  
BookLeaf Production Team`;
  } else if (category === 'ISBN & Metadata Issues') {
    policy = 'ISBN & Metadata Policy (Critical 48-Hour Escalation)';
    response = `Dear ${firstName},

Thank you for bringing this to our attention. We treat any ISBN or retail listing discrepancies as a top-priority operational matter.

We have immediately escalated this ticket to our senior catalog management team. Our distribution engineers are investigating the metadata linkage across Amazon and partner channels to ensure your book details are accurately reflected.

We will have this verified and resolved for you within 48 hours.

Warm regards,  
BookLeaf Operations Desk`;
  } else {
    policy = 'General Support Policy';
    response = `Dear ${firstName},

Thank you for contacting BookLeaf Publishing. We have received your query regarding "${context.subject}".

Our team is reviewing the details of your account ${context.bookTitle ? `and book "${context.bookTitle}"` : ''}. We will look into this thoroughly and follow up with a concrete update within 24 to 48 hours.

Warm regards,  
BookLeaf Support Team`;
  }

  return {
    draftResponse: response,
    citedPolicy: policy,
    suggestedAction: 'Verify author details and send reply',
  };
}
