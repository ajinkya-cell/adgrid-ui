import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// What <TurntableCardLive> polls: your listening, newest first, as { user, tracks }.
//   GET /api/recent-tracks?limit=4
// Spotify first (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN): whatever is
// playing right now comes back on top with `nowPlaying: true`, which is what spins the record.
// Falls back to Last.fm (LASTFM_API_KEY / LASTFM_USERNAME). Never errors: no data → { user: null, tracks: [] }.

interface Track {
  title: string;
  artist: string;
  image?: string;
  url?: string;
  playedAt: number | null;
  nowPlaying: boolean;
}
type Feed = { user: string | null; tracks: Track[] };

const TIMEOUT = 5000;
const json = (feed: Feed, maxAge: number) =>
  NextResponse.json(feed, { headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` } });

export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get("limit") ?? 4);
  const limit = Math.min(6, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 4));

  try {
    const feed = (await fromSpotify(limit)) ?? (await fromLastFm(limit));
    // Short cache: starting a song should reach the card within a poll or two.
    if (feed) return json(feed, 5);
  } catch (error) {
    console.error("recent-tracks:", error);
  }
  return json({ user: null, tracks: [] }, 10);
}

// ── Spotify ──────────────────────────────────────────────────────────────────────────────────────

interface SpotifyTrack {
  id: string;
  name: string;
  artists?: { name: string }[];
  album?: { images?: { url: string; width: number }[] };
  external_urls?: { spotify?: string };
}

let cachedToken: { value: string; expires: number } | null = null;

async function spotifyToken(id: string, secret: string, refresh: string) {
  if (cachedToken && cachedToken.expires > Date.now() + 30_000) return cachedToken.value;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!response.ok) throw new Error(`Spotify token ${response.status}`);
  const data = await response.json();
  cachedToken = { value: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cachedToken.value;
}

const fromSpotifyTrack = (t: SpotifyTrack, playedAt: number | null, nowPlaying: boolean): Track => ({
  title: t.name || "Untitled",
  artist: t.artists?.map((a) => a.name).join(", ") || "Unknown artist",
  // Spotify lists covers largest first; 300px is plenty for a 40px thumb and the record label.
  image: [...(t.album?.images ?? [])].sort((a, b) => a.width - b.width).find((i) => i.width >= 300)?.url ?? t.album?.images?.[0]?.url,
  url: t.external_urls?.spotify,
  playedAt,
  nowPlaying,
});

async function fromSpotify(limit: number): Promise<Feed | null> {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return null;

  const token = await spotifyToken(id, secret, refresh);
  const get = (path: string) =>
    fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT) });

  const [currentRes, recentRes, meRes] = await Promise.all([
    get("/me/player/currently-playing"),
    get(`/me/player/recently-played?limit=${limit}`),
    get("/me").catch(() => null),
  ]);

  const tracks: Track[] = [];
  // 204 = nothing playing. Only an actual song that is actually playing counts (not ads, podcasts or paused).
  if (currentRes.status === 200) {
    const current = await currentRes.json();
    if (current?.is_playing && current.currently_playing_type === "track" && current.item) {
      tracks.push(fromSpotifyTrack(current.item, Date.now(), true));
    }
  }
  if (recentRes.ok) {
    const recent = await recentRes.json();
    const items = ([] as { track?: SpotifyTrack; played_at: string }[]).concat(recent?.items ?? []);
    items.forEach((entry, i) => {
      if (!entry?.track) return;
      // A song you finished and put straight back on would otherwise show twice in a row.
      if (i === 0 && tracks[0]?.nowPlaying && entry.track.external_urls?.spotify === tracks[0].url) return;
      tracks.push(fromSpotifyTrack(entry.track, Date.parse(entry.played_at) || null, false));
    });
  }
  if (!tracks.length) return null;

  const me = meRes?.ok ? await meRes.json() : null;
  return { user: me?.display_name ?? me?.id ?? null, tracks: tracks.slice(0, limit) };
}

// ── Last.fm ──────────────────────────────────────────────────────────────────────────────────────

interface LastFmImage {
  size: string;
  "#text": string;
}
interface LastFmTrack {
  name?: string;
  url?: string;
  artist?: { "#text"?: string };
  image?: LastFmImage[];
  date?: { uts?: string };
  "@attr"?: { nowplaying?: string };
}

// Last.fm serves this grey star when it has no art; the card's own blank label looks better.
const PLACEHOLDER_ART = "2a96cbd8b46e442fc41c2b86b821562f";

function lastFmArt(images: LastFmImage[] = []) {
  const url = images.find((i) => i.size === "extralarge")?.["#text"] || images.find((i) => i.size === "large")?.["#text"];
  return url && !url.includes(PLACEHOLDER_ART) ? url : undefined;
}

async function fromLastFm(limit: number): Promise<Feed | null> {
  const { LASTFM_API_KEY: apiKey, LASTFM_USERNAME: user } = process.env;
  if (!apiKey || !user) return null;

  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.search = new URLSearchParams({ method: "user.getrecenttracks", user, api_key: apiKey, limit: String(limit), format: "json" }).toString();
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT) });
  if (!response.ok) throw new Error(`Last.fm ${response.status}`);

  const data = await response.json();
  // A single result comes back as a bare object rather than an array.
  const raw = ([] as LastFmTrack[]).concat(data?.recenttracks?.track ?? []);
  // While a track is playing Last.fm returns it on top of `limit`, so trim back.
  const tracks = raw.slice(0, limit).map((t): Track => {
    const nowPlaying = t["@attr"]?.nowplaying === "true";
    const uts = Number(t.date?.uts);
    return {
      title: t.name || "Untitled",
      artist: t.artist?.["#text"] || "Unknown artist",
      image: lastFmArt(t.image),
      url: t.url,
      playedAt: nowPlaying ? Date.now() : Number.isFinite(uts) ? uts * 1000 : null,
      nowPlaying,
    };
  });
  return tracks.length ? { user, tracks } : null;
}
