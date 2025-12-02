import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Calendar, LogOut, Shield } from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, role, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    // Use user data from auth context instead of fetching from database
    setProfile({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number || "",
      created_at: new Date().toISOString(),
    });
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
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
        <h1 className="font-display font-bold text-foreground text-lg">Profile</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden animate-slide-up">
          {/* Header Section */}
          <div className="gradient-primary p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center mx-auto mb-3">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-xl text-primary-foreground">
              {profile?.full_name || "User"}
            </h2>
            {role === "admin" && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-primary-foreground/20 rounded-full">
                <Shield className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm text-primary-foreground font-medium">Administrator</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{profile?.email || user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">
                  {profile?.phone_number || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {role === "admin" && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate("/admin")}
            >
              <Shield className="w-5 h-5" />
              Admin Panel
            </Button>
          )}
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>
        </div>
      </main>
    </div>
  );
}
