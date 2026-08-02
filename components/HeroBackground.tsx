"use client";

import dynamic from "next/dynamic";
import { REGION_CENTER } from "@/lib/regions";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="map-mono map-no-interaction absolute inset-0">
        <MapContainer
          center={REGION_CENTER}
          zoom={11}
          zoomControl={false}
          attributionControl={true}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap, &copy; CARTO'
            subdomains={["a", "b", "c", "d"]}
          />
        </MapContainer>
      </div>

      {/* Voile radial blanc pour la lisibilité (thème clair) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0.97) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 15%, rgba(220,20,46,0.05) 0%, rgba(220,20,46,0) 55%)",
        }}
      />
    </div>
  );
}
