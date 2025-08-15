export interface Invoice {
  id: string;
  projectName: string;
  client: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending';
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
