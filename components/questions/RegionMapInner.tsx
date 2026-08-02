"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { REGIONS, REGION_BOUNDS, REGION_CENTER } from "@/lib/regions";

interface Props {
  value?: string; // principal
  alternates: string[];
  onPick: (id: string) => void;
}

function nearestRegionId(lat: number, lng: number): string {
  let nearestId = REGIONS[0].id;
  let minSq = Infinity;
  for (const r of REGIONS) {
    const dLat = r.lat - lat;
    const dLng = r.lng - lng;
    const sq = dLat * dLat + dLng * dLng;
    if (sq < minSq) {
      minSq = sq;
      nearestId = r.id;
    }
  }
  return nearestId;
}

function ClickHandler({ onPick }: { onPick: (id: string) => void }) {
  useMapEvents({
    click: (e) => {
      onPick(nearestRegionId(e.latlng.lat, e.latlng.lng));
    },
  });
  return null;
}

function FitBoundsOnMount() {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      map.fitBounds(REGION_BOUNDS, { padding: [15, 15], animate: false });
    };
    fit();
    const t1 = setTimeout(fit, 100);
    const t2 = setTimeout(fit, 500);
    window.addEventListener("resize", fit);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", fit);
    };
  }, [map]);
  return null;
}

function tooltipOffset(dir: "top" | "bottom" | "left" | "right"): [number, number] {
  switch (dir) {
    case "top": return [0, -12];
    case "bottom": return [0, 12];
    case "left": return [-14, 0];
    case "right": return [14, 0];
  }
}

export default function RegionMapInner({ value, alternates, onPick }: Props) {
  return (
    <MapContainer
      center={REGION_CENTER}
      zoom={10}
      minZoom={9}
      maxZoom={13}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%", cursor: "pointer" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap, &copy; CARTO'
        subdomains={["a", "b", "c", "d"]}
      />
      <FitBoundsOnMount />
      <ClickHandler onPick={onPick} />
      {REGIONS.map((r) => {
        const isMain = value === r.id;
        const isAlt = alternates.includes(r.id);
        const selected = isMain || isAlt;
        return (
          <CircleMarker
            key={r.id}
            center={[r.lat, r.lng]}
            radius={isMain ? 16 : isAlt ? 13 : 10}
            pathOptions={{
              color: isMain ? "#dc142e" : isAlt ? "#c9a96e" : "#dc142e",
              weight: selected ? 4 : 2.5,
              opacity: 1,
              fillColor: isMain ? "#dc142e" : isAlt ? "#c9a96e" : "#ffffff",
              fillOpacity: selected ? 0.95 : 0.9,
            }}
            eventHandlers={{
              click: () => onPick(r.id),
            }}
          >
            <Tooltip
              permanent
              direction={r.labelDir}
              offset={tooltipOffset(r.labelDir)}
              className="region-label"
            >
              {r.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
