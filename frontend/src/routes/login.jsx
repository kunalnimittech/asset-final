import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import { safeRedirect } from "../lib/safe-redirect";
import { authErrorMessage, getSessionSafe, sessionQuery } from "../queries/session";
import { AuthShell } from "../features/auth/AuthShell";
import { SocialButtons } from "../features/auth/SocialButtons";
import { ssoErrorMessage } from "../features/auth/sso-errors";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: safeRedirect(search.redirect),
    // Set by better-auth when a Google / Microsoft / Zoho sign-in fails.
    ...(typeof search.error === "string" ? { error: search.error } : {}),
  }),
  beforeLoad: async ({ context, search }) => {
    const session = await getSessionSafe(context.queryClient);
    if (session) throw redirect({ to: search.redirect });
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo, error: ssoError } = Route.useSearch();
  const [ssoStartError, setSsoStartError] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(authErrorMessage(error, "Sign in failed"));
      return data;
    },
    onSuccess: async () => {
      // Force a fresh read: the cached value is the "signed out" null from beforeLoad,
      // and a cached null would bounce the user straight back to /login.
      await queryClient.fetchQuery({ ...sessionQuery(), staleTime: 0 });
      navigate({ to: redirectTo, replace: true });
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    signIn.mutate();
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to NimitTech Assets."
      footer={
        <>
          New to NimitTech Assets?{" "}
          <Link to="/signup" search={{ redirect: redirectTo }}>
            Create an account
          </Link>
        </>
      }
    >
      <SocialButtons redirectTo={redirectTo} onError={setSsoStartError} />
      {(ssoStartError || ssoError) && (
        <p className="form-error form-error--sso" role="alert">
          {ssoStartError || ssoErrorMessage(ssoError)}
        </p>
      )}
      <div className="or" role="separator">
        <span>or sign in with email</span>
      </div>

      <form onSubmit={onSubmit} className="form">
        <label className="form-field">
          <span>Work email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {signIn.isError && (
          <p className="form-error" role="alert">
            {signIn.error.message}
          </p>
        )}

        <button type="submit" className="btn btn--primary btn--block" disabled={signIn.isPending}>
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
