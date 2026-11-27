// The six roles of Asset Management 2.0 (SOW + employee-flow doc).
// Each user has exactly one role (RBAC). These keys match ROLE.key in the
// database; the ROLE table holds the display name and description.
export const ROLES = Object.freeze({
  ADMIN: "admin",
  EMPLOYEE: "employee",
  PROCURER: "procurer",
  TECHNICIAN: "technician",
  ASSET_MANAGER: "asset_manager",
  VENDOR: "vendor",
});

export const ALL_ROLES = Object.values(ROLES);

// New sign-ups start as Employee; an admin changes the role in Setup → Users.
export const DEFAULT_ROLE = ROLES.EMPLOYEE;
