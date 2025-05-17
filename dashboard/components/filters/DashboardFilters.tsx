import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import type { FilterState } from "@/dashboard/types/dashboard";

interface DashboardFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  locations: { id: string; name: string }[];
  loading: boolean;
}

const monthOptions = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: currentYear - i,
  label: (currentYear - i).toString(),
}));

export function DashboardFilters({
  filters,
  onChange,
  locations,
  loading,
}: DashboardFiltersProps) {
  const handleMonthChange = (value: string) => {
    onChange({ ...filters, month: parseInt(value, 10) });
  };

  const handleYearChange = (value: string) => {
    onChange({ ...filters, year: parseInt(value, 10) });
  };

  const handleLocationChange = (value: string) => {
    onChange({ ...filters, locationId: value === "all" ? undefined : value });
  };

  const resetFilters = () => {
    onChange({
      year: currentYear,
      month: new Date().getMonth() + 1,
      locationId: undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-sm font-medium">Filter Dashboard</div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select
            value={filters.month.toString()}
            onValueChange={handleMonthChange}
            disabled={loading}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.year.toString()}
            onValueChange={handleYearChange}
            disabled={loading}
          >
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.locationId || "all"}
            onValueChange={handleLocationChange}
            disabled={loading || locations.length === 0}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Pilih Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={loading}
            className="h-9"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}