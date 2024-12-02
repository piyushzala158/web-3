import { auth } from "@/auth";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import Home from "@/views/home";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/login");
  const token = cookies().get("authjs.session-token")?.value;
  console.log("token: ", token);

  return (
    <div className="h-screen w-screen bg-grey">
       <Home  />
       
      <SpotifyPlayer />
    </div>
  );
};

export default page;
