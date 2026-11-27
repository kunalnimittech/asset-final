import app from "./app.js";
import { env } from "./config/env.js";

async function startServer() {
  app.listen(env.port, () => {
    console.log(`Server is running on port http://localhost:${env.port}`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
