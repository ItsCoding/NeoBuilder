import type { ReactElement } from "react";

export type BlockDefinition<TName extends string = string> = {
  type: TName;
  label: string;
  description?: string;
  category?: string;
  defaultProps?: Record<string, unknown>;
};

export type EditorTemplate = {
  id: string;
  name: string;
  description: string;
  category?: string;
  render: () => ReactElement;
};
