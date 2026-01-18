"use client";

import { useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

export default function RecalculateCSCSButton({ githubProfileId }: { githubProfileId: string }) {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const response = await fetch("/api/admin/cscs/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubProfileId }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to recalculate CSCS:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <button
      onClick={handleRecalculate}
      disabled={isRecalculating}
      className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50"
      title="Recalculate CSCS"
    >
      <IconRefresh size={16} className={isRecalculating ? "animate-spin" : ""} />
    </button>
  );
}
