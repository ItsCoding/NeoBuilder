import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
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
  members!: WorkspaceMember[];

  @OneToMany(() => WorkspaceQuota, (quota) => quota.workspace)
  quotas!: WorkspaceQuota[];

  @OneToMany(() => Page, (page) => page.workspace)
  pages!: Page[];

  @OneToMany(() => GlobalSection, (section) => section.workspace)
  sections!: GlobalSection[];

  @OneToMany(() => PageTemplate, (template) => template.workspace)
  templates!: PageTemplate[];

  @OneToMany(() => MediaFolder, (folder) => folder.workspace)
  folders!: MediaFolder[];

  @OneToMany(() => MediaAsset, (asset) => asset.workspace)
  assets!: MediaAsset[];

  @OneToMany(() => MediaTag, (tag) => tag.workspace)
  tags!: MediaTag[];
}
