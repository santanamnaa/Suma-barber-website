import React from "react";
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";
// @ts-ignore
import L from "leaflet";
import { formatStats } from "@/dashboard/utils/formatters";
import type { LocationStat } from "@/dashboard/types/dashboard";

// Fix for Leaflet marker icons
// @ts-ignore
if (typeof window !== "undefined" && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
    iconUrl: "/images/leaflet/marker-icon.png",
    shadowUrl: "/images/leaflet/marker-shadow.png",
  });
}

export function LocationMap({ locations = [] }: { locations: LocationStat[] }) {
  const defaultCenter: [number, number] = [-6.9175, 107.6191];

  const center: [number, number] =
    locations.length > 0 && locations[0].latitude && locations[0].longitude
      ? [locations[0].latitude, locations[0].longitude]
      : defaultCenter;

  if (!locations.length || !locations.some((loc) => loc.latitude && loc.longitude)) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="text-gray-500 text-center p-4">
          <p>Peta tidak tersedia</p>
          <p className="text-xs mt-1">Data lokasi belum lengkap</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "0.375rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location, index) => {
        if (!location.latitude || !location.longitude) return null;
        const circleRadius = location.revenue
          ? Math.sqrt(location.revenue) / 10
          : (location.bookings || 1) * 20;
        return (
          <React.Fragment key={location.location_id || index}>
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{location.name}</h3>
                  <p className="text-xs text-gray-600">{location.address}</p>
                  <div className="mt-2 text-sm">
                    <p>Bookings: <b>{location.bookings || 0}</b></p>
                    <p>Revenue: <b>{formatStats.currency(location.revenue || 0)}</b></p>
                  </div>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[location.latitude, location.longitude]}
              radius={circleRadius || 100}
              pathOptions={{
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                color: "#3b82f6",
                weight: 1,
              }}
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}