export type Role = "admin" | "editor" | "viewer";

export type Resource =
  | "page"
  | "media"
  | "database"
  | "comment"
  | "site"
  | "settings"
  | "user";

export type Action = "create" | "read" | "update" | "delete" | "publish";

export interface Permission {
  resource: Resource;
  actions: Action[];
}

const roleMatrix: Record<Role, Permission[]> = {
  admin: [
    { resource: "page", actions: ["create", "read", "update", "delete", "publish"] },
    { resource: "media", actions: ["create", "read", "update", "delete"] },
    { resource: "database", actions: ["create", "read", "update", "delete", "publish"] },
    { resource: "comment", actions: ["create", "read", "update", "delete"] },
    { resource: "site", actions: ["create", "read", "update", "delete", "publish"] },
    { resource: "settings", actions: ["create", "read", "update", "delete"] },
    { resource: "user", actions: ["create", "read", "update", "delete"] },
  ],
  editor: [
    { resource: "page", actions: ["create", "read", "update", "publish"] },
    { resource: "media", actions: ["create", "read", "update"] },
    { resource: "comment", actions: ["create", "read", "update"] },
    { resource: "database", actions: ["create", "read", "update"] },
  ],
  viewer: [
    { resource: "page", actions: ["read"] },
    { resource: "media", actions: ["read"] },
    { resource: "comment", actions: ["read"] },
  ],
};

export const can = (role: Role, action: Action, resource: Resource): boolean => {
  const permissions = roleMatrix[role];
  return permissions.some((permission) =>
    permission.resource === resource ? permission.actions.includes(action) : false,
  );
};

export const assertPermission = (role: Role, action: Action, resource: Resource) => {
  if (!can(role, action, resource)) {
    throw new Error(`Forbidden: ${role} cannot ${action} ${resource}`);
  }
};
