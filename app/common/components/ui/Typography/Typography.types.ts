import { TextProps } from "react-native";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "bodyLarge"
  | "bodySmall"
  | "label"
  | "caption"
  | "overline";

export type FontWeight =
  | "regular"
  | "medium"
  | "semibold"
  | "bold";

export interface TypographyProps extends TextProps {
  children: React.ReactNode;

  variant?: TypographyVariant;

  weight?: FontWeight;

  color?: string;

  center?: boolean;

  className?: string;
}