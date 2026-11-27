// Usage: npm run create-admin -- <email> <password> [name]
// Creates an admin, or promotes an existing user to admin.
import { prisma } from "../src/lib/prisma-client.js";
import * as userService from "../src/modules/users/user.service.js";
import { ROLES } from "../src/constants/roles.js";

const [email, password, name = "Admin"] = process.argv.slice(2);
if (!email) {
  console.error("Usage: npm run create-admin -- <email> <password> [name]");
  process.exit(1);
}

try {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { role: ROLES.ADMIN } });
    console.log(`Promoted ${existing.email} to admin.`);
  } else {
    const user = await userService.create({ email, password, name, role: ROLES.ADMIN });
    console.log(`Created admin ${user.email} (id ${user.id}).`);
  }
} catch (err) {
  console.error(err.details ? `${err.message}: ${err.details.join(", ")}` : err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
