import { ReactNode } from "react";
import { TextInputProps } from "react-native";

export type InputVariant = "outline" | "filled" | "underlined";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
leftIcon?: ReactNode;
rightIcon?: ReactNode;
  variant?: InputVariant;
  size?: InputSize;

  leftElement?: ReactNode;
  rightElement?: ReactNode;

  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;

  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}