import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Workspace } from "./Workspace";

@Entity({ name: "page_templates" })
export class PageTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.templates, { eager: true, nullable: true })
  @JoinColumn({ name: "workspace_id" })
  workspace?: Workspace | null;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 120 })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "cover_url", nullable: true })
  coverUrl?: string | null;

  @Column({ name: "category", length: 60, default: "General" })
  category!: string;

  @Column({ name: "is_system", default: false })
  isSystem!: boolean;

  @Column({ name: "document_json", type: "jsonb" })
  documentJson!: unknown;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
