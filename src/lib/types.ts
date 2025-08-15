import type { Timestamp } from 'firebase/firestore';

export interface Invoice {
  id: string;
  userId: string;
  projectName: string;
  client: string;
  amount: number;
  dueDate: Date | Timestamp;
  status: 'paid' | 'pending';
}

export interface InvoiceData extends Omit<Invoice, 'dueDate' | 'id'> {
    dueDate: Timestamp;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
