import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;

  // Fallback song model in case user is offline or API fails
  const fallbackSong = {
    isPlaying: false,
    title: "Not Listening",
    artist: "Spotify / Last.fm",
    album: "Offline",
    image: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=300&q=80",
    songUrl: "https://www.last.fm",
    playedAt: null,
  };

  if (!apiKey || !username) {
    return NextResponse.json(fallbackSong, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
      },
    });
  }

  try {
    const response = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&limit=1&format=json`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store", // Keep API request fresh, caching is handled downstream on our route response
      }
    );

    if (!response.ok) {
      throw new Error(`Last.fm API returned status ${response.status}`);
    }

    const data = await response.json();
    const track = data?.recenttracks?.track?.[0];

    if (!track) {
      return NextResponse.json(fallbackSong);
    }

    const isPlaying = track["@attr"]?.nowplaying === "true";
    const title = track.name;
    const artist = track.artist?.["#text"] || "Unknown Artist";
    const album = track.album?.["#text"] || "Unknown Album";
    
    // Attempt to parse out high-res extralarge (300x300) cover image from Last.fm
    const image =
      track.image?.find((img: any) => img.size === "extralarge")?.["#text"] ||
      track.image?.find((img: any) => img.size === "large")?.["#text"] ||
      fallbackSong.image;
      
    const songUrl = track.url || `https://www.last.fm/music/${encodeURIComponent(artist)}/_/${encodeURIComponent(title)}`;
    const playedAt = track.date?.["#text"] || null;

    return NextResponse.json(
      {
        isPlaying,
        title,
        artist,
        album,
        image,
        songUrl,
        playedAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching now playing from Last.fm:", error);
    return NextResponse.json(fallbackSong, {
      headers: {
        "Cache-Control": "public, s-maxage=10",
      },
    });
  }
}
