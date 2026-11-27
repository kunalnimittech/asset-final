import { ROLES } from "../../constants/roles.js";

// In-memory data so the API works without a database.
// Swap this file for a real DB layer later; the service won't need to change much.
let nextId = 4;

export const users = [
  { id: "1", name: "Admin", email: "admin@example.com", role: ROLES.ADMIN },
  { id: "2", name: "Manager", email: "manager@example.com", role: ROLES.MANAGER },
  { id: "3", name: "Normal User", email: "user@example.com", role: ROLES.USER },
];

export const newId = () => String(nextId++);
