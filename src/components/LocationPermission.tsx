import { Button } from "@/components/ui/button";
import { MapPin, Settings } from "lucide-react";

interface LocationPermissionProps {
  onRequestPermission: () => void;
  error?: string | null;
}

export default function LocationPermission({
  onRequestPermission,
  error,
}: LocationPermissionProps) {
  const openSettings = () => {
    // This will prompt users to check their browser settings
    window.alert(
      "Please enable location access in your browser settings:\n\n" +
        "1. Click the lock/info icon in the address bar\n" +
        "2. Find 'Location' in the permissions list\n" +
        "3. Change it to 'Allow'\n" +
        "4. Refresh this page"
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm text-center animate-fade-in">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
          <MapPin className="w-12 h-12 text-primary-foreground" />
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-2xl text-foreground mb-3">
          Enable Location Access
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Malta Parking Finder needs your location to show nearby available
          parking spots and help you navigate to them.
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="hero" size="xl" className="w-full" onClick={onRequestPermission}>
            <MapPin className="w-5 h-5" />
            Allow Location Access
          </Button>

          {error && (
            <Button variant="outline" size="lg" className="w-full" onClick={openSettings}>
              <Settings className="w-5 h-5" />
              Open Settings
            </Button>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground mt-6">
          Your location is only used to find nearby parking. We never store or
          share your location data.
        </p>
      </div>
    </div>
  );
}
