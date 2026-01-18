import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Card from "@/components/Card";
import UserAvatar from "@/components/UserAvatar";
import RatingStars from "@/components/RatingStars";
import Link from "next/link";
import { IconBell, IconStar, IconGitPullRequest } from "@tabler/icons-react";
import NotificationsList from "@/components/NotificationsList";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      githubProfile: {
        include: {
          ratings: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          pullRequests: {
            include: {
              commits: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          notifications: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!user || !user.githubProfile) {
    redirect("/api/auth/signin");
  }

  const profile = user.githubProfile;

  const avgRating =
    profile.ratings.length > 0
      ? profile.ratings.reduce((sum, r) => sum + r.score, 0) / profile.ratings.length
      : 0;

  const unreadNotifications = profile.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">Dashboard</h1>

        {/* User Overview */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <UserAvatar src={profile.avatarUrl} username={profile.username} size={100} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {profile.username}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">{user.email}</p>
              {avgRating > 0 && (
                <div className="mb-4">
                  <RatingStars rating={avgRating} />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                    Based on {profile.ratings.length} {profile.ratings.length === 1 ? "rating" : "ratings"}
                  </p>
                </div>
              )}
              <Link
                href={`/user/${profile.username}`}
                className="inline-block px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                View Public Profile
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-2">
                <IconStar size={24} className="text-yellow-500" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Ratings</h3>
              </div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {profile.ratings.length}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {avgRating > 0 ? `Average: ${avgRating.toFixed(1)}` : "No ratings yet"}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-2">
                <IconGitPullRequest size={24} className="text-zinc-900 dark:text-white" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Pull Requests
                </h3>
              </div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {profile.pullRequests.length}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Tracked PRs</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-2">
                <IconBell size={24} className="text-zinc-900 dark:text-white" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {unreadNotifications}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Unread</p>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Ratings */}
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Recent Ratings
              </h2>
              <div className="space-y-4">
                {profile.ratings.length > 0 ? (
                  profile.ratings.map((rating) => (
                    <Card key={rating.id} className="p-4">
                      <RatingStars rating={rating.score} />
                      {rating.comment && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
                          {rating.comment}
                        </p>
                      )}
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center text-zinc-600 dark:text-zinc-400">
                    No ratings yet
                  </Card>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Notifications
              </h2>
              <NotificationsList notifications={profile.notifications} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
