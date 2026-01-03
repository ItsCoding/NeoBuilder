import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, CreateDateColumn, JoinColumn } from "typeorm";
import { Workspace } from "./Workspace";
import { MediaAssetTag } from "./MediaAssetTag";

@Entity({ name: "media_tags" })
@Index(["workspace", "name"], { unique: true })
export class MediaTag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.tags, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @OneToMany(() => MediaAssetTag, (mat) => mat.tag)
  assetTags!: MediaAssetTag[];

  @Column({ length: 120 })
  name!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
