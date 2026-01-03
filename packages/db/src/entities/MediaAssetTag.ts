import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, CreateDateColumn, Relation } from "typeorm";
import { MediaAsset } from "./MediaAsset";
import { MediaTag } from "./MediaTag";

@Entity({ name: "media_asset_tags" })
@Index(["asset", "tag"], { unique: true })
export class MediaAssetTag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => MediaAsset, (asset) => asset.tagRefs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "asset_id" })
  asset!: Relation<MediaAsset>;

  @ManyToOne(() => MediaTag, (tag) => tag.assetTags, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tag_id" })
  tag!: Relation<MediaTag>;
  
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
