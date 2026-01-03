import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "roles" })
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column("jsonb", { name: "permissions_json" })
  permissions!: Record<string, string[]>;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
