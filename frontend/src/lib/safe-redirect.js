// Only allow same-site paths, so ?redirect=https://evil.example can't be abused.
export const safeRedirect = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
