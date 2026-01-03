import { assertPermission, type Action, type Resource, type Role } from "@neobuilder/core";

export const requirePermission = (role: Role, action: Action, resource: Resource) => {
  assertPermission(role, action, resource);
};
