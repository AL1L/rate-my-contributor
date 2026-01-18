"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { IconUser, IconLogout, IconHome, IconSearch, IconSettings } from "@tabler/icons-react";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
              Rate My Contributor
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <IconHome size={20} />
                <span>Home</span>
              </Link>
              <Link
                href="/contributors"
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <IconSearch size={20} />
                <span>Contributors</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <IconUser size={20} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <IconSettings size={20} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <IconLogout size={20} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/api/auth/signin"
                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
