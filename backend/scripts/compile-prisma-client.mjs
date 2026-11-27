// Compile the Prisma-generated client (TypeScript) to plain JavaScript in place.
//
// Prisma 7's `prisma-client` generator only emits .ts files. Locally, recent Node
// can run them directly, but serverless platforms (Vercel) and older Node cannot.
// So after `prisma generate` we transpile every generated .ts file to a .js file
// beside it; the schema sets importFileExtension = "js", so the files import
// each other by their .js names and the app imports generated/prisma/client.js.
//
// Runs from `npm run db:generate`, which `postinstall` and `build` call.
import { build } from "esbuild";
import { existsSync } from "node:fs";

const dir = "generated/prisma";
if (!existsSync(dir)) {
  console.error(`[compile-prisma-client] ${dir} not found — run "prisma generate" first.`);
  process.exit(1);
}

await build({
  entryPoints: [`${dir}/**/*.ts`],
  outdir: dir,
  outbase: dir,
  bundle: false,
  format: "esm",
  platform: "node",
  target: "node20",
  logLevel: "warning",
});

console.log("[compile-prisma-client] generated/prisma compiled to JavaScript");
