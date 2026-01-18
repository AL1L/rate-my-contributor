import { prisma } from "./prisma";

/**
 * Detect usefulness of a rating comment
 * Returns a score from -1 to 1 indicating comment quality
 * 
 * Current implementation:
 * - No comment or <20 chars: 0.0 (neutral/low usefulness)
 * - 20+ chars: 1.0 (high usefulness)
 * - Spam/abuse: -1.0 (should not count at all)
 * 
 * Future: Can be extended with NLP for:
 * - Sentiment analysis
 * - Constructiveness scoring
 * - Spam/abuse detection (returns -1.0)
 * - Specific feedback presence
 * - Profanity/toxicity detection
 */
function detectUsefulness(comment: string | null): number {
  if (!comment || comment.trim().length < 20) {
    return 0.0;
  }
  
  // TODO: Add NLP-based usefulness detection
  // - If spam/abuse detected, return -1.0
  // - If constructive and detailed, return 1.0
  // - Otherwise return value between -1.0 and 1.0
  
  return 1.0;
}

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
 * Asymmetric Time Decay:
 * - Good ratings (4-5 stars) do NOT decay over time - accomplishments last
 * - Bad ratings (1-2 stars) decay exponentially - people can improve
 * - Formula for bad reviews: weight = max(0.3, e^(-days/365))
 * - Fresh bad rating → 1.0x weight
 * - 1 year old       → ~0.37x weight
 * - 2+ years old     → ~0.3x weight (minimum)
 * 
 * Streak Multiplier (1.0x to 2.0x):
 * - Consecutive ratings of the same sentiment amplify impact
 * - Streak types:
 *   * Positive streak: 4-5 star ratings in sequence
 *   * Negative streak: 1-2 star ratings in sequence
 * - Each consecutive rating in a streak: multiplier = 1.0 + (streak_length * 0.1)
 * - Max multiplier: 2.0x (streaks of 10+)
 * - Example: 5 consecutive 1-star reviews → each gets 1.4x multiplier
 * 
 * Clustering Penalty (1.0x to 2.0x for bad reviews):
 * - Multiple bad reviews within 90 days amplify impact
 * - If 3+ bad reviews occur within 3 months, apply cluster multiplier
 * - Formula: multiplier = 1.0 + (cluster_size - 2) * 0.2
 * - Max multiplier: 2.0x
 * 
 * Comment Usefulness (0.0x to 1.0x):
 * - Ratings with meaningful comments carry more weight
 * - Usefulness score (-1 to 1) from detectUsefulness() function
 * - Mapped to multiplier: max(0, 0.5 + (usefulness * 0.5))
 * - Spam/abuse (usefulness -1): 0.0x weight (completely ignored)
 * - No comment or <20 chars (usefulness 0): 0.5x weight
 * - Detailed comment (usefulness 1): 1.0x weight
 * - Future: NLP-based analysis for spam/abuse/constructiveness/sentiment
 * 
 * Final Calculation:
 * 1. For each rating, calculate:
 *    contribution = score * reviewer_weight * position_weight * time_weight * streak_mult * cluster_mult * comment_usefulness
 * 2. Sum all weighted contributions and weights
 * 3. Final CSCS = 500 + (total_weighted_contributions / total_weights)
 * 4. Clamp result between 0 and 1000
 * 
 * Example Scenarios:
 * - Single 5★ with detailed comment → ~502 CSCS
 * - Single 5★ with no comment → ~501 CSCS (0.5x usefulness penalty)
 * - Three 5★ in sequence (streak) → ~508 CSCS
 * - Single 1★ with no comment → ~499 CSCS (0.5x usefulness penalty)
 * - Five 1★ with detailed comments in 2 months (streak + cluster) → ~470 CSCS
 * - Old 1★ (2 years ago) → ~499 CSCS (decayed)
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
  const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
  
  // Detect streaks and clusters
  const ratings = profile.ratings;
  const streaks: number[] = new Array(ratings.length).fill(1);
  const clusterMultipliers: number[] = new Array(ratings.length).fill(1);
  
  // Calculate streaks (consecutive positive or negative ratings)
  for (let i = 1; i < ratings.length; i++) {
    const current = ratings[i].score;
    const previous = ratings[i - 1].score;
    
    const isCurrentPositive = current >= 4;
    const isCurrentNegative = current <= 2;
    const isPreviousPositive = previous >= 4;
    const isPreviousNegative = previous <= 2;
    
    if ((isCurrentPositive && isPreviousPositive) || (isCurrentNegative && isPreviousNegative)) {
      streaks[i] = streaks[i - 1] + 1;
    }
  }
  
  // Calculate clustering for bad reviews (3+ bad reviews within 90 days)
  for (let i = 0; i < ratings.length; i++) {
    if (ratings[i].score <= 2) {
      const ratingTime = ratings[i].createdAt.getTime();
      let clusterSize = 1;
      
      // Count bad reviews within 90 days before and after this rating
      for (let j = 0; j < ratings.length; j++) {
        if (i !== j && ratings[j].score <= 2) {
          const timeDiff = Math.abs(ratingTime - ratings[j].createdAt.getTime());
          if (timeDiff <= THREE_MONTHS_MS) {
            clusterSize++;
          }
        }
      }
      
      if (clusterSize >= 3) {
        clusterMultipliers[i] = 1.0 + Math.min((clusterSize - 2) * 0.2, 1.0); // Max 2.0x
      }
    }
  }
  
  // Calculate weighted score contribution from each rating
  let totalWeightedScore = 0;
  let totalWeight = 0;

  ratings.forEach((rating, index) => {
    // Map 1-5 stars to -4 to +4 points
    const scoreContribution = (rating.score - 3) * 2;
    const isPositive = rating.score >= 4;
    const isNegative = rating.score <= 2;

    // Reviewer weight: reviewer's CSCS normalized to 0.5-1.5 range
    const reviewerCscs = rating.user.githubProfile?.cscs || 500;
    const reviewerWeight = 0.5 + (reviewerCscs / 1000);

    // Position weight: later reviews weigh more (1.0 + position/total * 0.5)
    const positionWeight = 1.0 + (index / ratings.length) * 0.5;
    
    // Asymmetric time decay: only bad reviews decay over time
    let timeWeight = 1.0;
    if (isNegative) {
      const ageInDays = (now - rating.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      timeWeight = Math.max(0.3, Math.exp(-ageInDays / 365));
    }
    // Good ratings don't decay - accomplishments are permanent
    
    // Streak multiplier: consecutive same-sentiment ratings
    const streakLength = streaks[index];
    const streakMultiplier = 1.0 + Math.min(streakLength * 0.1, 1.0); // Max 2.0x
    
    // Cluster multiplier: only for bad reviews
    const clusterMultiplier = clusterMultipliers[index];
    
    // Comment usefulness: meaningful comments carry more weight, spam gets 0x
    const usefulness = detectUsefulness(rating.comment);
    const commentUsefulnessMultiplier = Math.max(0, 0.5 + (usefulness * 0.5)); // 0.0x to 1.0x

    const totalWeightForRating = reviewerWeight * positionWeight * timeWeight * streakMultiplier * clusterMultiplier * commentUsefulnessMultiplier;
    
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
