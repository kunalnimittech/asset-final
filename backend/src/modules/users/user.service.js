import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma-client.js";
import { auth } from "../../lib/auth.js";
import { ApiError } from "../../utils/ApiError.js";
import { ALL_ROLES, DEFAULT_ROLE } from "../../constants/roles.js";

// Never return session/account rows (they hold tokens and password hashes).
const publicFields = {
  id: true, name: true, email: true, emailVerified: true, image: true, role: true, createdAt: true, updatedAt: true,
};

const MIN_PASSWORD = 8;

export const findAll = () => prisma.user.findMany({ select: publicFields, orderBy: { createdAt: "asc" } });

export async function getById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicFields });
  if (!user) throw ApiError.notFound(`User ${id} not found`);
  return user;
}

function validate({ name, email, role, password }, { partial = false } = {}) {
  const errors = [];
  if (!partial || name !== undefined) {
    if (typeof name !== "string" || !name.trim()) errors.push("name is required");
  }
  if (!partial || email !== undefined) {
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) errors.push("valid email is required");
  }
  if (!partial && (typeof password !== "string" || password.length < MIN_PASSWORD)) {
    errors.push(`password must be at least ${MIN_PASSWORD} characters`);
  }
  if (role !== undefined && !ALL_ROLES.includes(role)) {
    errors.push(`role must be one of: ${ALL_ROLES.join(", ")}`);
  }
  if (errors.length) throw ApiError.badRequest("Validation failed", errors);
}

async function assertEmailFree(email, exceptId) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing && existing.id !== exceptId) throw ApiError.conflict("Email already in use");
}

// Creates a user who can sign in with email + password (same format better-auth uses).
export async function create(data = {}) {
  validate(data);
  const email = data.email.toLowerCase();
  await assertEmailFree(email);

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(data.password);
  const id = randomUUID();

  return prisma.user.create({
    data: {
      id,
      name: data.name.trim(),
      email,
      role: data.role ?? DEFAULT_ROLE,
      accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: hash } },
    },
    select: publicFields,
  });
}

export async function update(id, data = {}, currentUserId) {
  const current = await getById(id);
  validate(data, { partial: true });
  // An admin can't take away their own admin role (it would lock them out).
  if (id === currentUserId && data.role !== undefined && data.role !== current.role) {
    throw ApiError.badRequest("You can't change your own role");
  }
  const email = data.email?.toLowerCase();
  if (email) await assertEmailFree(email, id);

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(email !== undefined && { email }),
      ...(data.role !== undefined && { role: data.role }),
    },
    select: publicFields,
  });
}

export async function remove(id, currentUserId) {
  if (id === currentUserId) throw ApiError.badRequest("You can't delete your own account");
  await getById(id);
  await prisma.user.delete({ where: { id } }); // sessions/accounts cascade
}
