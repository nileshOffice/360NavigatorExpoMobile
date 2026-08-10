import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../components/ui/AppIcon";
import { AppText } from "../components/ui/Typography";

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <SafeAreaView className="flex-1  px-6">
      {/* Header */}
      <View className="mt-10 mb-6">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center">
              <AppIcon family="Feather" name="user" size={20} color="#000000" />
              <AppText className="ml-2 text-lg font-semibold text-text-primary">
                User Profile
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Sidebar */}

      <View className="flex-1">
        {children}
      </View>

      {/* Bottom Navigation */}
    </SafeAreaView>
  );
}