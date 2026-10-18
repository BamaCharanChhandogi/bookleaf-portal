import { EventEmitter } from 'events';

// Global singleton event emitter for real-time ticket updates across requests
const globalForEvents = globalThis as unknown as {
  ticketEmitter: EventEmitter | undefined;
};

export const ticketEvents = globalForEvents.ticketEmitter ?? new EventEmitter();
ticketEvents.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.ticketEmitter = ticketEvents;
}

export type TicketEventType = 'TICKET_CREATED' | 'TICKET_UPDATED' | 'MESSAGE_SENT' | 'NOTE_ADDED';

export interface TicketUpdatePayload {
  type: TicketEventType;
  ticketId: string;
  authorId: string;
  data: any;
  timestamp: string;
}

export function broadcastTicketUpdate(payload: TicketUpdatePayload) {
  ticketEvents.emit('ticket_update', payload);
}
