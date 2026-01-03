import "reflect-metadata";

/**
 * Ensure a single DataSource instance is shared across renders.
 */
export async function getDataSource() {
  const { AppDataSource } = await import("@neobuilder/db");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}
