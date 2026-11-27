import {
  Boxes,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingCart,
  SlidersHorizontal,
  UsersRound,
  Wrench,
} from "lucide-react";

// Role-based access (RBAC): one role per user, checked on every page.
// Source: SOW "Roles and access" table and the build guide, Part 5.
// Keys match ROLE.key in the database (backend/src/constants/roles.js).

export const ROLE_LABELS = {
  admin: "Admin",
  employee: "Employee",
  procurer: "Procurer",
  technician: "Technician",
  asset_manager: "Asset manager",
  vendor: "Vendor",
};

export const roleLabel = (key) => ROLE_LABELS[key] ?? key;

// What a role can do in a module. Absent = no access (no menu item, page blocked).
//   full  – everything in the module
//   own   – only their own records
//   view  – read only
//   raise – can create (e.g. raise a work order) but not manage
export const LEVEL_LABELS = {
  full: "Full access",
  own: "Your own records only",
  view: "View only",
  raise: "Raise only",
};

/**
 * The menu, in SOW order. `access` per role comes straight from the SOW table
 * for Admin, Employee, Procurer and Technician.
 * Asset manager and Vendor are in the employee-flow doc but not in the SOW
 * table yet; their rows below are a starting assumption, pending decision.
 */
export const MODULES = [
  {
    key: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    summary: "Your overview: counts, recent activity and what needs attention.",
    access: { admin: "full", employee: "own", procurer: "full", technician: "full", asset_manager: "full", vendor: "own" },
  },
  {
    key: "requests",
    path: "/requests",
    label: "Requests",
    Icon: ClipboardList,
    summary: "Raise an asset request with products and quantities, and track its status and timeline.",
    plan: "Iteration 1 — request screens are next.",
    access: { admin: "full", employee: "own", procurer: "full", asset_manager: "view" },
  },
  {
    key: "approvals",
    path: "/approvals",
    label: "Approvals",
    Icon: ClipboardCheck,
    summary: "Approve or reject asset requests, review complaints and asset returns.",
    plan: "Iteration 2 — manager approval and admin review.",
    access: { admin: "full" },
  },
  {
    key: "procurements",
    path: "/procurements",
    label: "Procurements",
    Icon: ShoppingCart,
    summary: "Raise purchase orders per vendor, receive goods and record invoices.",
    plan: "Phase 1 — procurement and invoices.",
    access: { admin: "full", procurer: "full" },
  },
  {
    key: "assets",
    path: "/assets",
    label: "Assets",
    Icon: Package,
    summary: "Every asset with its owner, status, warranty, work orders and history.",
    plan: "Iteration 1 — your own assets view; the full register follows.",
    access: { admin: "full", employee: "own", procurer: "full", technician: "view", asset_manager: "full" },
  },
  {
    key: "inventory",
    path: "/inventory",
    label: "Inventory",
    Icon: Boxes,
    summary: "Spare parts in stock and how many have been used.",
    plan: "Phase 2 — inventory and work orders.",
    access: { admin: "full", procurer: "full", technician: "full", asset_manager: "full" },
  },
  {
    key: "work-orders",
    path: "/work-orders",
    label: "Work orders",
    Icon: Wrench,
    summary: "Raise and close repair and inspection work orders.",
    plan: "Phase 2 — inventory and work orders.",
    access: { admin: "full", employee: "raise", technician: "full", asset_manager: "full" },
  },
  {
    key: "maintenance",
    path: "/maintenance",
    label: "Preventive maintenance",
    Icon: CalendarClock,
    summary: "Scheduled maintenance that raises work orders when an asset is due.",
    plan: "Phase 2 — schedules.",
    access: { admin: "full", technician: "full", asset_manager: "full" },
  },
  {
    key: "setup",
    path: "/setup",
    label: "Setup",
    Icon: UsersRound,
    summary: "Users and roles, departments, job titles, categories, products and vendors.",
    access: { admin: "full" },
  },
  {
    key: "preferences",
    path: "/preferences",
    label: "App preferences",
    Icon: SlidersHorizontal,
    summary: "Company name, default tax, currency and email notifications.",
    plan: "Phase 5 — settings to be confirmed.",
    access: { admin: "full" },
  },
];

export const moduleByKey = (key) => MODULES.find((m) => m.key === key);

/** The access level a role has in a module, or null for none. */
export const accessFor = (role, key) => moduleByKey(key)?.access[role] ?? null;

/** The modules a role can open, in menu order. */
export const modulesFor = (role) => MODULES.filter((m) => m.access[role]);
