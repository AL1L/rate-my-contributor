import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  username: string;
  size?: number;
}

export default function UserAvatar({ src, username, size = 40 }: UserAvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${username}'s avatar`}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback to initials
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-semibold"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initial}
    </div>
  );
}
