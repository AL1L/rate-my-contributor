import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchGitHubUser } from "@/lib/github";
import Card from "@/components/Card";
import RatingStars from "@/components/RatingStars";
import UserAvatar from "@/components/UserAvatar";
import RatingFilters from "@/components/RatingFilters";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export const dynamic = 'force-dynamic';

const RATINGS_PER_PAGE = 20;

type SearchParams = Promise<{
  page?: string;
  sort?: string;
  filter?: string;
}>;

export default async function UserRatingsPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ username: string }>;
  searchParams: SearchParams;
}) {
  const { username } = await params;
  const { page = "1", sort = "newest", filter = "all" } = await searchParams;

  const currentPage = Math.max(1, parseInt(page));
  const skip = (currentPage - 1) * RATINGS_PER_PAGE;

  // Fetch GitHub data
  const githubUser = await fetchGitHubUser(username);
  if (!githubUser) {
    notFound();
  }

  // Get or create profile
  let profile = await prisma.gitHubProfile.findUnique({
    where: { username },
  });

  if (!profile) {
    profile = await prisma.gitHubProfile.create({
      data: {
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio,
      },
    });
  }

  // Build filter conditions
  const whereClause: any = { githubProfileId: profile.id };
  
  if (filter !== "all") {
    const filterValue = parseInt(filter);
    if (!isNaN(filterValue)) {
      whereClause.score = filterValue;
    }
  }

  // Build sort order
  let orderBy: any = { createdAt: "desc" }; // Default: newest
  
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "highest":
      orderBy = { score: "desc" };
      break;
    case "lowest":
      orderBy = { score: "asc" };
      break;
  }

  // Fetch ratings with pagination
  const [ratings, totalCount] = await Promise.all([
    prisma.rating.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            githubProfile: true,
          },
        },
      },
      orderBy,
      skip,
      take: RATINGS_PER_PAGE,
    }),
    prisma.rating.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / RATINGS_PER_PAGE);
  const avgRating = await prisma.rating.aggregate({
    where: { githubProfileId: profile.id },
    _avg: { score: true },
    _count: true,
  });

  const buildUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams();
    if (newParams.page && newParams.page !== "1") params.set("page", newParams.page);
    if (newParams.sort && newParams.sort !== "newest") params.set("sort", newParams.sort);
    if (newParams.filter && newParams.filter !== "all") params.set("filter", newParams.filter);
    const query = params.toString();
    return `/user/${username}/ratings${query ? `?${query}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/user/${username}`}
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
          >
            <IconChevronLeft size={20} />
            Back to profile
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <UserAvatar src={profile.avatarUrl} username={profile.username} size={80} />
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {username}'s Ratings
              </h1>
              {avgRating._count > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  <RatingStars rating={avgRating._avg.score || 0} />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {avgRating._avg.score?.toFixed(1)} average from {avgRating._count} {avgRating._count === 1 ? "rating" : "ratings"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <RatingFilters username={username} />
        </Card>

        {/* Ratings List */}
        <div className="space-y-4 mb-8">
          {ratings.map((rating) => (
            <Card key={rating.id} className="p-6">
              <div className="flex items-start gap-4">
                <UserAvatar 
                  src={rating.user?.githubProfile?.avatarUrl || rating.user?.image || ""} 
                  username={rating.user?.githubProfile?.username || rating.user?.name || "Anonymous"} 
                  size={48} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {rating.user?.githubProfile?.username || rating.user?.name || "Anonymous"}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-500 ml-3">
                        {new Date(rating.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <RatingStars rating={rating.score} />
                  {rating.comment && (
                    <p className="text-zinc-700 dark:text-zinc-300 mt-3">
                      {rating.comment}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {ratings.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                No ratings found with the selected filters.
              </p>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Link
              href={buildUrl({ page: (currentPage - 1).toString(), sort, filter })}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === 1
                  ? "border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
              onClick={(e) => currentPage === 1 && e.preventDefault()}
            >
              <IconChevronLeft size={20} />
            </Link>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Link
                    key={pageNum}
                    href={buildUrl({ page: pageNum.toString(), sort, filter })}
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === pageNum
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                        : "border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            <Link
              href={buildUrl({ page: (currentPage + 1).toString(), sort, filter })}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === totalPages
                  ? "border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
              onClick={(e) => currentPage === totalPages && e.preventDefault()}
            >
              <IconChevronRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
