import { ReactNode } from "react";
import { ViewStyle } from "react-native-css/components";

export type ModalPosition = "center" | "bottom";

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;

  position?: ModalPosition;

  title?: string;
  subtitle?: string;

  children: ReactNode;

  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;

  containerStyle?: ViewStyle;

  animationDuration?: number;
}
