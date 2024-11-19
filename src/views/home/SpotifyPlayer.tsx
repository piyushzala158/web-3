"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const SpotifyPlayer = () => {
  const { data: session } = useSession();

  const [song, setSong] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentSong = async () => {
      if (!session) return;

      try {
        const response = await fetch(
          "https://api.spotify.com/v1/playlists/3cEYpjA9oz9GiPac4AsH4n",
          {
            headers: {
              Authorization: `Bearer ${session?.token?.access_token}`,
            },
          }
        );
    

        if (response.ok) {
          const data = await response.json();
          setSong(data?.tracks?.items[2]?.track);
        } else {
          setError("Unable to fetch the currently playing song");
        }
      } catch (err) {
        setError("An error occurred while fetching the song");
      }
    };

    fetchCurrentSong();
  }, [session]);

  if (!session) {
    return <p>Please log in to Spotify to see the currently playing song.</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      {song ? (
        <div>
          <h3>Currently Playing:</h3>
          <p>
            {song?.name} by{" "}
            {song?.artists?.map((artist) => artist?.name).join(", ")}
          </p>
          <audio controls src={song?.preview_url}>
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : (
        <p>No song is currently playing.</p>
      )}
    </div>
  );
};

export default SpotifyPlayer;
