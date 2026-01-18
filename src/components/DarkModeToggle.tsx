"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function DarkModeToggle() {
  const { data: session, update } = useSession();
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (session?.user?.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [session?.user?.darkMode]);

  const toggleDarkMode = async () => {
    if (!session?.user || isToggling) return;
    
    setIsToggling(true);
    const newDarkMode = !session.user.darkMode;

    // Immediately update the UI
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      // Get CSRF token and update database
      const tokenRes = await fetch("/api/csrf");
      const { csrfToken } = await tokenRes.json();
      
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ darkMode: newDarkMode }),
      });

      // Update session
      await update();
    } catch (error) {
      console.error("Failed to toggle dark mode:", error);
      // Revert UI on error
      if (!newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } finally {
      setIsToggling(false);
    }
  };

  if (!session?.user) return null;

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {session.user.darkMode ? <IconSun size={20} /> : <IconMoon size={20} />}
    </button>
  );
}
