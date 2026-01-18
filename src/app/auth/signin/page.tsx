import { IconBrandGithub } from "@tabler/icons-react";
import Card from "@/components/Card";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Sign In
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in with your GitHub account to continue
          </p>
        </div>

        <a
          href="/api/auth/signin/github"
          className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          <IconBrandGithub size={24} />
          <span>Sign in with GitHub</span>
        </a>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
}
