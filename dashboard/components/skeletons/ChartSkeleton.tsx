import React from "react";

export function ChartSkeleton() {
  return (
    <div className="h-full w-full flex flex-col animate-pulse">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-md" />
      <div className="h-8 mt-2 bg-gray-100 dark:bg-gray-800 rounded-md" />
    </div>
  );
}