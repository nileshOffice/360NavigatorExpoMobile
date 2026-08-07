import { View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <View className="flex-1  justify-center">
      {children}
    </View>
  );
}