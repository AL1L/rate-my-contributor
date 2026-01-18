import { prisma } from "./prisma";

/**
 * Calculate Coding Social Credit Score (CSCS) for a GitHub profile
 * Range: 0-1000, Default: 500
 * 
 * Algorithm:
 * - Base score: 500
 * - Each rating contributes based on:
 *   1. Star rating (1-5 stars mapped to -100 to +100 points)
 *   2. Reviewer's CSCS (higher reviewer score = more weight)
 *   3. Time decay (more recent = higher weight)
 */
export async function calculateCSCS(githubProfileId: string): Promise<number> {
  const profile = await prisma.gitHubProfile.findUnique({
    where: { id: githubProfileId },
    include: {
      ratings: {
        include: {
          user: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!profile || profile.ratings.length === 0) {
    return 500; // Default score
  }

  const BASE_SCORE = 500;
  const now = Date.now();
  
  // Calculate weighted score contribution from each rating
  let totalWeightedScore = 0;
  let totalWeight = 0;

  profile.ratings.forEach((rating, index) => {
    // Map 1-5 stars to -4 to +4 points
    // 1 star = -4, 2 stars = -2, 3 stars = 0, 4 stars = +2, 5 stars = +4
    const scoreContribution = (rating.score - 3) * 2;

    // Reviewer weight: reviewer's CSCS normalized to 0.5-1.5 range
    // Someone with 500 CSCS has weight 1.0
    // Someone with 1000 CSCS has weight 1.5
    // Someone with 0 CSCS has weight 0.5
    const reviewerCscs = rating.user.githubProfile?.cscs || 500;
    const reviewerWeight = 0.5 + (reviewerCscs / 1000);

    // Time weight: exponential decay, but recent reviews count more
    // Position weight: later reviews weigh more (1.0 + position/total * 0.5)
    const positionWeight = 1.0 + (index / profile.ratings.length) * 0.5;
    
    // Time decay: reviews older than 1 year start decaying
    const ageInDays = (now - rating.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const timeWeight = Math.max(0.3, Math.exp(-ageInDays / 365)); // Min weight 0.3

    const totalWeightForRating = reviewerWeight * positionWeight * timeWeight;
    
    totalWeightedScore += scoreContribution * totalWeightForRating;
    totalWeight += totalWeightForRating;
  });

  // Calculate final score
  const averageWeightedContribution = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const finalScore = BASE_SCORE + averageWeightedContribution;

  // Clamp between 0 and 1000
  return Math.max(0, Math.min(1000, Math.round(finalScore)));
}

/**
 * Update CSCS for a specific user's GitHub profile
 */
export async function updateCSCS(githubProfileId: string): Promise<number> {
  const cscs = await calculateCSCS(githubProfileId);
  
  await prisma.gitHubProfile.update({
    where: { id: githubProfileId },
    data: { cscs },
  });

  return cscs;
}

/**
 * Recalculate CSCS for all users (admin function)
 */
export async function recalculateAllCSCS(): Promise<void> {
  const profiles = await prisma.gitHubProfile.findMany();

  for (const profile of profiles) {
    await updateCSCS(profile.id);
  }
}
