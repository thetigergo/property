"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation"; // Added for logout redirect
import axios from "axios";

// 1. Define the shape of the full user data object
interface UserData {
  userId: string;
  pangalan: string;
  permiso: string; // e.g., 'admin', 'editor', 'viewer'
  officeId: string;
  offcode?: string;
  token: string; // Store the token here for easy access
}

// 2. Define the shape of the data you want to share
interface AuthContextType {
  nigamit: UserData | null; // Stores all user data or null
  login: (user: string, pass: string) => Promise<boolean>; // Now accepts the full UserData object
  logout: () => void;
}
// 3. Create the Context object
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Create the Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [nigamit, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
});


  // 2. Sync Axios and LocalStorage when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = useCallback(
    async (user: string, pass: string): Promise<boolean> => {
      try {
        const resp = await axios.post("/property/api/users", {
          userid: user,
          passkey: pass,
        });
        if (resp.status === 200) {
          const data: UserData = resp.data;
          setUser(data);
          setToken(data.token); // Store token in state to trigger useEffect
          return true;
        } else {
          const errMsg = resp.data;
          console.error("Login failed:", errMsg.error);
          return false;
        }
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    // 1. **TRIGGER SERVER ACTION/API ROUTE TO CLEAR COOKIE**
    // You must hit an endpoint that runs `clearAuthCookie()`
    try {
      const res = await axios.post("/property/api/logout", {
        userid: nigamit?.userId,
      });
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userid: nigamit?.userId }),
      // });
      if (res.status === 200) {
        router.push("/");
        router.refresh();
        window.location.href = "/property";
      } else {
        const errMsg = res.data;
        console.error("Logout failed:", errMsg.error);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, [nigamit, router]);

  // 4. Memoize the value to avoid re-rendering all consumers
  const contextValue = useMemo(
    () => ({ nigamit, login, logout }),
    [nigamit, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// 5. Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
