import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  // If already signed in, take them directly to the app.
  if (userId) redirect("/dashboard");

  // Otherwise, render Clerk's sign-in flow.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md px-4 py-10">
        <SignIn />
      </div>
    </div>
  );
}
