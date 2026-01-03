import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, Relation } from "typeorm";
import { MediaAsset } from "./MediaAsset";

@Entity({ name: "media_variants" })
@Index(["asset", "variantType", "format"], { unique: true })
export class MediaVariant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => MediaAsset, (asset) => asset.variants, { onDelete: "CASCADE" })
  @JoinColumn({ name: "asset_id" })
  asset!: Relation<MediaAsset>;

  @Column({ name: "variant_type", length: 60 })
  variantType!: string;

  @Column({ length: 20 })
  format!: string;

  @Column({ name: "storage_key", length: 500 })
  storageKey!: string;

  @Column({ type: "int", nullable: true })
  width?: number | null;

  @Column({ type: "int", nullable: true })
  height?: number | null;

  @Column({ name: "size_bytes", type: "bigint", default: 0 })
  sizeBytes!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
