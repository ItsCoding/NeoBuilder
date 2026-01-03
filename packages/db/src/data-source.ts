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

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
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
