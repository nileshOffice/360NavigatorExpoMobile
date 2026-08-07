import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <SafeAreaView className="flex-1  px-6">
      {/* Header */}

      {/* Sidebar */}

      <View className="flex-1">
        {children}
      </View>

      {/* Bottom Navigation */}
    </SafeAreaView>
  );
}