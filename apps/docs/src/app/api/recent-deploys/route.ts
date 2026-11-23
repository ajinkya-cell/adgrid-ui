import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// What <TicketPrinterLive> polls: your latest deploys, newest first, as { source, project, deploys }.
//   GET /api/recent-deploys?limit=5
// Two backends, whichever is configured (Vercel wins if both are):
//   Vercel:          VERCEL_TOKEN, optional VERCEL_PROJECT_ID and VERCEL_TEAM_ID (production deploys)
//   GitHub Actions:  GITHUB_DEPLOY_REPO ("owner/repo"), optional GITHUB_DEPLOY_WORKFLOW (file name
//                    or id, e.g. "deploy.yml") and GITHUB_TOKEN
// Never errors: no data → { source: null, project: null, deploys: [] }.

type Status = "ready" | "error" | "canceled" | "building";
interface Deploy {
  id: string;
  status: Status;
  project?: string;
  target?: string;
  branch?: string;
  sha?: string;
  message?: string;
  url?: string;
  date: number | string;
  duration: number | null;
  number?: number;
}
type Feed = { source: "vercel" | "github" | null; project: string | null; deploys: Deploy[] };

const MAX = 6;
const TTL = 20_000;
const TIMEOUT = 5000;

// One shared answer serves every visitor for a few seconds; if the API is down, the last good
// answer keeps being served.
let cache: { feed: Feed; at: number } | null = null;

const json = (feed: Feed, limit: number, maxAge: number) =>
  NextResponse.json(
    { ...feed, deploys: feed.deploys.slice(0, limit) },
    { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 5}` } }
  );

export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get("limit") ?? 5);
  const limit = Math.min(MAX, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 5));

  if (cache && Date.now() - cache.at < TTL) return json(cache.feed, limit, 15);
  try {
    const feed = process.env.VERCEL_TOKEN ? await fromVercel() : process.env.GITHUB_DEPLOY_REPO ? await fromGitHub() : null;
    if (feed) {
      cache = { feed, at: Date.now() };
      return json(feed, limit, 15);
    }
  } catch (error) {
    console.error("recent-deploys:", error);
  }
  return cache ? json(cache.feed, limit, 10) : json({ source: null, project: null, deploys: [] }, limit, 10);
}

// ── Vercel ──────────────────────────────────────────────────────────────────

interface VercelDeployment {
  uid: string;
  name: string;
  url?: string;
  inspectorUrl?: string | null;
  created: number;
  state?: string;
  readyState?: string;
  target?: string | null;
  buildingAt?: number;
  ready?: number;
  meta?: { githubCommitSha?: string; githubCommitMessage?: string; githubCommitRef?: string };
}

const vercelStatus = (state = ""): Status =>
  state === "READY" ? "ready" : state === "ERROR" ? "error" : state === "CANCELED" ? "canceled" : "building";

async function fromVercel(): Promise<Feed | null> {
  const { VERCEL_TOKEN: token, VERCEL_PROJECT_ID: projectId, VERCEL_TEAM_ID: teamId } = process.env;
  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("limit", String(MAX));
  url.searchParams.set("target", "production");
  if (projectId) url.searchParams.set("projectId", projectId);
  if (teamId) url.searchParams.set("teamId", teamId);

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT) });
  if (!response.ok) throw new Error(`Vercel ${response.status}`);
  const data = await response.json();

  const deploys = ([] as VercelDeployment[]).concat(data?.deployments ?? []).map((d): Deploy => {
    const start = d.buildingAt ?? d.created;
    return {
      id: d.uid,
      status: vercelStatus(d.readyState ?? d.state),
      project: d.name,
      target: d.target ?? "preview",
      branch: d.meta?.githubCommitRef,
      sha: d.meta?.githubCommitSha,
      message: d.meta?.githubCommitMessage?.split("\n")[0].trim(),
      url: d.inspectorUrl ?? (d.url ? `https://${d.url}` : undefined),
      date: d.created,
      duration: d.ready && start ? d.ready - start : null,
    };
  });
  return deploys.length ? { source: "vercel", project: deploys[0].project ?? null, deploys } : null;
}

// ── GitHub Actions ──────────────────────────────────────────────────────────

interface WorkflowRun {
  id: number;
  run_number: number;
  status: string;
  conclusion: string | null;
  head_sha: string;
  head_branch: string | null;
  display_title?: string;
  head_commit?: { message?: string } | null;
  html_url: string;
  created_at: string;
  run_started_at?: string;
  updated_at: string;
  repository: { name: string };
}

const runStatus = (run: WorkflowRun): Status =>
  run.status !== "completed"
    ? "building"
    : run.conclusion === "success"
      ? "ready"
      : run.conclusion === "cancelled" || run.conclusion === "skipped"
        ? "canceled"
        : "error";

async function fromGitHub(): Promise<Feed | null> {
  const { GITHUB_DEPLOY_REPO: repo, GITHUB_DEPLOY_WORKFLOW: workflow, GITHUB_TOKEN: token } = process.env;
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  const path = workflow ? `actions/workflows/${encodeURIComponent(workflow)}/runs` : "actions/runs";
  const url = new URL(`https://api.github.com/repos/${repo}/${path}`);
  url.searchParams.set("per_page", String(MAX));

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

  const deploys = ([] as WorkflowRun[]).concat(data?.workflow_runs ?? []).map((run): Deploy => {
    const status = runStatus(run);
    const started = Date.parse(run.run_started_at ?? run.created_at);
    return {
      id: String(run.id),
      number: run.run_number,
      status,
      project: run.repository.name,
      target: "production",
      branch: run.head_branch ?? undefined,
      sha: run.head_sha,
      message: (run.head_commit?.message ?? run.display_title ?? "").split("\n")[0].trim() || undefined,
      url: run.html_url,
      date: run.created_at,
      duration: status !== "building" && Number.isFinite(started) ? Date.parse(run.updated_at) - started : null,
    };
  });
  return deploys.length ? { source: "github", project: deploys[0].project ?? null, deploys } : null;
}
