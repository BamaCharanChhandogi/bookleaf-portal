import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'BookLeaf Author Support & Communication Portal API',
      version: '1.0.0',
      description: 'REST API for BookLeaf Publishing Author Portal and Operations Command Center with AI-assisted response generation.',
      contact: {
        name: 'Technical Operations Team',
        email: 'support@bookleaf.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
    paths: {
      '/api/auth': {
        post: {
          summary: 'User Authentication / Login',
          description: 'Authenticate author or admin using email and password.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'priya.sharma@email.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                  required: ['email'],
                },
              },
            },
          },
          responses: {
            200: { description: 'Authenticated successfully' },
            401: { description: 'Invalid credentials' },
          },
        },
        get: {
          summary: 'List Seeded Reviewer Personas',
          description: 'Returns all 10 seeded authors and admin account for 1-click persona switching.',
          responses: { 200: { description: 'List of accounts' } },
        },
      },
      '/api/books': {
        get: {
          summary: 'Fetch Books Catalog',
          parameters: [
            { name: 'authorId', in: 'query', schema: { type: 'string' }, description: 'Filter books by author ID' },
          ],
          responses: { 200: { description: 'List of books with royalty and distribution figures' } },
        },
      },
      '/api/tickets': {
        get: {
          summary: 'List Support Tickets',
          parameters: [
            { name: 'authorId', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] } },
          ],
          responses: { 200: { description: 'List of filtered tickets' } },
        },
        post: {
          summary: 'Submit Support Query',
          description: 'Raises a ticket with automatic Gemini AI classification, priority scoring, and knowledge base response drafting.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    authorId: { type: 'string', example: 'AUTH001' },
                    bookId: { type: 'string', example: 'BK001' },
                    subject: { type: 'string', example: 'Royalty payout schedule' },
                    description: { type: 'string', example: 'When is my Q4 payout credited?' },
                  },
                  required: ['authorId', 'subject', 'description'],
                },
              },
            },
          },
          responses: { 201: { description: 'Ticket created with AI metadata' } },
        },
      },
      '/api/tickets/{id}': {
        get: {
          summary: 'Get Ticket Details',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Ticket with messages, internal notes, and linked book dossier' } },
        },
        patch: {
          summary: 'Update Ticket (Status, Priority, Override Category, Assign)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Ticket updated successfully' } },
        },
      },
      '/api/tickets/{id}/messages': {
        post: {
          summary: 'Send Message on Ticket Thread',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 201: { description: 'Message broadcasted via SSE' } },
        },
      },
      '/api/tickets/{id}/notes': {
        post: {
          summary: 'Add Internal Ops Note (Private to Admins)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 201: { description: 'Internal note saved' } },
        },
      },
      '/api/tickets/stream': {
        get: {
          summary: 'Server-Sent Events Real-Time Ticket Stream',
          description: 'Live stream pushing updates when tickets are created, updated, or replied to.',
          responses: { 200: { description: 'SSE text/event-stream' } },
        },
      },
      '/api/ai/draft-response': {
        post: {
          summary: 'Regenerate Grounded AI Draft',
          description: 'Calls Gemini with author dossier context and BookLeaf KB slice.',
          responses: { 200: { description: 'AI drafted response with policy citation' } },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
