import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useParkingLocations, ParkingLocation, ParkingStatus } from "@/hooks/useParkingLocations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Car,
  Shield,
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { locations, loading: locationsLoading, createLocation, updateLocation, deleteLocation, fetchLocations } = useParkingLocations();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ParkingLocation | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    status: "available" as ParkingStatus,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
    }
  }, [user, role, authLoading, navigate, toast]);

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both possible response formats
        const usersArray = data.users || data.data || [];
        setUsers(
          usersArray.map((u: any) => ({
            id: u.id,
            user_id: u.id,
            full_name: u.full_name,
            email: u.email,
            phone_number: u.phone_number || "",
            created_at: u.created_at,
          }))
        );
      } else {
        console.error("Failed to fetch users:", response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
    setUsersLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const locationData = {
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      status: formData.status,
    };

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, locationData);
      } else {
        await createLocation(locationData);
      }

      // Close dialog after successful save - handleDialogOpenChange will reset form
      setDialogOpen(false);
    } catch (err) {
      console.error("Error saving location:", err);
      toast({
        title: "Error",
        description: "Failed to save parking location.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (location: ParkingLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || "",
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      status: location.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this parking location?")) {
      await deleteLocation(id);
    }
  };

  const handleStatusChange = async (id: string, status: ParkingStatus) => {
    await updateLocation(id, { status });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      status: "available",
    });
    setEditingLocation(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    // If user is closing the dialog (open === false), reset the form
    if (!open) {
      resetForm();
    }
    // Always update the dialog state
    setDialogOpen(open);
  };

  if (authLoading || (role !== "admin" && !authLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-foreground text-lg">Admin Panel</h1>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <Tabs defaultValue="parking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="parking" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Parking Locations
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Parking Locations Tab */}
          <TabsContent value="parking" className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">
                Parking Locations ({locations.length})
              </h2>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="w-4 h-4" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLocation ? "Edit Parking Location" : "Add Parking Location"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Valletta Main Parking"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address (optional)</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g., Republic Street, Valletta"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          placeholder="35.8989"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          placeholder="14.5146"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: ParkingStatus) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="parked">Occupied</SelectItem>
                          <SelectItem value="being_parked">Being Parked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="hero" className="flex-1">
                        {editingLocation ? "Save Changes" : "Create Location"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {locationsLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading locations...
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No parking locations yet</p>
                <p className="text-sm">Click "Add Location" to create one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-card rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{location.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={location.status}
                          onValueChange={(value: ParkingStatus) =>
                            handleStatusChange(location.id, value)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue>
                              <StatusBadge status={location.status} size="sm" />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">
                              <StatusBadge status="available" size="sm" />
                            </SelectItem>
                            <SelectItem value="parked">
                              <StatusBadge status="parked" size="sm" />
                            </SelectItem>
                            <SelectItem value="being_parked">
                              <StatusBadge status="being_parked" size="sm" />
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(location)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(location.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="animate-fade-in">
            <h2 className="font-display font-semibold text-lg mb-4">
              Registered Users ({users.length})
            </h2>

            {usersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((userProfile) => (
                  <div
                    key={userProfile.id}
                    className="bg-card rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {userProfile.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {userProfile.email}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground hidden sm:block">
                        <p>{userProfile.phone_number}</p>
                        <p>
                          Joined{" "}
                          {new Date(userProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
