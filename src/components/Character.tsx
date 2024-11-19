import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

const Character = () => {
  const characterRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (characterRef.current) {
        switch (event.key) {
          case "ArrowUp":
            setPosition((pos) => ({ ...pos, z: pos.z - 0.1 }));
            break;
          case "ArrowDown":
            setPosition((pos) => ({ ...pos, z: pos.z + 0.1 }));
            break;
          case "ArrowLeft":
            setPosition((pos) => ({ ...pos, x: pos.x - 0.1 }));
            break;
          case "ArrowRight":
            setPosition((pos) => ({ ...pos, x: pos.x + 0.1 }));
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useFrame(() => {
    if (characterRef.current) {
      characterRef.current.position.set(position.x, position.y, position.z);
    }
  });

  return (
    <mesh ref={characterRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

export default Character;
