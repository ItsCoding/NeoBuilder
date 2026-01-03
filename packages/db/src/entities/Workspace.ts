import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { WorkspaceMember } from "./WorkspaceMember";
import { WorkspaceQuota } from "./WorkspaceQuota";
import { Page } from "./Page";

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
}
