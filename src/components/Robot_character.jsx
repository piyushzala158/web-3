import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useSession } from "next-auth/react";

export default function AnimatedCharacter({ ...props }) {
  const group = useRef();
  const character = useRef();

  const [enteredRoom, setEnteredRoom] = useState(null);

  const { scene, animations } = useGLTF("/newmodel2.glb");
  const { names } = useAnimations(animations, group);

  const [movement, setMovement] = useState({
    forward: 0,
    sideways: 0,
    running: false,
  });

  const smoothRotation = useRef(0);
  const smoothVelocity = useRef(0);

  // Character movement speed
  const WALK_SPEED = 2;
  const RUN_SPEED = 4;
  const ROTATION_SPEED = 10;
  const LERP_FACTOR = 0.1;

  // Smoothly interpolate between values
  const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    // Log available animations

    // Set up keyboard controls
    const handleKeyDown = (e) => {
      switch (e.code) {
        case "KeyW":
          setMovement((prev) => ({ ...prev, forward: 1 }));
          break;
        case "KeyS":
          setMovement((prev) => ({ ...prev, forward: -1 }));
          break;
        case "KeyA":
          setMovement((prev) => ({ ...prev, sideways: -1 }));
          break;
        case "KeyD":
          setMovement((prev) => ({ ...prev, sideways: 1 }));
          break;
        case "ShiftLeft":
          setMovement((prev) => ({ ...prev, running: true }));
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
          setMovement((prev) => ({ ...prev, forward: 0 }));
          break;
        case "KeyS":
          setMovement((prev) => ({ ...prev, forward: 0 }));
          break;
        case "KeyA":
          setMovement((prev) => ({ ...prev, sideways: 0 }));
          break;
        case "KeyD":
          setMovement((prev) => ({ ...prev, sideways: 0 }));
          break;
        case "ShiftLeft":
          setMovement((prev) => ({ ...prev, running: false }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [names]);

  useFrame((state, delta) => {
    if (!character.current) return;

    // Calculate movement direction
    const speed = movement.running ? RUN_SPEED : WALK_SPEED;
    const moveVector = new THREE.Vector3(
      movement.sideways,
      0,
      -movement.forward
    ).normalize();

    // Calculate target rotation
    let targetRotation = 0;
    if (moveVector.length() > 0) {
      targetRotation = Math.atan2(moveVector.x, moveVector.z);
    }

    // Smoothly interpolate rotation
    smoothRotation.current = lerp(
      smoothRotation.current,
      targetRotation,
      ROTATION_SPEED * delta
    );

    // Apply rotation
    character.current.rotation.y = smoothRotation.current;

    // Calculate and apply movement
    const targetVelocity = moveVector.length() * speed;
    smoothVelocity.current = lerp(
      smoothVelocity.current,
      targetVelocity,
      LERP_FACTOR
    );

    if (moveVector.length() > 0) {
      character.current.position.x +=
        moveVector.x * smoothVelocity.current * delta;
      character.current.position.z +=
        moveVector.z * smoothVelocity.current * delta;
    }

    // Optional: Add boundary checks
    const BOUNDARY = 10;
    character.current.position.x = THREE.MathUtils.clamp(
      character.current.position.x,
      -BOUNDARY,
      BOUNDARY
    );
    character.current.position.z = THREE.MathUtils.clamp(
      character.current.position.z,
      -BOUNDARY,
      BOUNDARY
    );
  });

  return (
    <>
      {/* Room Detector Component */}
      <RoomDetector
        modelRef={character}
        enteredRoom={enteredRoom}
        setEnteredRoom={setEnteredRoom}
      />

      <group ref={character} {...props}>
        <group ref={group}>
          <primitive object={scene} />
        </group>
      </group>
    </>
  );
}

// Preload the character model
useGLTF.preload("/newmodel2.glb");

// Room Detection Component
function RoomDetector({ modelRef, setEnteredRoom }) {
  const { data: session } = useSession();

  const [currentSong, setCurrentSong] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Define rooms with associated playlist track indices
  const rooms = [
    {
      id: "room-top-left",
      position: [-10, 0, -10],
      size: [10, 10, 10],
      trackIndex: 0, // First song in the playlist
    },
    {
      id: "room-top-right",
      position: [10, 0, -10],
      size: [10, 10, 10],
      trackIndex: 1, // Second song in the playlist
    },
    {
      id: "room-bottom-left",
      position: [-10, 0, 10],
      size: [10, 10, 10],
      trackIndex: 2, // Third song in the playlist
    },
    {
      id: "room-bottom-right",
      position: [10, 0, 10],
      size: [10, 10, 10],
      trackIndex: 3, // Fourth song in the playlist
    },
  ];

  // Track the last entered room to prevent repeating song
  const lastEnteredRoomRef = useRef(null);

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
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
          return data.tracks.items;
        } else {
          setError("Unable to fetch playlist tracks");
          return [];
        }
      } catch (err) {
        setError("An error occurred while fetching playlist tracks");
        return [];
      }
    };

    const checkRoomDetection = async () => {
      if (modelRef.current) {
        const modelBox = new THREE.Box3().setFromObject(modelRef.current);
        const modelCenter = modelBox.getCenter(new THREE.Vector3());

        const playlistTracks = await fetchPlaylistSongs();

        rooms.forEach((room) => {
          const roomBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(...room.position),
            new THREE.Vector3(...room.size)
          );

          if (roomBox.containsPoint(modelCenter)) {
            // Only change song if room is different from last entered
            if (lastEnteredRoomRef?.current !== room?.id) {
              const track = playlistTracks[room.trackIndex]?.track;

              // Stop previous song
              if (audioRef.current) {
                audioRef.current.pause();
              }

              // Play new song preview
              if (track?.preview_url) {
                const audio = new Audio(track.preview_url);
                audio.play();
                audioRef.current = audio;
              }

              setEnteredRoom(room.id);
              lastEnteredRoomRef.current = room.id;
            }
          }
        });
      }
      requestAnimationFrame(checkRoomDetection);
    };

    const animationFrameId = requestAnimationFrame(checkRoomDetection);

    return () => {
      cancelAnimationFrame(animationFrameId);
      // Clean up audio if component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [modelRef, session]);

  // Render room boundaries
  return rooms.map((room) => (
    <mesh key={room.id} position={room.position}>
      <boxGeometry args={room.size} />
      <meshStandardMaterial color="grey" opacity={0.2} transparent />
    </mesh>
  ));
}
