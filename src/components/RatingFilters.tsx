"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface RatingFiltersProps {
  username: string;
}

export default function RatingFilters({ username }: RatingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const sort = searchParams.get("sort") || "newest";
  const filter = searchParams.get("filter") || "all";
  const page = searchParams.get("page") || "1";

  const buildUrl = (newSort: string, newFilter: string) => {
    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to page 1 on filter change
    if (newSort !== "newest") params.set("sort", newSort);
    if (newFilter !== "all") params.set("filter", newFilter);
    const query = params.toString();
    return `/user/${username}/ratings${query ? `?${query}` : ""}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Sort */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Sort by
        </label>
        <select
          value={sort}
          onChange={(e) => router.push(buildUrl(e.target.value, filter))}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      {/* Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Filter by stars
        </label>
        <select
          value={filter}
          onChange={(e) => router.push(buildUrl(sort, e.target.value))}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white"
        >
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </div>
    </div>
  );
}
