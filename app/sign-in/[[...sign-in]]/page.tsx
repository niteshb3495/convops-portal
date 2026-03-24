import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">ConvOps</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to your account</p>
      </div>
      <SignIn />
    </div>
  );
}
