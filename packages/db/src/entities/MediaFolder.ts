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
  Relation,
} from "typeorm";
import { Workspace } from "./Workspace";
import { MediaAsset } from "./MediaAsset";

@Entity({ name: "media_folders" })
@Index(["workspace", "parent", "name"], { unique: true })
export class MediaFolder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.folders, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Relation<Workspace>;

  @ManyToOne(() => MediaFolder, (folder) => folder.children, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent?: Relation<MediaFolder> | null;

  @OneToMany(() => MediaFolder, (folder) => folder.parent)
  children!: Relation<MediaFolder>[];

  @OneToMany(() => MediaAsset, (asset) => asset.folder)
  assets!: Relation<MediaAsset>[];

  @Column({ length: 180 })
  name!: string;

  @Column({ length: 500 })
  path!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
