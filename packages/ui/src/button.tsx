import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  asChild?: boolean;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ asChild, children, variant = "primary", className, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};
