import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Page } from "./Page";

@Entity({ name: "page_versions" })
@Index(["page", "version"], { unique: true })
export class PageVersion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Page, (page) => page.versions, { eager: true })
  @JoinColumn({ name: "page_id" })
  page!: Page;

  @Column({ type: "int" })
  version!: number;

  @Column({ name: "snapshot_json", type: "jsonb" })
  snapshotJson!: unknown;

  @Column({ name: "created_by", nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}