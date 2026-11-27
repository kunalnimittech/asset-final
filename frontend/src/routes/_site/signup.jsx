import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../../lib/auth-client";
import { safeRedirect } from "../../lib/safe-redirect";
import { authErrorMessage, getSessionSafe, sessionQuery } from "../../queries/session";
import { AuthShell } from "../../features/auth/AuthShell";
import { SocialButtons } from "../../features/auth/SocialButtons";

// Must match the backend (better-auth default minPasswordLength).
const MIN_PASSWORD = 8;

export const Route = createFileRoute("/_site/signup")({
  validateSearch: (search) => ({ redirect: safeRedirect(search.redirect) }),
  beforeLoad: async ({ context, search }) => {
    const session = await getSessionSafe(context.queryClient);
    if (session) throw redirect({ to: search.redirect });
  },
  component: SignupPage,
});

function SignupPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [formError, setFormError] = useState(null);
  const [ssoStartError, setSsoStartError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const signUp = useMutation({
    mutationFn: async () => {
      // better-auth signs the new user in automatically (sets the session cookie).
      const { data, error } = await authClient.signUp.email({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });
      if (error) throw new Error(authErrorMessage(error, "Sign up failed"));
      return data;
    },
    onSuccess: async () => {
      await queryClient.fetchQuery({ ...sessionQuery(), staleTime: 0 });
      navigate({ to: redirectTo, replace: true });
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < MIN_PASSWORD) {
      return setFormError(`Password must be at least ${MIN_PASSWORD} characters.`);
    }
    if (form.password !== form.confirm) {
      return setFormError("Passwords don't match.");
    }
    setFormError(null);
    signUp.mutate();
  };

  const error = formError ?? (signUp.isError ? signUp.error.message : null);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking NimitTech's assets in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" search={{ redirect: redirectTo }}>
            Sign in
          </Link>
        </>
      }
    >
      <SocialButtons redirectTo={redirectTo} onError={setSsoStartError} />
      {ssoStartError && (
        <p className="form-error form-error--sso" role="alert">
          {ssoStartError}
        </p>
      )}
      <div className="or" role="separator">
        <span>or sign up with email</span>
      </div>

      <form onSubmit={onSubmit} className="form">
        <label className="form-field">
          <span>Full name</span>
          <input type="text" autoComplete="name" placeholder="Aarav Mehta" required autoFocus value={form.name} onChange={set("name")} />
        </label>
        <label className="form-field">
          <span>Work email</span>
          <input type="email" autoComplete="email" placeholder="you@company.com" required value={form.email} onChange={set("email")} />
        </label>
        <div className="form-pair">
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD}
              value={form.password}
              onChange={set("password")}
            />
          </label>
          <label className="form-field">
            <span>Confirm</span>
            <input type="password" autoComplete="new-password" required value={form.confirm} onChange={set("confirm")} />
          </label>
        </div>
        <span className="form-hint">At least {MIN_PASSWORD} characters.</span>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary btn--block" disabled={signUp.isPending}>
          {signUp.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
