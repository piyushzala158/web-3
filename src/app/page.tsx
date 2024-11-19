import { auth } from "@/auth";
import Home from "@/views/home";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/login");

  return (
    <div className="h-screen w-screen bg-grey">
      <Home user={session?.user} />
      <SpotifyPlayer />
    </div>
  );
};

export default page;
