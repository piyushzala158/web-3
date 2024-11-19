"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Model from "@/components/Robot_character";
import { User } from "next-auth";

export default function Home({ user }: { user: User }) {
  console.log("user: ", user);
  return (
   
      <Canvas className="h-screen w-screen bg-grey">
        <ambientLight intensity={0.7} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <PerspectiveCamera
          makeDefault
          position={[0, 30, 0]}
          rotation={[-Math.PI / 4, 0, 0]}
          fov={50}
        />

        {/* Model with ref */}
        <Model />

        <OrbitControls
          target={[0, 0, 0]}
          enableDamping
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />
      </Canvas>
  
  );
}
