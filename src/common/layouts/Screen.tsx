import { View } from "react-native";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Plain full-height container used by every screen. */
export default function Screen({ children, className = "" }: Props) {
  return <View className={`flex-1 ${className}`}>{children}</View>;
}
