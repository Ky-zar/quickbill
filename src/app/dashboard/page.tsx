"use client"

import * as React from "react"
import Header from '@/components/header';
import { InvoiceTable } from '@/components/invoice-table';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListChecks, BarChartHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function DashboardPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
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
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
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
