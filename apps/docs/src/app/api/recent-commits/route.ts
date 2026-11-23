import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// What <SplitFlapBoardLive> polls: your latest commits, newest first, as { user, commits }.
//   GET /api/recent-commits?limit=4
// Backed by GitHub's commit search (public repos), one request for messages, repos and dates.
// Set GITHUB_USERNAME; GITHUB_TOKEN is optional and raises the rate limit. Never errors:
// no data → { user: null, commits: [] }.

interface Commit {
  message: string;
  repo: string;
  sha: string;
  url: string;
  date: string;
}
type Feed = { user: string | null; commits: Commit[] };

const MAX = 5;
const TTL = 60_000;
const TIMEOUT = 5000;

// Search allows 10 requests a minute without a token, so one shared answer serves every visitor
// for a minute; if GitHub is down or rate-limits us, the last good answer keeps being served.
let cache: { feed: Feed; at: number } | null = null;

const json = (feed: Feed, limit: number, maxAge: number) =>
  NextResponse.json(
    { user: feed.user, commits: feed.commits.slice(0, limit) },
    { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 5}` } }
  );

export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get("limit") ?? 4);
  const limit = Math.min(MAX, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 4));

  if (cache && Date.now() - cache.at < TTL) return json(cache.feed, limit, 60);
  try {
    const feed = await fromGitHub();
    if (feed) {
      cache = { feed, at: Date.now() };
      return json(feed, limit, 60);
    }
  } catch (error) {
    console.error("recent-commits:", error);
  }
  return cache ? json(cache.feed, limit, 30) : json({ user: null, commits: [] }, limit, 30);
}

interface SearchItem {
  sha: string;
  html_url: string;
  commit: { message: string; author?: { date?: string } };
  repository: { name: string };
}

async function fromGitHub(): Promise<Feed | null> {
  const { GITHUB_USERNAME: user, GITHUB_TOKEN: token } = process.env;
  if (!user) return null;

  const url = new URL("https://api.github.com/search/commits");
  url.search = new URLSearchParams({ q: `author:${user}`, sort: "author-date", order: "desc", per_page: String(MAX) }).toString();
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);

  const data = await response.json();
  const commits = ([] as SearchItem[]).concat(data?.items ?? []).map(
    (item): Commit => ({
      message: item.commit.message.split("\n")[0].trim() || "Untitled commit",
      repo: item.repository.name,
      sha: item.sha,
      url: item.html_url,
      date: item.commit.author?.date ?? "",
    })
  );
  return commits.length ? { user, commits } : null;
}
