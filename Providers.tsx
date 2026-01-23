"use client";

import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "@context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ⬇️ 1. Global Contexts FIRST (e.g., Auth, Theme, Redux/Zustand)
    <AuthProvider>
      {/* ⬇️ 2. PrimeReactProvider SECOND */}
      {/* It wraps the app and provides configuration/context for PrimeReact components */}
      <PrimeReactProvider value={{ ripple: true, inputStyle: "filled" }}>
        {children}
      </PrimeReactProvider>
    </AuthProvider>
  );
}
