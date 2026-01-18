import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchGitHubUsers } from "@/lib/github";
import { validateSearchInput } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSearch = searchParams.get("search") || "";
  const search = rawSearch ? validateSearchInput(rawSearch) : "";
  const sortBy = searchParams.get("sortBy") || "rating";

  // Get GitHub profiles from database
  const dbProfiles = await prisma.gitHubProfile.findMany({
    where: search
      ? {
          username: { contains: search, mode: "insensitive" },
        }
      : {},
    include: {
      ratings: true,
    },
  });

  const dbUsersWithRatings = dbProfiles.map((profile) => {
    const avgRating =
      profile.ratings.length > 0
        ? profile.ratings.reduce((sum, r) => sum + r.score, 0) / profile.ratings.length
        : 0;
    return {
      id: profile.id,
      username: profile.username,
      email: "",
      avatarUrl: profile.avatarUrl,
      avgRating,
      ratingsCount: profile.ratings.length,
      inDatabase: true,
    };
  });

  // Get users from GitHub if there's a search query
  let allUsers = [...dbUsersWithRatings];
  
  if (search) {
    const githubUsers = await searchGitHubUsers(search);
    
    // Add GitHub users that aren't already in our database
    const dbUsernames = new Set(dbProfiles.map(p => p.username.toLowerCase()));
    
    const githubOnlyUsers = githubUsers
      .filter(ghUser => !dbUsernames.has(ghUser.login.toLowerCase()))
      .map(ghUser => ({
        id: `github-${ghUser.login}`,
        username: ghUser.login,
        email: "",
        avatarUrl: ghUser.avatar_url,
        avgRating: 0,
        ratingsCount: 0,
        inDatabase: false,
      }));
    
    allUsers = [...dbUsersWithRatings, ...githubOnlyUsers];
  }

  if (sortBy === "rating") {
    allUsers.sort((a, b) => b.avgRating - a.avgRating || a.username.localeCompare(b.username));
  } else {
    allUsers.sort((a, b) => a.username.localeCompare(b.username));
  }

  return NextResponse.json(allUsers);
}
