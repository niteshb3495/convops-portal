import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SecurityPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <span className="text-lg font-bold tracking-tight text-zinc-50">ConvOps</span>
          <span className="text-zinc-600">/</span>
          <span className="text-lg font-semibold text-zinc-300">Security & Access</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">

        {/* Intro */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 mb-2">How ConvOps accesses your AWS account</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            ConvOps has read access to your AWS account and optional write access for approved actions.
            This page explains exactly what that means — no marketing, just the technical reality.
          </p>
        </div>

        {/* Core security properties */}
        <div className="space-y-3">

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-800">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 mb-1">Read-only by default</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  ConvOps reads CloudWatch metrics, logs, and resource metadata (ECS, EC2, RDS, Lambda, ELB).
                  No read action modifies anything in your account. Write access is optional and only granted
                  for the specific service types you select during setup.
                </p>
                <div className="mt-3 rounded-lg bg-zinc-800/60 px-3 py-2">
                  <p className="text-xs font-mono text-zinc-500">Read permissions: cloudwatch:Get*, cloudwatch:Describe*, logs:Filter*, ecs:Describe*, ec2:Describe*, rds:Describe*, lambda:List*, elasticloadbalancing:Describe*</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-950 border border-blue-800">
                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 mb-1">Scoped IAM permissions</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  ConvOps deploys a single CloudFormation template into your account. It creates one IAM role
                  (<code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">ConvOpsAccessRole</code>) with
                  the minimum permissions needed. You can review the full policy in your AWS console at any time.
                  No wildcard <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">*</code> on write actions.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["ecs:UpdateService", "ec2:RebootInstances", "rds:RebootDBInstance", "ssm:SendCommand"].map(p => (
                    <span key={p} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">{p}</span>
                  ))}
                  <span className="text-xs text-zinc-600 self-center">— only if you enable write access</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-950 border border-amber-800">
                <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 mb-1">Manual approval required for every action</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  ConvOps never executes a write action autonomously. Every action — restart, reboot, scale —
                  requires an explicit reply from you via WhatsApp or Slack. Confirmation is phone-bound:
                  only the person who received the alert can approve it. Confirmations expire after 5 minutes.
                </p>
                <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 font-mono text-xs text-zinc-400">
                  ConvOps: "Confirm: restart api-service on prod-cluster?"<br />
                  You: "YES"<br />
                  <span className="text-emerald-500">→ Action executes. Audit log written.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 mb-1">Audit logs for all actions</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Every action taken by ConvOps is logged with: timestamp, resource ARN, action type,
                  approved by (phone number), and outcome. Logs are retained for 90 days.
                  You can request a full export at any time by emailing{" "}
                  <a href="mailto:info@convops.io" className="text-zinc-300 hover:text-white underline">info@convops.io</a>.
                </p>
                <div className="mt-3 rounded-lg bg-zinc-800/60 px-3 py-2">
                  <div className="font-mono text-xs text-zinc-500 space-y-0.5">
                    <div><span className="text-zinc-600">action:</span> ecs:UpdateService</div>
                    <div><span className="text-zinc-600">resource:</span> arn:aws:ecs:eu-central-1:123456789:service/prod/api</div>
                    <div><span className="text-zinc-600">approved_by:</span> +49151xxxxxxxx</div>
                    <div><span className="text-zinc-600">timestamp:</span> 2026-03-25T02:14:32Z</div>
                    <div><span className="text-zinc-600">result:</span> <span className="text-emerald-500">success</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-950 border border-red-900">
                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 mb-1">Revoke access instantly</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  To remove ConvOps access completely: delete the{" "}
                  <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">ConvOpsAccessRole</code>{" "}
                  IAM role in your AWS account. ConvOps loses all access immediately — no support ticket,
                  no waiting period. The CloudFormation stack can be deleted in under 60 seconds.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* What ConvOps will NEVER do */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">What ConvOps will never do</h2>
          <ul className="space-y-2">
            {[
              "Terminate or delete any resource",
              "Modify security groups, VPCs, or IAM policies",
              "Access S3, Secrets Manager, Parameter Store, or any application secrets",
              "Execute any action without your explicit confirmation",
              "Store your logs, metrics, or application data — only operational metadata",
              "Share your data with third parties other than AWS and Anthropic (AI inference)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                <svg className="h-4 w-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* STS session note */}
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 px-5 py-4">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <span className="font-medium text-zinc-400">Session tokens:</span> ConvOps assumes your IAM role using AWS STS with a maximum session duration of 15 minutes. Tokens are cached in Lambda memory only — never written to disk or a database. Each incident investigation uses a fresh token.
          </p>
        </div>

        {/* Questions */}
        <div className="text-center">
          <p className="text-sm text-zinc-500">
            Questions about security or access?{" "}
            <a href="mailto:info@convops.io" className="text-zinc-300 hover:text-white underline">
              info@convops.io
            </a>
          </p>
        </div>

      </main>
    </div>
  );
}
