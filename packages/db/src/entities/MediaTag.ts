import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, CreateDateColumn, JoinColumn, Relation } from "typeorm";
import { Workspace } from "./Workspace";
import { MediaAssetTag } from "./MediaAssetTag";

@Entity({ name: "media_tags" })
@Index(["workspace", "name"], { unique: true })
export class MediaTag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.tags, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Relation<Workspace>;

  @OneToMany(() => MediaAssetTag, (mat) => mat.tag)
  assetTags!: Relation<MediaAssetTag[]>;

  @Column({ length: 120 })
  name!: string;
  

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
