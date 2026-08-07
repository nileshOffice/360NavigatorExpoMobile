import { ReactNode } from "react";
import { PressableProps } from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "text"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export type ButtonShape =
  | "rounded"
  | "pill"
  | "square";
  




export interface ButtonProps extends PressableProps {
  children?:ReactNode
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  textSize?:ButtonSize,
  shape?: ButtonShape;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?:string;
}

