import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UserAvatar from "@/components/UserAvatar";
import RatingStars from "@/components/RatingStars";
import Card from "@/components/Card";
import { IconGitPullRequest, IconUsers, IconStar } from "@tabler/icons-react";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Get top rated GitHub profiles
  const profiles = await prisma.gitHubProfile.findMany({
    include: {
      ratings: true,
    },
    take: 6,
  });

  const profilesWithRatings = profiles.map((profile) => {
    const avgRating =
      profile.ratings.length > 0
        ? profile.ratings.reduce((sum, r) => sum + r.score, 0) / profile.ratings.length
        : 0;
    return { ...profile, avgRating };
  }).sort((a, b) => b.avgRating - a.avgRating);

  // Get stats
  const totalUsers = await prisma.gitHubProfile.count();
  const totalRatings = await prisma.rating.count();
  const totalPRs = await prisma.pullRequest.count();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
            Rate My Contributor
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Discover and rate GitHub contributors based on their contributions to open-source projects.
            Build your reputation in the open-source community.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/contributors"
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Browse Contributors
            </Link>
            <Link
              href="/api/auth/signin"
              className="px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Sign In with GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <IconUsers size={48} className="text-zinc-900 dark:text-white" />
              </div>
              <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                {totalUsers}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">Contributors</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <IconStar size={48} className="text-zinc-900 dark:text-white" />
              </div>
              <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                {totalRatings}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">Ratings</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <IconGitPullRequest size={48} className="text-zinc-900 dark:text-white" />
              </div>
              <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                {totalPRs}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">Pull Requests</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
            Top Contributors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profilesWithRatings.map((profile) => (
              <Link href={`/user/${profile.username}`} key={profile.id}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <UserAvatar src={profile.avatarUrl} username={profile.username} size={60} />
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {profile.username}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{profile.bio || 'GitHub Contributor'}</p>
                    </div>
                  </div>
                  {profile.avgRating > 0 && (
                    <div className="mt-4">
                      <RatingStars rating={profile.avgRating} />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        {profile.ratings.length} {profile.ratings.length === 1 ? "rating" : "ratings"}
                      </p>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
