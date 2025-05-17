import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatStats } from "@/dashboard/utils/formatters";
import type { BookingStats } from "@/dashboard/types/dashboard";

export function BookingChart({ data = [] }: { data: BookingStats[] }) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        formattedDate: new Date(item.day).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        count: item.count,
        revenue: item.revenue,
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="formattedDate" tick={{ fontSize: 10 }} tickMargin={5} interval="preserveStartEnd" />
        <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => formatStats.shortCurrency(Number(value))}
        />
        <Tooltip
          formatter={(value: number | string, name) => {
            if (name === "count") return [`${value} bookings`, "Jumlah Booking"];
            if (name === "revenue") return [formatStats.currency(Number(value)), "Pendapatan"];
            return [value, name];
          }}
          labelFormatter={(label) => `Tanggal: ${label}`}
        />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="count"
          name="Jumlah Booking"
          stroke="#3b82f6"
          fill="url(#colorBookings)"
          activeDot={{ r: 6 }}
        />
        {chartData.some((item) => item.revenue) && (
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            name="Pendapatan"
            stroke="#10b981"
            fill="url(#colorRevenue)"
            activeDot={{ r: 6 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}