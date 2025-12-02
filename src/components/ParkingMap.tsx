import { useEffect, useRef } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { renderToStaticMarkup } from "react-dom/server";
import { ParkingLocation } from "@/hooks/useParkingLocations";

// Malta center coordinates
const MALTA_CENTER: [number, number] = [14.514, 35.899];

interface ParkingMapProps {
  locations: ParkingLocation[];
  userLocation?: { latitude: number; longitude: number } | null;
  onLocationSelect?: (location: ParkingLocation) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "available":
      return "#22c55e"; // green
    case "parked":
    case "occupied":
      return "#ef4444"; // red
    case "being_parked":
    case "being_booked":
      return "#eab308"; // yellow
    default:
      return "#6b7280"; // gray
  }
};

const ParkingMap: React.FC<ParkingMapProps> = ({
  locations,
  userLocation,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const geolocateControlRef = useRef<maplibregl.GeolocateControl | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Initialize map once on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const style = {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      } as any;

      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style,
        center: userLocation
          ? [userLocation.longitude, userLocation.latitude]
          : MALTA_CENTER,
        zoom: 14,
        maxZoom: 19,
      });

      mapRef.current.addControl(
        new maplibregl.NavigationControl({ visualizePitch: true }),
        "top-right"
      );

      geolocateControlRef.current = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showAccuracyCircle: false,
      });

      mapRef.current.on("geolocate", async (event: any) => {
        const coords = event.coords;
        if (!coords) return;

        const lat = coords.latitude;
        const lng = coords.longitude;

        mapRef.current?.setCenter([lng, lat]);
        mapRef.current?.setZoom(19);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address =
            data.address?.road || data.address?.street || "Current Location";

          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ offset: 25 })
            .setLngLat([lng, lat])
            .setHTML(
              `<div style="font-size: 14px; font-weight: 500;">${address}</div>`
            )
            .addTo(mapRef.current!);
        } catch (error) {
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ offset: 25 })
            .setLngLat([lng, lat])
            .setHTML(
              `<div style="font-size: 14px; font-weight: 500;">Your Location</div>`
            )
            .addTo(mapRef.current!);
        }
      });

      mapRef.current.addControl(geolocateControlRef.current, "top-right");
    } catch (error) {
      // Silently fail on map initialization
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      popupRef.current?.remove();
    };
  }, []);

  // Update parking markers
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    locations.forEach((location) => {
      const el = document.createElement("div");
      el.className = "parking-marker";
      el.style.cssText = `
        width: 44px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: filter 0.2s ease;
        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
      `;

      const statusColor = getStatusColor(location.status);
      const iconMarkup = renderToStaticMarkup(
        <svg width="32" height="42" viewBox="0 0 24 24" fill={statusColor} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 7.25 10 13 10 13s10-5.75 10-13c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
        </svg>
      );

      el.innerHTML = iconMarkup;

      el.addEventListener("mouseenter", () => {
        el.style.filter = "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45))";
      });
      el.addEventListener("mouseleave", () => {
        el.style.filter = "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35))";
      });
      el.addEventListener("click", () => {
        onLocationSelect?.(location);
      });

      try {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([location.longitude, location.latitude])
          .addTo(mapRef.current!);
        markersRef.current.push(marker);
      } catch (error) {
        // Silently fail on marker creation
      }
    });
  }, [locations, onLocationSelect]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([
        userLocation.longitude,
        userLocation.latitude,
      ]);
      return;
    }

    const el = document.createElement("div");
    el.style.cssText = `
      width: 28px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 6px 18px rgba(14, 165, 233, 0.45));
    `;

    const iconMarkup = renderToStaticMarkup(
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#0ea5e9" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 7.25 10 13 10 13s10-5.75 10-13c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
      </svg>
    );

    el.innerHTML = iconMarkup;

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(mapRef.current);
  }, [userLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-lg overflow-hidden"
    />
  );
};

export default ParkingMap;

