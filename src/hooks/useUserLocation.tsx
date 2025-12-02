import { useState, useEffect } from "react";

interface UserLocation {
  latitude: number;
  longitude: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setPermissionStatus("granted");
        setLoading(false);
      },
      (err) => {
        console.error("Error getting location:", err);
        setError(err.message);
        setPermissionStatus("denied");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    // Check permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state);
        if (result.state === "granted") {
          requestLocation();
        } else {
          setLoading(false);
        }

        result.onchange = () => {
          setPermissionStatus(result.state);
          if (result.state === "granted") {
            requestLocation();
          }
        };
      });
    } else {
      setLoading(false);
    }
  }, []);

  return {
    location,
    error,
    permissionStatus,
    loading,
    requestLocation,
  };
}
