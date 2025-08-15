"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "./ui/skeleton"
import { db } from "@/lib/firebase"
import type { Invoice } from "@/lib/types"

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function AnalyticsChart() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [chartData, setChartData] = useState<any[] | null>(null)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'invoices'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Invoice));
      setAllInvoices(invoicesData);
      
      const years = new Set(invoicesData.map(invoice => {
        const date = invoice.dueDate instanceof Timestamp ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
        return date.getFullYear().toString();
      }));
      const sortedYears = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(sortedYears);

      if (!years.has(selectedYear) && sortedYears.length > 0) {
        setSelectedYear(sortedYears[0]);
      } else if (sortedYears.length === 0) {
        setSelectedYear(new Date().getFullYear().toString());
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (allInvoices.length > 0) {
      const yearlyData = Array(12).fill(0).map((_, index) => ({
        month: MONTHS[index],
        total: 0,
      }));

      allInvoices.forEach(invoice => {
        const date = invoice.dueDate instanceof Timestamp ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
        if (date.getFullYear().toString() === selectedYear) {
          const month = date.getMonth();
          yearlyData[month].total += invoice.amount;
        }
      });
      
      setChartData(yearlyData);
    } else {
        const emptyData = Array(12).fill(0).map((_, index) => ({
            month: MONTHS[index],
            total: 0,
        }));
        setChartData(emptyData);
    }
  }, [selectedYear, allInvoices]);
  

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Invoice Analytics</CardTitle>
            <CardDescription>A breakdown of your invoice amounts for {selectedYear}.</CardDescription>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent>
                {availableYears.length > 0 ? (
                    availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)
                ) : (
                    <SelectItem value={new Date().getFullYear().toString()} disabled>No data</SelectItem>
                )}
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pl-2">
      {isLoading || !chartData ? (
        <div className="h-[400px] w-full flex items-center justify-center">
            <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent
                  formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)}
                />}
              />
              <Legend />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
      </CardContent>
    </Card>
  )
}
