# 🎬 3–5 Minute Screen Recording Walkthrough Script
### BookLeaf Technical Assignment 2: Author Royalty Dashboard & Automated Notification System

Use this step-by-step recording script for your Loom / Screen recording submission. It covers all 4 evaluation categories in under 4 minutes.

---

### ⏱️ Timestamp & Speaking Script

#### **0:00 – 0:45 | Introduction & Architecture Overview**
- **What to show on screen**: Bubble Editor or Live App Homepage.
- **What to say**:
  > *"Hello BookLeaf hiring team! In this video, I'll walk you through Assignment 2: the Author Royalty Dashboard and Automated Notification System. The solution combines a Bubble.io frontend with an n8n automation backend and Google Gemini AI. Let's start with the Author Portal."*

---

#### **0:45 – 1:30 | Author Portal & Traffic-Light Royalty Indicators**
- **What to show on screen**: Log in as Priya Sharma (`priya.sharma@email.com`).
- **What to say**:
  > *"Here is the Author Portal for Priya Sharma. At the top, we see her consolidated metrics: 342 copies sold, ₹11,970 total royalty earned, and ₹3,570 pending balance.*
  >
  > *Down in her book list, notice the traffic-light royalty status indicator. Priya's book shows a Yellow 'Pending' badge because it's within the quarterly payout window. If we log in as Farhan Sheikh, who has zero pending dues, it shows a clean Green 'Fully Paid' badge. And for books with pending royalties older than 90 days, it automatically switches to a Red 'Overdue' badge.*
  >
  > *Also, privacy rules ensure Priya can only ever view her own titles."*

---

#### **1:30 – 2:30 | Admin Portal, Filters & Triggering Royalty Summaries**
- **What to show on screen**: Switch to Admin Dashboard (`admin@bookleaf.com`).
- **What to say**:
  > *"Now switching to the Admin Operations Desk. Here the operations team has a unified view of all 10 authors. We can filter authors by City or Payout Status (Fully Paid, Pending, or Overdue), and search by author name in real time.*
  >
  > *On any author row, we have the 'Generate & Send Royalty Summary' button, plus a 'Bulk Trigger All Pending' button at the top.*
  >
  > *Let's trigger a summary for Priya Sharma. Clicking the button immediately calls our n8n webhook."*

---

#### **2:30 – 3:30 | n8n Workflow Execution & AI Output**
- **What to show on screen**: Switch to the n8n Workflow Canvas. Show the green successful execution dots.
- **What to say**:
  > *"Jumping over to n8n, we see the workflow executed in real time:*
  > 1. *The Webhook received the trigger, validating our secret header `x-bookleaf-secret`.*
  > 2. *Our Code Node performed an idempotency check to prevent duplicate emails if clicked twice.*
  > 3. *The prompt builder injected BookLeaf's 80/20 royalty split, quarterly schedule, and ₹1,000 minimum rollover rules.*
  > 4. *Gemini AI generated a personalized, empathetic summary email.*
  > 5. *Finally, n8n sent a callback back to Bubble to record the event in the Notification Log.*
  >
  > *Notice that for edge cases—like Kavita Deshmukh whose pending royalty is ₹850—the AI properly explains that balances under ₹1,000 roll over to next quarter without alarming the author."*

---

#### **3:30 – 4:00 | Conclusion & Error Resilience**
- **What to show on screen**: Switch back to Bubble Admin Portal, showing the Notification Log table with the new entry marked `SUCCESS`.
- **What to say**:
  > *"Back in Bubble, the Notification Log immediately reflects the new summary with timestamp and preview snippet. If the AI service ever experiences rate limits, the workflow has a fallback circuit breaker that generates deterministic figures so the admin is never stuck with a loading spinner.*
  >
  > *Thank you, and I look forward to the final discussion with the founders!"*
