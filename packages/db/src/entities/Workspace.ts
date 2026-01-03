import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Relation } from "typeorm";
import { WorkspaceMember } from "./WorkspaceMember";
import { WorkspaceQuota } from "./WorkspaceQuota";
import { Page } from "./Page";
import { GlobalSection } from "./GlobalSection";
import { PageTemplate } from "./PageTemplate";
import { MediaFolder } from "./MediaFolder";
import { MediaAsset } from "./MediaAsset";
import { MediaTag } from "./MediaTag";

@Entity({ name: "workspaces" })
export class Workspace {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => WorkspaceMember, (member) => member.workspace)
  members!: Relation<WorkspaceMember[]>;

  @OneToMany(() => WorkspaceQuota, (quota) => quota.workspace)
  quotas!: Relation<WorkspaceQuota[]>;
  @OneToMany(() => Page, (page) => page.workspace)
  pages!: Relation<Page[]>;

  @OneToMany(() => GlobalSection, (section) => section.workspace)
  sections!: Relation<GlobalSection[]>;

  @OneToMany(() => PageTemplate, (template) => template.workspace)
  templates!: Relation<PageTemplate[]>;

  @OneToMany(() => MediaFolder, (folder) => folder.workspace)
  folders!: Relation<MediaFolder[]>;

  @OneToMany(() => MediaAsset, (asset) => asset.workspace)
  assets!: Relation<MediaAsset[]>;

  @OneToMany(() => MediaTag, (tag) => tag.workspace)
  tags!: Relation<MediaTag[]>;
}
