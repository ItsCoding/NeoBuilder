import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Workspace } from "./Workspace";
import { MediaFolder } from "./MediaFolder";
import { MediaVariant } from "./MediaVariant";
import { MediaAssetTag } from "./MediaAssetTag";

export type MediaStatus = "uploading" | "ready" | "failed";

@Entity({ name: "media_assets" })
@Index(["workspace", "folder"])
export class MediaAsset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.assets, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @ManyToOne(() => MediaFolder, (folder) => folder.assets, { nullable: true })
  @JoinColumn({ name: "folder_id" })
  folder?: MediaFolder | null;

  @OneToMany(() => MediaVariant, (variant: MediaVariant) => variant.asset, { cascade: true })
  variants!: MediaVariant[];

  @OneToMany(() => MediaAssetTag, (mat: MediaAssetTag) => mat.asset, { cascade: true })
  tagRefs!: MediaAssetTag[];

  @Column({ name: "file_name", length: 255 })
  fileName!: string;

  @Column({ name: "storage_key", length: 500, unique: true })
  storageKey!: string;

  @Column({ name: "mime", length: 120 })
  mime!: string;

  @Column({ name: "size_bytes", type: "bigint", default: 0 })
  sizeBytes!: number;

  @Column({ type: "int", nullable: true })
  width?: number | null;

  @Column({ type: "int", nullable: true })
  height?: number | null;

  @Column({ name: "duration_ms", type: "int", nullable: true })
  durationMs?: number | null;

  @Column({ type: "text", nullable: true })
  alt?: string | null;

  @Column({ type: "varchar", length: 20, default: "uploading" })
  status!: MediaStatus;

  @Column({ name: "usage_count", type: "int", default: 0 })
  usageCount!: number;

  @Column({ name: "last_used_at", type: "timestamptz", nullable: true })
  lastUsedAt?: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
