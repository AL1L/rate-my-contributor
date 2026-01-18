import { IconStar, IconStarFilled } from "@tabler/icons-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

export default function RatingStars({ rating, maxRating = 5, size = 20 }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, i) => {
        if (i < fullStars) {
          return <IconStarFilled key={i} size={size} className="text-yellow-500" />;
        } else if (i === fullStars && hasHalfStar) {
          return (
            <div key={i} className="relative">
              <IconStar size={size} className="text-yellow-500" />
              <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                <IconStarFilled size={size} className="text-yellow-500" />
              </div>
            </div>
          );
        } else {
          return <IconStar key={i} size={size} className="text-zinc-300 dark:text-zinc-700" />;
        }
      })}
      <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
