import app from "./app";
import { configService } from "./config";
import prisma from "./db/prisma";
import { logger } from "./utils/logger";

const port = configService.get("PORT", 9000);

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connection established");

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to connect to the database:", error as Error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
