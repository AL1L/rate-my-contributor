import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubPR {
  id: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  repository_url?: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

const GITHUB_API_BASE = "https://api.github.com";
const headers = {
  Accept: "application/vnd.github.v3+json",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  }),
};

export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  const cacheKey = `user:${username}`;
  const cached = cache.get<GitHubUser>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    return null;
  }
}

export async function searchGitHubUsers(query: string): Promise<GitHubUser[]> {
  const cacheKey = `search:${query}`;
  const cached = cache.get<GitHubUser[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(query)}&per_page=30`,
      { headers }
    );
    if (!response.ok) return [];
    const data = await response.json();
    cache.set(cacheKey, data.items);
    return data.items;
  } catch (error) {
    console.error("Error searching GitHub users:", error);
    return [];
  }
}

export async function fetchUserPRs(username: string): Promise<GitHubPR[]> {
  const cacheKey = `prs:${username}`;
  const cached = cache.get<GitHubPR[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=author:${username}+type:pr&per_page=50&sort=created&order=desc`,
      { headers }
    );
    if (!response.ok) return [];
    const data = await response.json();
    
    // Filter out PRs where the author owns the repository
    const filteredPRs = data.items.filter((pr: GitHubPR) => {
      if (!pr.repository_url) return true;
      
      // Extract owner from repository_url: https://api.github.com/repos/owner/repo
      const match = pr.repository_url.match(/\/repos\/([^\/]+)\//);
      if (!match) return true;
      
      const repoOwner = match[1];
      // Exclude PRs where author owns the repo (but allow org repos)
      return repoOwner.toLowerCase() !== username.toLowerCase();
    });
    
    cache.set(cacheKey, filteredPRs);
    return filteredPRs;
  } catch (error) {
    console.error("Error fetching user PRs:", error);
    return [];
  }
}

export async function fetchRepoCommits(
  owner: string,
  repo: string,
  author?: string
): Promise<GitHubCommit[]> {
  const cacheKey = `commits:${owner}/${repo}:${author}`;
  const cached = cache.get<GitHubCommit[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = author
      ? `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?author=${author}&per_page=50`
      : `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=50`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) return [];
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching repo commits:", error);
    return [];
  }
}
