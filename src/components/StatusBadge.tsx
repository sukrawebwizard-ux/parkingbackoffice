import { cn } from "@/lib/utils";
import { ParkingStatus } from "@/hooks/useParkingLocations";

interface StatusBadgeProps {
  status: ParkingStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  available: {
    label: "Available",
    bgColor: "bg-status-available",
    textColor: "text-white",
  },
  parked: {
    label: "Occupied",
    bgColor: "bg-status-parked",
    textColor: "text-white",
  },
  being_parked: {
    label: "Being Parked",
    bgColor: "bg-status-being-parked",
    textColor: "text-white",
  },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bgColor,
        config.textColor,
        sizeConfig[size]
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
}
