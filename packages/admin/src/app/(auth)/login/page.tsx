import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          This form is a placeholder. Configure NextAuth providers and environment variables to enable
          real authentication.
        </p>
        <Link
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          href="/api/auth/signin"
        >
          Continue with provider
        </Link>
      </div>
    </div>
  );
}
