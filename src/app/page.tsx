import { auth } from "@/auth";
import Home from "@/views/home";
import SpotifyPlayer from "@/views/home/SpotifyPlayer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/login");
  const token = cookies().get("authjs.session-token")?.value;
  console.log("token: ", token);

  return (
    <div className="h-screen w-screen bg-grey">
      <Home user={session?.user} />
    </div>
  );
};

export default page;
