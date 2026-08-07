import type { ReactNode } from "react";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: ReactNode;
  description?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  onValueChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  boxClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}
