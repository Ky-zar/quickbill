import Header from '@/components/header';
import { InvoiceTable } from '@/components/invoice-table';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <InvoiceTable />
      </main>
    </div>
  );
}
