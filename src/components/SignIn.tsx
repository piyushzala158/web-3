import { signIn } from "@/auth";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        const data = await signIn("spotify");
        console.log("data: ", data);  
      }}
    >
      <button type="submit">Signin with Sporify</button>
    </form>
  );
}
