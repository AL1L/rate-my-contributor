"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import UserAvatar from "@/components/UserAvatar";
import RatingStars from "@/components/RatingStars";
import Card from "@/components/Card";

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  avgRating: number;
  ratingsCount: number;
}

export default function ContributorsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users?search=${encodeURIComponent(search)}&sortBy=${sortBy}`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
          Contributors
        </h1>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <IconSearch
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contributors..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "rating" | "name")}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
            No contributors found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Link href={`/user/${user.username}`} key={user.id}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <UserAvatar src={user.avatarUrl} username={user.username} size={60} />
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {user.username}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  {user.avgRating > 0 && (
                    <div className="mt-4">
                      <RatingStars rating={user.avgRating} />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        {user.ratingsCount} {user.ratingsCount === 1 ? "rating" : "ratings"}
                      </p>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
