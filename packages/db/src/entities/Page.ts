import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Relation,
} from "typeorm";
import { Workspace } from "./Workspace";
import { PageVersion } from "./PageVersion";

export type PageStatus = "draft" | "scheduled" | "published";

@Entity({ name: "pages" })
@Index(["workspace", "slug"], { unique: true })
export class Page {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.pages, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Relation<Workspace>;

  @Column()
  title!: string;

  @Column()
  slug!: string;

  @Column({ type: "varchar", length: 20, default: "draft" })
  status!: PageStatus;

  @Column({ name: "scheduled_publish_at", type: "timestamptz", nullable: true })
  scheduledPublishAt?: Date | null;

  @Column({ name: "scheduled_unpublish_at", type: "timestamptz", nullable: true })
  scheduledUnpublishAt?: Date | null;

  @Column({ name: "published_content", type: "jsonb", nullable: true })
  publishedContent?: unknown;

  @Column({ name: "draft_content", type: "jsonb", nullable: true })
  draftContent?: unknown;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => PageVersion, (version) => version.page)
  versions!: Relation<PageVersion[]>;
}