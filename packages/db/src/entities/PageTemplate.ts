import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from "typeorm";
import { Workspace } from "./Workspace";

@Entity({ name: "page_templates" })
export class PageTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.templates, { eager: true, nullable: true })
  @JoinColumn({ name: "workspace_id" })
  workspace?: Relation<Workspace> | null;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 120 })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", name: "cover_url", nullable: true })
  coverUrl?: string | null;

  @Column({ type: "varchar", name: "category", length: 60, default: "General" })
  category!: string;

  @Column({ name: "is_system", default: false })
  isSystem!: boolean;

  @Column({ name: "document_json", type: "jsonb" })
  documentJson!: unknown;

  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt!: Date;
}
