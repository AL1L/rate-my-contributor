import { prisma } from "./prisma";

/**
 * Calculate Coding Social Credit Score (CSCS) for a GitHub profile
 * Range: 0-1000, Default: 500
 * 
 * Algorithm Overview:
 * The CSCS is a weighted scoring system that evaluates a contributor's reputation
 * based on ratings from other users. The algorithm balances multiple factors to
 * create a fair and dynamic reputation score.
 * 
 * Base Score: 500 points (neutral starting point)
 * 
 * Rating Contribution:
 * - Each rating contributes -4 to +4 points based on stars:
 *   * 1 star = -4 points
 *   * 2 stars = -2 points
 *   * 3 stars =  0 points (neutral)
 *   * 4 stars = +2 points
 *   * 5 stars = +4 points
 * 
 * Reviewer Weight (0.5x to 1.5x multiplier):
 * - Ratings from higher-reputation reviewers carry more weight
 * - CSCS 0   → 0.5x weight (low credibility reviewer)
 * - CSCS 500 → 1.0x weight (average reviewer)
 * - CSCS 1000→ 1.5x weight (high credibility reviewer)
 * - Formula: weight = 0.5 + (reviewer_cscs / 1000)
 * 
 * Position Weight (1.0x to 1.5x multiplier):
 * - More recent ratings in the sequence count more
 * - First rating  → 1.0x weight
 * - Last rating   → 1.5x weight
 * - Formula: weight = 1.0 + (position / total_ratings) * 0.5
 * 
 * Time Decay (0.3x to 1.0x multiplier):
 * - Ratings decay exponentially over time
 * - Fresh ratings → 1.0x weight
 * - 1 year old    → ~0.37x weight
 * - 2+ years old  → ~0.3x weight (minimum)
 * - Formula: weight = max(0.3, e^(-days/365))
 * 
 * Final Calculation:
 * 1. For each rating, calculate: contribution = score * reviewer_weight * position_weight * time_weight
 * 2. Sum all weighted contributions and weights
 * 3. Final CSCS = 500 + (total_weighted_contributions / total_weights)
 * 4. Clamp result between 0 and 1000
 * 
 * Example:
 * - Profile with 5 ratings: [5★, 5★, 4★, 3★, 2★]
 * - All reviewers at 500 CSCS, all recent
 * - Weighted average ≈ +2.4 points → Final CSCS ≈ 502
 */
export async function calculateCSCS(githubProfileId: string): Promise<number> {
  const profile = await prisma.gitHubProfile.findUnique({
    where: { id: githubProfileId },
    include: {
      ratings: {
        include: {
          user: {
            include: {
              githubProfile: true
            }
          }
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
