"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CsrfContext = createContext<string>("");

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      // Generate CSRF token on client side using the same algorithm
      const generateToken = async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode(session.user!.id);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setCsrfToken(hashHex);
      };
      generateToken();
    }
  }, [session?.user?.id]);

  return <CsrfContext.Provider value={csrfToken}>{children}</CsrfContext.Provider>;
}

export function useCsrfToken() {
  return useContext(CsrfContext);
}
