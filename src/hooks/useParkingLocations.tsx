import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'https://sukrawebwizard-ux-parkingbackoffice.vercel.app/api';

export type ParkingStatus = "available" | "parked" | "being_parked";

export interface ParkingLocation {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  status: ParkingStatus;
  capacity?: number;
  occupied_spaces?: number;
  created_at: string;
  updated_at: string;
}

export function useParkingLocations() {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/parking`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle both 200 OK and 304 Not Modified
      if (response.status === 200 || response.status === 304) {
        // Only parse JSON if there's a body (200 has body, 304 might not)
        if (response.status === 200) {
          const data = await response.json();
          const locationsArray = data.locations || data.data || [];
          setLocations(locationsArray);
          console.log('✅ Loaded parking locations:', locationsArray.length);
        } else {
          console.log('📦 Parking locations cached (304 Not Modified)');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        toast({
          title: "Error",
          description: `Failed to load parking locations (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load parking locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (location: Omit<ParkingLocation, "id" | "created_at" | "updated_at">) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/parking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to create parking location",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Parking location created successfully",
      });
      await fetchLocations();
      return data.location;
    } catch (error) {
      console.error("Error creating parking location:", error);
      toast({
        title: "Error",
        description: "Failed to create parking location",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLocation = async (id: string, updates: Partial<ParkingLocation>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/parking/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to update parking location",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Parking location updated successfully",
      });
      await fetchLocations();
      return data.location;
    } catch (error) {
      console.error("Error updating parking location:", error);
      toast({
        title: "Error",
        description: "Failed to update parking location",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/parking/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to delete parking location",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Parking location deleted successfully",
      });
      await fetchLocations();
      return true;
    } catch (error) {
      console.error("Error deleting parking location:", error);
      toast({
        title: "Error",
        description: "Failed to delete parking location",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}
