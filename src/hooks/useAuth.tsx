import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type AppRole = "admin" | "user";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: AppRole;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  role: AppRole | null;
  signUp: (email: string, password: string, metadata: { full_name: string; phone_number: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'https://sukrawebwizard-ux-parkingbackoffice.vercel.app/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Check if token exists and validate it
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      validateToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRole(data.user.role);
        setToken(token);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setRole(null);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { full_name: string; phone_number: string }
  ) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: metadata.full_name,
          phone_number: metadata.phone_number,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Sign up failed') };
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Login failed') };
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Login failed') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
