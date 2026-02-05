"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
// import { useRouter } from "next/navigation"; // Added for logout redirect

// 1. Define the shape of the full user data object
interface UserData {
  userId: string;
  pangalan: string;
  permiso: string; // e.g., 'admin', 'editor', 'viewer'
  officeId: string;
  offcode?: string;
}

// 2. Define the shape of the data you want to share
interface AuthContextType {
  nigamit: UserData | null; // Stores all user data or null
  // isLoggedIn: boolean;
  login: (userData: UserData) => void; // Now accepts the full UserData object
  logout: () => void;
  loading: boolean; // ✅ Add this
}
// 3. Create the Context object
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Create the Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [nigamit, setUser] = useState<UserData | null>(null);
  // const isLoggedIn = nigamit !== null;
  // const router = useRouter(); // Initialize router for logout
  const [loading, setLoading] = useState(false);

  // Function to handle login and set the full user object
  const login = (userData: UserData) => {
    setUser(userData);
    // You would typically handle token storage or session creation here
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);

    // 1. **TRIGGER SERVER ACTION/API ROUTE TO CLEAR COOKIE**
    // You must hit an endpoint that runs `clearAuthCookie()`
    const res = await fetch("/property/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid: nigamit?.userId }),
    });

    if (!res.ok) console.error("Logout failed:", res.status);

    setLoading(false);

    // 2. Redirect
    // router.push("/");
    // router.refresh(); // Force a full server refresh to update the app's state
    window.location.href = "/property";
  };
  return (
    <AuthContext.Provider
      value={{ nigamit, /*isLoggedIn,*/ login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 5. Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
