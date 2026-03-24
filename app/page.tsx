import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-50 tracking-tight mb-3">
          Welcome to ConvOps
        </h1>
        <p className="text-zinc-400 mb-10 max-w-sm mx-auto">
          Operational intelligence for your AWS infrastructure.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
