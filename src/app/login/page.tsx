import { auth } from "@/auth";
import SignIn from "@/components/SignIn";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await auth();
  console.log("session: ", session);

  return (
    <div>
      <SignIn />
    </div>
  );
};

export default page;
