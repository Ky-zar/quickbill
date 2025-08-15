"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "./ui/skeleton"

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function AnalyticsChart() {
  const [chartData, setChartData] = useState<any[] | null>(null)

  useEffect(() => {
    // Simulate fetching data
    const data = [
      { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "May", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
    ]
    setChartData(data)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Analytics</CardTitle>
        <CardDescription>A breakdown of your invoice amounts by month.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
      {chartData ? (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
      ) : (
        <div className="h-[400px] w-full flex items-center justify-center">
            <Skeleton className="h-[400px] w-full" />
        </div>
      )}
      </CardContent>
    </Card>
  )
}
