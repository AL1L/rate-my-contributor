"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@tabler/icons-react";
import { useCsrfToken } from "@/hooks/useCsrfToken";

export default function DeleteButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const csrfToken = useCsrfToken();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      alert("Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={disabled || isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Delete user"
    >
      <IconTrash size={20} />
    </button>
  );
}
