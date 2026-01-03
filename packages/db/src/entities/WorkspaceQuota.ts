import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Workspace } from "./Workspace";

@Entity({ name: "workspace_quotas" })
export class WorkspaceQuota {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.quotas, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @Column({ name: "storage_limit_mb", type: "int", default: 2048 })
  storageLimitMb!: number;

  @Column({ name: "api_rate_limit", type: "int", default: 1000 })
  apiRateLimit!: number;
}
