import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useParkingLocations, ParkingLocation } from "@/hooks/useParkingLocations";
import { useUserLocation } from "@/hooks/useUserLocation";
import ParkingMap from "@/components/ParkingMap";
import ParkingBottomSheet from "@/components/ParkingBottomSheet";
import LocationPermission from "@/components/LocationPermission";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, User, MapPin, List, Map, LogOut, Shield, Search, Moon, Sun } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { user, role, signOut, loading: authLoading } = useAuth();
  const { locations, loading: locationsLoading } = useParkingLocations();
  const { location: userLocation, permissionStatus, requestLocation, error: locationError } = useUserLocation();
  const { theme, setTheme } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const sortedLocations = [...locations]
    .filter((location) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        location.name.toLowerCase().includes(query) ||
        location.address?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (!userLocation) return 0;
      const distA = Math.sqrt(
        Math.pow(a.latitude - userLocation.latitude, 2) +
        Math.pow(a.longitude - userLocation.longitude, 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.latitude - userLocation.latitude, 2) +
        Math.pow(b.longitude - userLocation.longitude, 2)
      );
      return distA - distB;
    });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show location permission screen if not granted
  if (permissionStatus !== "granted" && permissionStatus !== null) {
    return <LocationPermission onRequestPermission={requestLocation} error={locationError} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground text-lg leading-tight">
              Malta Parking
            </h1>
            <p className="text-xs text-muted-foreground">
              {locations.filter((l) => l.status === "available").length} spots available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
              <Shield className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate("/profile")}>
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* View Toggle */}
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="flex bg-secondary rounded-lg p-1 max-w-xs">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              viewMode === "map"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setViewMode("map")}
          >
            <Map className="w-4 h-4" />
            Map
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              viewMode === "list"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative">
        {viewMode === "map" ? (
          <div className="absolute inset-0">
            <ParkingMap
              locations={locations}
              userLocation={userLocation}
              onLocationSelect={setSelectedLocation}
            />
          </div>
        ) : (
          <div className="p-4 space-y-3 pb-24">
            {viewMode === "list" && (
              <div className="sticky top-0 bg-card z-10 -mx-4 px-4 py-3 border-b border-border mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by street or parking name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            {locationsLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading parking locations...
              </div>
            ) : sortedLocations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No parking locations match your search" : "No parking locations available"}
              </div>
            ) : (
              sortedLocations.map((location) => (
                <div
                  key={location.id}
                  className="bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {location.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{location.address || "Malta"}</span>
                      </div>
                    </div>
                    <StatusBadge status={location.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Bottom Sheet */}
      <ParkingBottomSheet location={selectedLocation} onClose={() => setSelectedLocation(null)} />
    </div>
  );
}
