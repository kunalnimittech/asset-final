import { ApiError } from "../../utils/ApiError.js";
import { ALL_ROLES, ROLES } from "../../constants/roles.js";
import { users, newId } from "./user.store.js";

export const findAll = () => users;

export const findById = (id) => users.find((u) => u.id === id);

export function getById(id) {
  const user = findById(id);
  if (!user) throw ApiError.notFound(`User ${id} not found`);
  return user;
}

function validate({ name, email, role }, { partial = false } = {}) {
  const errors = [];
  if (!partial || name !== undefined) {
    if (typeof name !== "string" || !name.trim()) errors.push("name is required");
  }
  if (!partial || email !== undefined) {
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) errors.push("valid email is required");
  }
  if (role !== undefined && !ALL_ROLES.includes(role)) {
    errors.push(`role must be one of: ${ALL_ROLES.join(", ")}`);
  }
  if (errors.length) throw ApiError.badRequest("Validation failed", errors);
}

function assertEmailFree(email, exceptId) {
  if (users.some((u) => u.email === email && u.id !== exceptId)) {
    throw ApiError.conflict("Email already in use");
  }
}

export function create(data = {}) {
  validate(data);
  assertEmailFree(data.email);
  const user = { id: newId(), name: data.name.trim(), email: data.email, role: data.role ?? ROLES.USER };
  users.push(user);
  return user;
}

export function update(id, data = {}) {
  const user = getById(id);
  validate(data, { partial: true });
  if (data.email) assertEmailFree(data.email, id);
  if (data.name !== undefined) user.name = data.name.trim();
  if (data.email !== undefined) user.email = data.email;
  if (data.role !== undefined) user.role = data.role;
  return user;
}

export function remove(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw ApiError.notFound(`User ${id} not found`);
  users.splice(index, 1);
}
