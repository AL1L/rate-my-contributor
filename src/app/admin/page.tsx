import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Card from "@/components/Card";
import UserAvatar from "@/components/UserAvatar";
import { IconUsers, IconStar, IconGitPullRequest, IconTrash } from "@tabler/icons-react";
import DeleteButton from "@/components/DeleteButton";
import DeleteRatingButton from "@/components/DeleteRatingButton";
import { isUserAdmin } from "@/lib/auth-helpers";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  // Check admin status from database
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    include: {
      githubProfile: {
        include: {
          ratings: true,
          pullRequests: true,
        }
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const allRatings = await prisma.rating.findMany({
    include: {
      githubProfile: true,
      user: {
        include: {
          githubProfile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalUsers = users.length;
  const totalRatings = await prisma.rating.count();
  const totalPRs = await prisma.pullRequest.count();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">Admin Panel</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <IconUsers size={32} className="text-zinc-900 dark:text-white" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Total Users</h3>
            </div>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white">{totalUsers}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <IconStar size={32} className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Total Ratings
              </h3>
            </div>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white">{totalRatings}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <IconGitPullRequest size={32} className="text-zinc-900 dark:text-white" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Total Pull Requests
              </h3>
            </div>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white">{totalPRs}</p>
          </Card>
        </div>

        {/* Users Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Users</h2>
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Ratings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    PRs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          src={user.githubProfile?.avatarUrl || user.image || ""} 
                          username={user.githubProfile?.username || user.name || "User"} 
                          size={40} 
                        />
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {user.githubProfile?.username || user.name || "User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {user.githubProfile?.ratings.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {user.githubProfile?.pullRequests.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DeleteButton
                        userId={user.id}
                        disabled={user.role === "admin"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Recent Ratings */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Recent Ratings</h2>
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {allRatings.map((rating) => (
                  <tr key={rating.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserAvatar 
                          src={rating.user?.githubProfile?.avatarUrl || rating.user?.image || ""} 
                          username={rating.user?.githubProfile?.username || rating.user?.name || "Unknown"} 
                          size={32} 
                        />
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {rating.user?.githubProfile?.username || rating.user?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserAvatar 
                          src={rating.githubProfile.avatarUrl} 
                          username={rating.githubProfile.username} 
                          size={32} 
                        />
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {rating.githubProfile.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-yellow-500">{rating.score}</span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">/ 5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300 max-w-xs truncate">
                      {rating.comment || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DeleteRatingButton ratingId={rating.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
