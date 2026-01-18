"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useCsrfToken } from "@/hooks/useCsrfToken";

export default function DarkModeToggle() {
  const { data: session, update } = useSession();
  const csrfToken = useCsrfToken();

  useEffect(() => {
    if (session?.user?.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [session?.user?.darkMode]);

  const toggleDarkMode = async () => {
    if (!session?.user) return;

    const newDarkMode = !session.user.darkMode;

    // Update database
    await fetch("/api/user/preferences", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ darkMode: newDarkMode }),
    });

    // Update session
    await update({ ...session, user: { ...session.user, darkMode: newDarkMode } });
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
