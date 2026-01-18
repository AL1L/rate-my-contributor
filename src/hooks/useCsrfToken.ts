"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useCsrfToken() {
  const { data: session } = useSession();
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/csrf")
        .then(res => res.json())
        .then(data => setCsrfToken(data.csrfToken))
        .catch(err => console.error("Failed to fetch CSRF token:", err));
    }
  }, [session?.user]);

  return csrfToken;
}

export async function fetchWithCsrf(url: string, options: RequestInit = {}) {
  // Get CSRF token from API
  const tokenRes = await fetch("/api/csrf");
  const { csrfToken } = await tokenRes.json();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "x-csrf-token": csrfToken,
    },
  });
}
