import { ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  pressable?: boolean;
  onPress?: () => void;
}