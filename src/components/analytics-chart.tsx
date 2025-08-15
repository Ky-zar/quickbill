"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "February", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "March", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "April", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "June", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "July", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "August", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "September", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "October", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "November", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "December", total: Math.floor(Math.random() * 5000) + 1000 },
]

export function AnalyticsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Analytics</CardTitle>
        <CardDescription>A breakdown of your invoice amounts by month.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[400px]">
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
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
