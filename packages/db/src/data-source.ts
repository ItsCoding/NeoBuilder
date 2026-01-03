import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Workspace } from "./entities/Workspace";
import { WorkspaceMember } from "./entities/WorkspaceMember";
import { Role } from "./entities/Role";
import { WorkspaceQuota } from "./entities/WorkspaceQuota";
import { Page } from "./entities/Page";
import { PageVersion } from "./entities/PageVersion";
import { GlobalSection } from "./entities/GlobalSection";
import { PageTemplate } from "./entities/PageTemplate";
import { MediaFolder } from "./entities/MediaFolder";
import { MediaAsset } from "./entities/MediaAsset";
import { MediaTag } from "./entities/MediaTag";
import { MediaVariant } from "./entities/MediaVariant";
import { MediaAssetTag } from "./entities/MediaAssetTag";
import { readAdminEnv } from "@neobuilder/core";

let dataSource: DataSource | null = null;
let dsPromise: Promise<DataSource> | null = null;
function createDataSource() {
  const env = readAdminEnv();
  return new DataSource({
    type: "postgres",
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT),
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    synchronize: true,
    migrationsRun: false,
    logging: false,
    entities: [
      User,
      Workspace,
      WorkspaceMember,
      Role,
      WorkspaceQuota,
      Page,
      PageVersion,
      GlobalSection,
      PageTemplate,
      MediaFolder,
      MediaAsset,
      MediaTag,
      MediaVariant,
      MediaAssetTag,
    ],
  });
}


export const getDataSource = async (): Promise<DataSource> => {
  if (dataSource) return dataSource;
  if (!dsPromise) {
    const ds = createDataSource();
    dsPromise = ds.initialize().then((initializedDs) => {
      dataSource = initializedDs;
      return initializedDs;
    });
  }
  return dsPromise!;
};