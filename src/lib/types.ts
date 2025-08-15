import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  workspaces: string[];
}

export interface Workspace {
    id: string;
    name: string;
    members: string[]; // array of user uids
}

export interface Invoice {
  id: string;
  workspaceId: string;
  projectName: string;
  client: string;
  amount: number;
  dueDate: Date | Timestamp;
  status: 'paid' | 'pending';
}

export interface InvoiceData extends Omit<Invoice, 'dueDate' | 'id' | 'workspaceId'> {
    workspaceId: string;
    dueDate: Timestamp;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
