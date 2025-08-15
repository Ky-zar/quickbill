"use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore"
import { Download, FileText } from "lucide-react"
import { format } from "date-fns"

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
import { useAuth } from "./auth-provider"
import type { Invoice } from "@/lib/types"
import { Button } from "./ui/button"

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function AnalyticsChart() {
  const { user } = useAuth();
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [chartData, setChartData] = useState<any[] | null>(null)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth()).toString());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    };
    const q = query(collection(db, 'invoices'), where('userId', '==', user.uid));
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
    }, (error) => {
        console.error("Error fetching analytics data: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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

  const downloadAnalyticsPdf = () => {
    if (!chartData) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text(`Invoice Analytics Report - ${selectedYear}`, 14, 22);

    const tableData = chartData.map(data => [
      data.month,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(data.total)
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Month', 'Total Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [34, 139, 230] },
    });

    doc.save(`analytics-report-${selectedYear}.pdf`);
  };

  const downloadMonthlyReportPdf = () => {
    const year = parseInt(selectedYear, 10);
    const month = parseInt(selectedMonth, 10);
    
    const monthlyInvoices = allInvoices.filter(invoice => {
        const date = invoice.dueDate instanceof Timestamp ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
        return date.getFullYear() === year && date.getMonth() === month;
    });

    if (monthlyInvoices.length === 0) {
      alert("No invoices for the selected month to export.");
      return;
    }

    const doc = new jsPDF();
    const monthName = MONTHS[month];

    doc.setFontSize(22);
    doc.text(`Monthly Invoice Report - ${monthName} ${selectedYear}`, 14, 22);

    const tableData = monthlyInvoices.map(invoice => [
      invoice.projectName,
      invoice.client,
      format(invoice.dueDate instanceof Timestamp ? invoice.dueDate.toDate() : new Date(invoice.dueDate), 'MMM d, yyyy'),
      invoice.status,
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)
    ]);

    autoTable(doc, {
        startY: 30,
        head: [['Project', 'Client', 'Due Date', 'Status', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [34, 139, 230] },
    });
    
    doc.save(`monthly-report-${selectedYear}-${monthName}.pdf`);
  };
  

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <CardTitle>Invoice Analytics</CardTitle>
            <CardDescription>A breakdown of your invoice amounts for {selectedYear}.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedYear} onValueChange={setSelectedYear} disabled={isLoading || availableYears.length === 0}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                      <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                      {availableYears.length > 0 ? (
                          availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)
                      ) : (
                          <SelectItem value={new Date().getFullYear().toString()} disabled>No data</SelectItem>
                      )}
                  </SelectContent>
              </Select>
              <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isLoading}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                      <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                      {MONTHS.map((month, index) => (
                          <SelectItem key={month} value={index.toString()}>{month}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button onClick={downloadMonthlyReportPdf} variant="outline" className="w-full" disabled={!chartData}>
                  <FileText className="mr-2" />
                  Export Monthly Report
              </Button>
              <Button onClick={downloadAnalyticsPdf} variant="outline" size="icon" disabled={!chartData}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Analytics</span>
              </Button>
            </div>
        </div>
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
