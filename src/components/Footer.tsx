import { IconAi, IconHeart, IconHeartFilled } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="mt-auto py-8 px-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto text-center space-y-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Made with <IconAi style={{ display: "inline" }} className="text-red-500" size={16} /> by{" "}
          <a
            href="/user/AL1L"
            className="text-zinc-900 dark:text-white hover:underline font-medium"
          >
            AL1L
          </a>
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Inspired by{" "}
          <a
            href="https://x.com/dan_ddyo/status/2012521016333947339"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 dark:text-white hover:underline font-medium"
          >
            @dan_ddyo on X
          </a>
        </p>
      </div>
    </footer>
  );
}
