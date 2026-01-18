"use client";

import { useState, useEffect } from "react";
import { IconStar, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCsrfToken } from "@/hooks/useCsrfToken";

interface RatingFormProps {
  githubProfileId: string;
  existingRating?: { id: string; score: number; comment: string | null } | null;
}

export default function RatingForm({ githubProfileId, existingRating }: RatingFormProps) {
  const [score, setScore] = useState(existingRating?.score || 0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const csrfToken = useCsrfToken();

  useEffect(() => {
    if (existingRating) {
      setScore(existingRating.score);
      setComment(existingRating.comment || "");
    }
  }, [existingRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ githubProfileId, score, comment }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to submit rating");
      }
    } catch (error) {
      alert("Error submitting rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your rating?")) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/ratings?githubProfileId=${githubProfileId}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      if (response.ok) {
        setScore(0);
        setComment("");
        router.refresh();
      } else {
        alert("Failed to delete rating");
      }
    } catch (error) {
      alert("Error deleting rating");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Your Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHoveredScore(star)}
              onMouseLeave={() => setHoveredScore(0)}
              className="focus:outline-none"
            >
              <IconStar
                size={32}
                className={
                  star <= (hoveredScore || score)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-zinc-300 dark:text-zinc-700"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Comment (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
          rows={4}
          placeholder="Share your thoughts about this contributor..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={score === 0 || isSubmitting}
          className="flex-1 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
        </button>
        {existingRating && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <IconTrash size={18} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
