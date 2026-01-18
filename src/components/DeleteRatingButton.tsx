"use client";

import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface DeleteRatingButtonProps {
  ratingId: string;
}

export default function DeleteRatingButton({ ratingId }: DeleteRatingButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this rating?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ratings/${ratingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete rating");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      alert("Failed to delete rating");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
      aria-label="Delete rating"
    >
      <IconTrash size={20} />
    </button>
  );
}
