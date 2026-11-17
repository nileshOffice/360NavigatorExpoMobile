import Header from "@/src/common/components/app_components/Header";
import Sidebar from "@/src/common/components/ui/Sidebar";
import { styled } from "nativewind";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      {/*
        Android 15+ is always edge-to-edge, so the bottom inset is required or
        the wizard buttons end up underneath the system navigation bar.
      */}
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top", "left", "right", "bottom"]}
      >
        <Header setSidebarOpen={setSidebarOpen} />

        <View className="flex-1 px-5 py-3">{children}</View>
      </SafeAreaView>

      <Sidebar visible={sidebarOpen} onClose={closeSidebar} />
    </>
  );
}
