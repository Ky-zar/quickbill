import Header from '@/components/header';
import { InvoiceTable } from '@/components/invoice-table';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListChecks, BarChartHorizontal } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="invoices">
              <ListChecks className="mr-2"/>
              Invoices
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChartHorizontal className="mr-2"/>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="invoices" className="mt-6">
            <InvoiceTable />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsChart />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
