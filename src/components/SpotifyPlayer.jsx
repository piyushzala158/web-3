"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SpotifyPlayer = () => {
  const { data: session } = useSession();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);

  const fetchCurrentPlayingSong = async () => {
    if (!session?.token?.access_token) return;

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${session.token.access_token}`,
          },
        }
      );

      if (response.status === 204) {
        setCurrentTrack(null);
        setError("No track currently playing");
      } else if (response.ok) {
        const data = await response.json();
        setCurrentTrack(data);
        setError(null);
      } else {
        setError("Unable to fetch current track");
        setCurrentTrack(null);
      }
    } catch {
      setError("An error occurred while fetching the current track");
      setCurrentTrack(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const token = session?.token?.access_token;

      if (window.Spotify && token) {
        const spotifyPlayer = new window.Spotify.Player({
          name: "Your Web Player",
          getOAuthToken: (cb) => cb(token),
        });

        // Add event listeners
        spotifyPlayer.addListener("ready", ({ device_id }) => {
          console.log("Ready with Device ID", device_id);
        });

        spotifyPlayer.addListener("not_ready", ({ device_id }) => {
          console.log("Device ID has gone offline", device_id);
        });

        spotifyPlayer.addListener("player_state_changed", (state) => {
          console.log("Player state changed:", state);
        });

        spotifyPlayer.connect();
        console.log("spotifyPlayer: ", spotifyPlayer);
        setPlayer(spotifyPlayer);
      }
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [session]);

  useEffect(() => {
    fetchCurrentPlayingSong();
    const intervalId = setInterval(fetchCurrentPlayingSong, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [session]);

  const playTrack = async () => {
    if (!currentTrack || !player || !session?.token?.access_token) return;

    const trackUri = currentTrack.item.uri;
    const positionMs = currentTrack.progress_ms;

    try {
      // Transfer playback to the Web Player
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [player._options.id], // Replace with your player device ID
          play: true,
        }),
      });

      // Start playing the track
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
          position_ms: positionMs,
        }),
      });
    } catch (err) {
      console.error("Failed to play track:", err);
    }
  };

  if (loading) {
    return <Skeleton className="w-full h-24" />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        {currentTrack ? (
          <div>
            <h2 className="text-xl font-bold">{currentTrack.item.name}</h2>
            <p className="text-sm text-gray-500">
              {currentTrack.item.artists
                .map((artist) => artist.name)
                .join(", ")}
            </p>
            <p className="text-sm text-gray-400">
              {currentTrack.item.album.name}
            </p>
            <p className="mt-2 text-sm font-semibold">
              {currentTrack.is_playing ? "Now Playing" : "Paused"}
            </p>
            <button
              onClick={playTrack}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Play on Web Player
            </button>
          </div>
        ) : (
          <p>No track currently playing</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SpotifyPlayer;
