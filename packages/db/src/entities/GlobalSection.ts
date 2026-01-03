import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Workspace } from "./Workspace";

export type GlobalSectionStatus = "draft" | "published";

@Entity({ name: "global_sections" })
@Index(["workspace", "key"], { unique: true })
export class GlobalSection {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.sections, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 120 })
  key!: string;

  @Column({ type: "varchar", length: 20, default: "draft" })
  status!: GlobalSectionStatus;

  @Column({ name: "draft_content", type: "jsonb", nullable: true })
  draftContent?: unknown;

  @Column({ name: "published_content", type: "jsonb", nullable: true })
  publishedContent?: unknown;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
