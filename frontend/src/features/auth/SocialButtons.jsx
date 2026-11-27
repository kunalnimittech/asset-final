import { useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { authClient } from "../../lib/auth-client";

// Which sign-in methods the backend has credentials for.
const providersQuery = () =>
  queryOptions({
    queryKey: ["auth-providers"],
    queryFn: async () => {
      const res = await fetch("/api/auth-providers");
      if (!res.ok) throw new Error("Could not load sign-in options");
      return res.json();
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.27a12 12 0 0 0 0 10.8l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.27 6.6l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

function ZohoMark() {
  // Zoho's four colours, as its mark sets them: red, green, blue, yellow
  return (
    <svg viewBox="0 0 28 18" width="24" height="16" aria-hidden>
      <rect x="0.5" y="3" width="6" height="12" rx="1.2" fill="#E42527" transform="rotate(-8 3.5 9)" />
      <rect x="7.5" y="2" width="6" height="13" rx="1.2" fill="#089949" transform="rotate(6 10.5 8.5)" />
      <rect x="14.5" y="3" width="6" height="12" rx="1.2" fill="#226DB4" transform="rotate(-6 17.5 9)" />
      <rect x="21.5" y="2" width="6" height="13" rx="1.2" fill="#F9B21D" transform="rotate(8 24.5 8.5)" />
    </svg>
  );
}

const PROVIDERS = [
  { id: "google", name: "Google", Mark: GoogleMark },
  { id: "microsoft", name: "Microsoft", Mark: MicrosoftMark },
  { id: "zoho", name: "Zoho", Mark: ZohoMark },
];

/**
 * Google, Microsoft and Zoho single sign-on. better-auth sends the browser to
 * the provider and back to /api/auth/callback/<id>, then on to `redirectTo`.
 */
export function SocialButtons({ redirectTo, onError }) {
  const { data: enabled, isError, refetch } = useQuery(providersQuery());
  const [pending, setPending] = useState(null);

  // Buttons are always clickable. If a provider has no credentials in
  // backend/.env yet, the click explains that instead of failing silently.
  const start = async (provider, name) => {
    onError?.(null);
    let config = enabled;
    if (!config) config = (await refetch()).data;
    if (!config) {
      onError?.("Can't reach the server. Make sure the backend is running and try again.");
      return;
    }
    if (!config[provider]) {
      const key = provider.toUpperCase();
      onError?.(`${name} sign-in isn't set up yet. Add ${key}_CLIENT_ID and ${key}_CLIENT_SECRET to backend/.env and restart the backend.`);
      return;
    }

    setPending(provider);
    const origin = window.location.origin;
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: origin + redirectTo,
      errorCallbackURL: origin + "/login",
    });
    // On success the page is already navigating to the provider.
    if (error) {
      setPending(null);
      onError?.(error.message || "Could not start single sign-on.");
    }
  };

  return (
    <div className="sso">
      {PROVIDERS.map(({ id, name, Mark }) => {
        return (
          <button
            key={id}
            type="button"
            className="btn sso__btn"
            onClick={() => start(id, name)}
            disabled={pending !== null}
            title={isError ? "Server unreachable" : `Continue with ${name}`}
            aria-label={`Continue with ${name}`}
          >
            <Mark />
            <span>{pending === id ? "Redirecting…" : name}</span>
          </button>
        );
      })}
    </div>
  );
}
