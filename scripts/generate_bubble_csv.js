const fs = require('fs');
const path = require('path');

const samplePath = path.join(__dirname, '..', 'bookleaf_sample_data.json');
const raw = fs.readFileSync(samplePath, 'utf8');
const data = JSON.parse(raw);

const outDir = path.join(__dirname, '..', 'bubble_seeds');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. Authors CSV
const authorHeaders = [
  'Author_ID',
  'Name',
  'Email',
  'Phone',
  'City',
  'Role',
  'Total_Books',
  'Total_Royalty_Earned',
  'Royalty_Paid',
  'Royalty_Pending',
  'Payout_Status',
  'Last_Payout_Date'
];

const authorRows = data.authors.map(a => {
  let totalEarned = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let latestPayout = '';

  (a.books || []).forEach(b => {
    totalEarned += (b.total_royalty_earned || 0);
    totalPaid += (b.royalty_paid || 0);
    totalPending += (b.royalty_pending || 0);
    if (b.last_royalty_payout_date && (!latestPayout || b.last_royalty_payout_date > latestPayout)) {
      latestPayout = b.last_royalty_payout_date;
    }
  });

  let status = 'FULLY_PAID';
  if (totalPending > 0) {
    if (!latestPayout) {
      status = 'OVERDUE';
    } else {
      const days = (new Date('2026-10-20') - new Date(latestPayout)) / (1000 * 60 * 60 * 24);
      status = days > 90 ? 'OVERDUE' : 'PENDING';
    }
  }

  return [
    a.author_id,
    `"${a.name}"`,
    a.email,
    a.phone || '',
    a.city || '',
    'AUTHOR',
    (a.books || []).length,
    totalEarned,
    totalPaid,
    totalPending,
    status,
    latestPayout || ''
  ].join(',');
});

// Admin user row
authorRows.unshift([
  'ADMIN001',
  '"Aditi Rao (Senior Ops Lead)"',
  'admin@bookleaf.com',
  '+91-98111-22334',
  'Delhi',
  'ADMIN',
  0,
  0,
  0,
  0,
  'FULLY_PAID',
  ''
].join(','));

fs.writeFileSync(path.join(outDir, 'authors.csv'), [authorHeaders.join(','), ...authorRows].join('\n'));

// 2. Books CSV
const bookHeaders = [
  'Book_ID',
  'Author_ID',
  'Author_Name',
  'Title',
  'ISBN',
  'Genre',
  'Status',
  'Publication_Date',
  'MRP',
  'Royalty_Per_Copy',
  'Total_Copies_Sold',
  'Total_Royalty_Earned',
  'Royalty_Paid',
  'Royalty_Pending',
  'Last_Payout_Date',
  'Print_Partner',
  'Platform_Availability'
];

const bookRows = [];
data.authors.forEach(a => {
  (a.books || []).forEach(b => {
    bookRows.push([
      b.book_id,
      a.author_id,
      `"${a.name}"`,
      `"${b.title}"`,
      b.isbn,
      `"${b.genre}"`,
      `"${b.status}"`,
      b.publication_date || '',
      b.mrp || 0,
      b.author_royalty_per_copy || 0,
      b.total_copies_sold || 0,
      b.total_royalty_earned || 0,
      b.royalty_paid || 0,
      b.royalty_pending || 0,
      b.last_royalty_payout_date || '',
      `"${b.print_partner || 'In-House'}"`,
      `"${(b.available_on || []).join(', ')}"`
    ].join(','));
  });
});

fs.writeFileSync(path.join(outDir, 'books.csv'), [bookHeaders.join(','), ...bookRows].join('\n'));

// 3. Notification Logs CSV template
const logHeaders = [
  'Log_ID',
  'Author_ID',
  'Author_Name',
  'Author_Email',
  'Trigger_Type',
  'Status',
  'Timestamp',
  'Summary_Snippet',
  'Error_Message'
];

const sampleLogs = [
  [
    'LOG001',
    'AUTH001',
    '"Priya Sharma"',
    'priya.sharma@email.com',
    'SINGLE',
    'SUCCESS',
    '2026-10-20T08:30:00Z',
    '"Dear Priya, Here is your BookLeaf royalty overview for Q3. Total earned: ₹11,970..."',
    ''
  ].join(',')
];

fs.writeFileSync(path.join(outDir, 'notification_logs.csv'), [logHeaders.join(','), ...sampleLogs].join('\n'));

console.log('Successfully generated Bubble CSVs in bubble_seeds/');
