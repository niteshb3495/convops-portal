import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">ConvOps</h1>
        <p className="mt-1 text-sm text-zinc-400">Create your account — free, no credit card needed</p>
      </div>

      <SignUp />

      {/* Next step hint shown below the signup form */}
      <div className="mt-8 w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-950 border border-indigo-800 mt-0.5">
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Next: Connect AWS to analyse your first alert</p>
            <p className="text-xs text-zinc-500 mt-1">
              Takes 2 minutes. Deploys one CloudFormation stack — read-only by default, no changes without your approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
