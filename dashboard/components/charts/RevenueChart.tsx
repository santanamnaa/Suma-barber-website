import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatStats } from "@/dashboard/utils/formatters";
import type { LocationStat } from "@/dashboard/types/dashboard";

export function RevenueChart({ data = [] }: { data: LocationStat[] }) {
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => formatStats.shortCurrency(Number(value))}
        />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
        <Tooltip
          formatter={(value: number | string, name) => [formatStats.currency(Number(value)), "Pendapatan"]}
        />
        <Legend />
        <Bar dataKey="revenue" name="Pendapatan" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}