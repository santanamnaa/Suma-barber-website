import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeStat } from "@/dashboard/types/dashboard";

export function TimeDistributionChart({ data = [] }: { data: TimeStat[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400">
        Tidak ada data distribusi waktu
      </div>
    );
  }

  const formatHour = (hour: number) => `${hour}:00`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={formatHour} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip
          formatter={(value) => [`${value} bookings`, "Jumlah"]}
          labelFormatter={(hour) => `Jam ${formatHour(hour as number)}`}
        />
        <Bar dataKey="count" name="Jumlah Booking" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}