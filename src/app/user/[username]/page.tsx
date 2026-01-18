import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchGitHubUser, fetchUserPRs } from "@/lib/github";
import UserAvatar from "@/components/UserAvatar";
import RatingStars from "@/components/RatingStars";
import Card from "@/components/Card";
import RatingForm from "@/components/RatingForm";
import { IconGitPullRequest, IconGitCommit, IconBrandGithub } from "@tabler/icons-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // Fetch GitHub data first
  const githubUser = await fetchGitHubUser(username);
  
  if (!githubUser) {
    notFound();
  }

  // Fetch or create GitHubProfile in database
  let profile = await prisma.gitHubProfile.findUnique({
    where: { username },
    include: {
      ratings: {
        orderBy: { createdAt: "desc" },
      },
      pullRequests: {
        include: {
          commits: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  // If profile doesn't exist in DB, create it
  if (!profile) {
    profile = await prisma.gitHubProfile.create({
      data: {
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio,
      },
      include: {
        ratings: true,
        pullRequests: {
          include: {
            commits: true,
          },
        },
      },
    });
  }

  // Fetch GitHub PRs
  const githubPRs = await fetchUserPRs(username);

  // Calculate average rating
  const avgRating =
    profile.ratings.length > 0
      ? profile.ratings.reduce((sum, r) => sum + r.score, 0) / profile.ratings.length
      : 0;

  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.username === username;
  const canRate = session?.user && !isOwnProfile;

  // Get current user's rating if logged in
  let userRating = null;
  if (session?.user?.email && !isOwnProfile) {
    userRating = await prisma.rating.findUnique({
      where: {
        userEmail_githubProfileId: {
          userEmail: session.user.email,
          githubProfileId: profile.id,
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* User Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <UserAvatar src={profile.avatarUrl} username={profile.username} size={120} />
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {profile.username}
                </h1>
              </div>
              {githubUser.bio && (
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">{githubUser.bio}</p>
              )}
              <div className="flex gap-6 mb-4">
                {githubUser && (
                  <>
                    <div className="text-sm">
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {githubUser.public_repos}
                      </span>{" "}
                      <span className="text-zinc-600 dark:text-zinc-400">repositories</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {githubUser.followers}
                      </span>{" "}
                      <span className="text-zinc-600 dark:text-zinc-400">followers</span>
                    </div>
                  </>
                )}
              </div>
              {avgRating > 0 && (
                <div className="mb-4">
                  <RatingStars rating={avgRating} />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                    Based on {profile.ratings.length} {profile.ratings.length === 1 ? "rating" : "ratings"}
                  </p>
                </div>
              )}
              {githubUser && (
                <a
                  href={githubUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <IconBrandGithub size={20} />
                  <span>View on GitHub</span>
                </a>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - PRs and Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pull Requests */}
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <IconGitPullRequest size={28} />
                Recent Pull Requests
              </h2>
              <div className="space-y-4">
                {githubPRs.slice(0, 10).map((pr) => (
                  <Card key={pr.id} className="p-4">
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                        {pr.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className={`px-2 py-1 rounded ${
                          pr.state === "open"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                        }`}>
                          {pr.state}
                        </span>
                        <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                      </div>
                    </a>
                  </Card>
                ))}
                {githubPRs.length === 0 && (
                  <Card className="p-8 text-center text-zinc-600 dark:text-zinc-400">
                    No pull requests found
                  </Card>
                )}
              </div>
            </div>

            {/* Database PRs */}
            {profile.pullRequests.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <IconGitCommit size={28} />
                  Tracked Pull Requests
                </h2>
                <div className="space-y-4">
                  {profile.pullRequests.map((pr) => (
                    <Card key={pr.id} className="p-4">
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:opacity-80 transition-opacity"
                      >
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                          {pr.title}
                        </h3>
                        {pr.description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            {pr.description}
                          </p>
                        )}
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {pr.commits.length} {pr.commits.length === 1 ? "commit" : "commits"}
                        </p>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Ratings */}
          <div>
            {canRate && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                  {userRating ? "Your Rating" : "Rate this Contributor"}
                </h2>
                <RatingForm githubProfileId={profile.id} existingRating={userRating} />
              </div>
            )}

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              Ratings
            </h2>
            <div className="space-y-4">
              {profile.ratings.map((rating) => (
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
              ))}
              {profile.ratings.length === 0 && (
                <Card className="p-8 text-center text-zinc-600 dark:text-zinc-400">
                  No ratings yet
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
