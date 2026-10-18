import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Locate sample data JSON
  const localSeedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  const fallbackSeedPath = 'c:\\Users\\bcchh\\Downloads\\FULLSTACK-SAMPLEDATA (1) (1).json';
  const sampleDataPath = fs.existsSync(localSeedPath) ? localSeedPath : fallbackSeedPath;

  if (!fs.existsSync(sampleDataPath)) {
    throw new Error(`Sample data file not found at ${sampleDataPath}`);
  }

  const rawData = fs.readFileSync(sampleDataPath, 'utf-8');
  const parsedData = JSON.parse(rawData);

  // Clear existing records to ensure idempotent fresh seeding
  await prisma.internalNote.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();

  // Create an Admin user for operations portal
  await prisma.author.create({
    data: {
      id: 'ADMIN001',
      name: 'Aditi Rao (Senior Ops Lead)',
      email: 'admin@bookleaf.com',
      phone: '+91-99999-00000',
      city: 'Delhi',
      role: 'ADMIN',
      password: 'adminpassword123',
    },
  });

  console.log('✅ Admin user created: admin@bookleaf.com');

  // Ingest authors and books
  for (const author of parsedData.authors) {
    console.log(`Ingesting author: ${author.name} (${author.author_id})...`);
    
    await prisma.author.create({
      data: {
        id: author.author_id,
        name: author.name,
        email: author.email,
        phone: author.phone || null,
        city: author.city || null,
        joinedDate: new Date(author.joined_date),
        role: 'AUTHOR',
        password: 'password123',
        books: {
          create: author.books.map((book: any) => ({
            id: book.book_id,
            title: book.title,
            isbn: book.isbn,
            genre: book.genre,
            publicationDate: book.publication_date ? new Date(book.publication_date) : null,
            status: book.status,
            mrp: book.mrp !== null && book.mrp !== undefined ? parseFloat(book.mrp) : null,
            authorRoyaltyPerCopy: book.author_royalty_per_copy !== null && book.author_royalty_per_copy !== undefined ? parseFloat(book.author_royalty_per_copy) : null,
            totalCopiesSold: parseInt(book.total_copies_sold || 0, 10),
            totalRoyaltyEarned: parseFloat(book.total_royalty_earned || 0),
            royaltyPaid: parseFloat(book.royalty_paid || 0),
            royaltyPending: parseFloat(book.royalty_pending || 0),
            lastRoyaltyPayoutDate: book.last_royalty_payout_date ? new Date(book.last_royalty_payout_date) : null,
            printPartner: book.print_partner || 'In-House',
            availableOn: JSON.stringify(book.available_on || []),
          })),
        },
      },
    });
  }

  // Create realistic pre-seeded tickets with AI classification & draft replies
  // 1. Royalty issue for Priya Sharma
  const priya = await prisma.author.findUnique({ where: { id: 'AUTH001' } });
  if (priya) {
    const t1 = await prisma.ticket.create({
      data: {
        authorId: priya.id,
        bookId: 'BK001',
        subject: 'Pending royalty payout query for Q3/Q4',
        description: 'Hello, I published "Whispers of the Ganges" in 2023. My dashboard shows a pending royalty of ₹3,570. Could you let me know when this will be credited to my account?',
        status: 'OPEN',
        priority: 'HIGH',
        category: 'Royalty & Payments',
        aiSuggestedCategory: 'Royalty & Payments',
        aiSuggestedPriority: 'HIGH',
        aiPriorityReason: 'Financial inquiry regarding pending royalty balance above ₹1,000 threshold',
        aiGroundingPolicy: 'Royalty Policy: Calculated quarterly, paid within 45 days. Minimum payout ₹1,000.',
        aiDraftResponse: `Dear Priya,

Thank you for reaching out to BookLeaf Publishing. We understand how important timely royalty payouts are for your creative journey!

Regarding your book "Whispers of the Ganges" (BK001), your pending royalty balance currently stands at ₹3,570, which is well above our minimum payout threshold of ₹1,000. 

As per BookLeaf's Royalty Policy, royalties are calculated quarterly and disbursed within 45 days of the quarter ending via direct bank transfer. Your account is queued for the upcoming cycle disbursement. Our finance team will verify the bank account linkage on your author dashboard and ensure the transfer is processed.

If you have updated your banking details recently, please feel free to confirm the last 4 digits of your account here. We are monitoring this ticket and will update you within 48 hours with the transaction reference.

Warm regards,  
BookLeaf Support Team`,
        messages: {
          create: [
            {
              senderRole: 'AUTHOR',
              senderName: priya.name,
              message: 'Hello, I published "Whispers of the Ganges" in 2023. My dashboard shows a pending royalty of ₹3,570. Could you let me know when this will be credited to my account?',
            },
          ],
        },
        internalNotes: {
          create: [
            {
              adminName: 'Aditi Rao',
              note: 'Priya Sharma is one of our active authors. Bank details verified on dashboard. Finance batch scheduled for Monday.',
            },
          ],
        },
      },
    });

    // 2. Printing quality issue for Rohit Kapoor
    const rohit = await prisma.author.findUnique({ where: { id: 'AUTH002' } });
    if (rohit) {
      await prisma.ticket.create({
        data: {
          authorId: rohit.id,
          bookId: 'BK004',
          subject: 'Author copies received with binding defect',
          description: 'I received the batch of 10 author copies for "Startup Sutra". 3 copies have loose spine binding and slight page misalignment on chapter 2.',
          status: 'IN_PROGRESS',
          priority: 'CRITICAL',
          category: 'Printing & Quality',
          aiSuggestedCategory: 'Printing & Quality',
          aiSuggestedPriority: 'CRITICAL',
          aiPriorityReason: 'Physical print defect reported on author copies requiring free replacement reprint',
          aiGroundingPolicy: 'Printing & Quality Policy: Free reprint arranged for binding defects within 5-7 business days upon photo verification.',
          aiDraftResponse: `Dear Rohit,

We sincerely apologize for the quality issue with your author copies of "Startup Sutra". We take immense pride in the craftsmanship of every book we produce, and we regret that this batch fell short of our standard.

Under BookLeaf's Printing & Quality Policy, we will immediately arrange a complimentary reprint for the 3 defective copies at zero cost to you. 

Could you please attach 1-2 photos of the spine binding defect and the misaligned pages? Once received, our Delhi print facility will prioritize your reprint, with an estimated dispatch within 5–7 business days.

Warm regards,  
BookLeaf Production Team`,
          assignedTo: 'Aditi Rao',
          messages: {
            create: [
              {
                senderRole: 'AUTHOR',
                senderName: rohit.name,
                message: 'I received the batch of 10 author copies for "Startup Sutra". 3 copies have loose spine binding and slight page misalignment on chapter 2.',
              },
              {
                senderRole: 'ADMIN',
                senderName: 'Aditi Rao',
                message: 'Hi Rohit, so sorry to hear this! I have flagged this with our Delhi print facility. Please upload photos here and we will arrange the free reprint immediately.',
              },
            ],
          },
        },
      });
    }
  }

  console.log('✅ Seeding completed successfully! 10 authors, 18 books, and initial tickets created.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
