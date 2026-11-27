import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { setTheme, useTheme } from "../../lib/theme";
import { useSignOut } from "../../lib/use-sign-out";
import { authErrorMessage } from "../../queries/session";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

const MIN_PASSWORD = 8;

function SettingsPage() {
  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Appearance, password and signed-in devices.</p>
      </div>
      <Appearance />
      <Password />
      <Sessions />
    </>
  );
}

function Appearance() {
  const [theme] = useTheme();
  const options = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
  ];
  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Appearance</h2>
        <p>Choose how NimitTech Assets looks on this device.</p>
      </div>
      <div className="panel__body">
        <div className="choice" role="radiogroup" aria-label="Theme">
          {options.map(({ id, label, Icon }) => (
            <button key={id} type="button" role="radio" aria-checked={theme === id} className="choice__opt" onClick={() => setTheme(id)}>
              <span className={`choice__swatch choice__swatch--${id}`} />
              <span className="choice__label">
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Password() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [formError, setFormError] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const change = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(authErrorMessage(error, "Could not change your password"));
    },
    onSuccess: () => setForm({ current: "", next: "", confirm: "" }),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (form.next.length < MIN_PASSWORD) return setFormError(`New password must be at least ${MIN_PASSWORD} characters.`);
    if (form.next !== form.confirm) return setFormError("New passwords don't match.");
    setFormError(null);
    change.mutate();
  };

  const error = formError ?? (change.isError ? change.error.message : null);

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel__head">
        <h2>Password</h2>
        <p>If you only sign in with Google, Microsoft or Zoho, you don't have a password here.</p>
      </div>
      <div className="panel__body">
        <div className="form form--narrow">
          <label className="form-field">
            <span>Current password</span>
            <input type="password" autoComplete="current-password" required value={form.current} onChange={set("current")} />
          </label>
          <div className="form-pair">
            <label className="form-field">
              <span>New password</span>
              <input type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={form.next} onChange={set("next")} />
            </label>
            <label className="form-field">
              <span>Confirm</span>
              <input type="password" autoComplete="new-password" required value={form.confirm} onChange={set("confirm")} />
            </label>
          </div>
        </div>
      </div>
      <div className="panel__foot">
        {error && <span className="note" style={{ color: "var(--danger)" }}>{error}</span>}
        {change.isSuccess && <span className="note note--ok">Password changed. Other devices were signed out.</span>}
        <button type="submit" className="btn btn--primary" disabled={change.isPending}>
          {change.isPending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}

function Sessions() {
  const signOut = useSignOut();
  const others = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.revokeOtherSessions();
      if (error) throw new Error(authErrorMessage(error, "Could not sign out other devices"));
    },
  });

  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Signed-in devices</h2>
      </div>
      <div className="panel__body">
        <div className="row-action">
          <p>Sign out everywhere except this browser.</p>
          <button type="button" className="btn" onClick={() => others.mutate()} disabled={others.isPending}>
            {others.isPending ? "Signing out…" : "Sign out other devices"}
          </button>
        </div>
        {others.isSuccess && <p className="note note--ok" style={{ marginTop: 10, fontSize: 13.5 }}>Other devices were signed out.</p>}
        {others.isError && <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--danger)" }}>{others.error.message}</p>}
      </div>
      <div className="panel__foot">
        <span className="note">Done for now?</span>
        <button type="button" className="btn btn--danger" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
          {signOut.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </section>
  );
}
