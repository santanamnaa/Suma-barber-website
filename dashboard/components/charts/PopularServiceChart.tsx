import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatStats } from "@/dashboard/utils/formatters";
import type { ServiceStat } from "@/dashboard/types/dashboard";

export function PopularServiceChart({ data = [] }: { data: ServiceStat[] }) {
  const COLORS = ["#3b82f6", "#4f46e5", "#8b5cf6", "#a855f7", "#ec4899"];

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400">
        Tidak ada data layanan
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.slice(0, 5)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip
          formatter={(value: number | string, name) => {
            if (name === "bookings") return [`${value} bookings`, "Jumlah Booking"];
            if (name === "revenue") return [formatStats.currency(Number(value)), "Pendapatan"];
            return [value, name];
          }}
        />
        <Legend />
        <Bar dataKey="bookings" name="Jumlah Booking" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}