import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Workspace } from "./Workspace";
import { Role } from "./Role";

@Entity({ name: "workspace_members" })
export class WorkspaceMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.memberships, { eager: true })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.members, { eager: true })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @Column({ name: "invited_by", nullable: true })
  invitedBy?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
