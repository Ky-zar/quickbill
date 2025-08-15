
"use client"

import * as React from "react"
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore"
import { format, isSameDay } from "date-fns"

import Header from '@/components/header';
import { InvoiceTable } from '@/components/invoice-table';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListChecks, BarChartHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import type { Invoice } from "@/lib/types";

export default function DashboardPage() {
  const { activeWorkspace } = useAuth();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  React.useEffect(() => {
    if (!activeWorkspace) return;
    const q = query(collection(db, 'invoices'), where('workspaceId', '==', activeWorkspace.id));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Invoice));
      setInvoices(invoicesData);
    });
    return () => unsubscribe();
  }, [activeWorkspace]);
  
  const getDueDate = (dueDate: Invoice['dueDate']): Date => {
    return dueDate instanceof Timestamp ? dueDate.toDate() : new Date(dueDate);
  }

  const dueInvoices = React.useMemo(() => {
    if (!selectedDate) return [];
    return invoices.filter(invoice => isSameDay(getDueDate(invoice.dueDate), selectedDate));
  }, [invoices, selectedDate]);
  
  const dueDays = React.useMemo(() => {
    return invoices.map(invoice => getDueDate(invoice.dueDate));
  }, [invoices]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <InvoiceTable />
            </div>
            <div>
                <Card>
                  <CardHeader>
                      <CardTitle>Calendar</CardTitle>
                      <CardDescription>Select a day to see due invoices.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        modifiers={{ due: dueDays }}
                        modifiersClassNames={{
                            due: 'bg-primary/20 rounded-full',
                        }}
                      />
                      <div className="mt-4 w-full">
                        <h3 className="text-lg font-semibold mb-2">
                          {selectedDate ? `Due on ${format(selectedDate, 'PPP')}` : 'No date selected'}
                        </h3>
                        {dueInvoices.length > 0 ? (
                          <ul className="space-y-2">
                            {dueInvoices.map(invoice => (
                              <li key={invoice.id} className="p-3 rounded-md border bg-card text-sm">
                                <p className="font-medium">{invoice.projectName}</p>
                                <p className="text-muted-foreground">{invoice.client}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No invoices due on this day.
                          </p>
                        )}
                      </div>
                  </CardContent>
                </Card>
            </div>
            </div>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
            <AnalyticsChart />
        </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
