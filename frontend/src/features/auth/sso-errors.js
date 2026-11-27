/** Messages for the ?error= code better-auth adds when SSO fails. */
export function ssoErrorMessage(code) {
  if (!code) return null;
  const map = {
    access_denied: "Sign-in was cancelled.",
    account_not_linked: "That email already has an account. Sign in with your password first.",
    email_not_found: "Your provider didn't share an email address.",
    unable_to_get_user_info: "Couldn't read your profile from the provider.",
    state_mismatch: "The sign-in session expired. Please try again.",
    please_restart_the_process: "The sign-in session expired. Please try again.",
  };
  return map[code] ?? "Single sign-on failed. Please try again.";
}
