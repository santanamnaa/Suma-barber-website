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
  services: { id: string; name: string }[];
  loading: boolean;
}

export function DashboardFilters({
  filters,
  onChange,
  locations,
  services,
  loading,
}: DashboardFiltersProps) {
  const rangeOptions = [
    { value: 7, label: "7 hari terakhir" },
    { value: 14, label: "14 hari terakhir" },
    { value: 30, label: "30 hari terakhir" },
    { value: 60, label: "60 hari terakhir" },
    { value: 90, label: "90 hari terakhir" },
  ];

  const handleRangeChange = (value: string) => {
    onChange({ ...filters, range: parseInt(value) });
  };

  const handleLocationChange = (value: string) => {
    onChange({ ...filters, locationId: value === "all" ? undefined : value });
  };

  const handleServiceChange = (value: string) => {
    onChange({ ...filters, serviceId: value === "all" ? undefined : value });
  };

  const resetFilters = () => {
    onChange({ range: 30, locationId: undefined, serviceId: undefined });
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-sm font-medium">Filter Dashboard</div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select
            value={filters.range.toString()}
            onValueChange={handleRangeChange}
            disabled={loading}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              {rangeOptions.map((option) => (
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
          <Select
            value={filters.serviceId || "all"}
            onValueChange={handleServiceChange}
            disabled={loading || services.length === 0}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Pilih Layanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Layanan</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
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