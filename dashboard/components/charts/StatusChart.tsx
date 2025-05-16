import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { StatusStat } from "@/dashboard/types/dashboard";

export function StatusChart({ data = [] }: { data: StatusStat[] }) {
  const STATUS_COLORS: Record<string, string> = {
    completed: "#10b981",
    scheduled: "#3b82f6",
    cancelled: "#ef4444",
    pending: "#f59e0b",
  };
  const DEFAULT_COLORS = ["#8b5cf6", "#ec4899", "#6366f1", "#0ea5e9"];

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400">
        Tidak ada data status
      </div>
    );
  }

  const formatPercent = (value: number) => `${Math.round(value)}%`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={70}
          innerRadius={30}
          paddingAngle={2}
          dataKey="count"
          nameKey="status"
          label={({ status, percent }) => `${status}: ${formatPercent(percent * 100)}`}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => [
            `${value} bookings (${formatPercent(props?.payload?.percentage ?? 0)}%)`,
            name,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}