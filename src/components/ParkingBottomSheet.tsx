import { ParkingLocation } from "@/hooks/useParkingLocations";
import { Button } from "@/components/ui/button";
import { X, Navigation, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParkingBottomSheetProps {
  location: ParkingLocation | null;
  onClose: () => void;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "available":
      return {
        label: "Available",
        color: "bg-status-available",
        textColor: "text-status-available",
      };
    case "parked":
      return {
        label: "Occupied",
        color: "bg-status-parked",
        textColor: "text-status-parked",
      };
    case "being_parked":
      return {
        label: "Being Parked",
        color: "bg-status-being-parked",
        textColor: "text-status-being-parked",
      };
    default:
      return {
        label: "Unknown",
        color: "bg-muted",
        textColor: "text-muted-foreground",
      };
  }
};

export default function ParkingBottomSheet({ location, onClose }: ParkingBottomSheetProps) {
  if (!location) return null;

  const statusInfo = getStatusInfo(location.status);

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-card rounded-t-3xl shadow-xl border-t border-border p-6 pb-8 max-w-lg mx-auto">
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl text-foreground mb-1">
              {location.name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>{location.address || "Malta"}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={cn(
              "px-4 py-2 rounded-full flex items-center gap-2",
              statusInfo.color
            )}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse-soft" />
            <span className="text-white font-medium text-sm">{statusInfo.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>Updated {new Date(location.updated_at).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            onClick={handleNavigate}
            disabled={location.status === "parked"}
          >
            <Navigation className="w-5 h-5" />
            Navigate
          </Button>
          <Button variant="outline" size="lg" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
