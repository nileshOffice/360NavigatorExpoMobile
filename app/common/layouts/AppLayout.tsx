import { styled } from "nativewind";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Header from "../components/app_components/Header";
import Sidebar from "../components/ui/Sidebar";
 
const SafeAreaView = styled(RNSafeAreaView);

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <>
      {/* Header */}
     
      <SafeAreaView className="flex-1  bg-background">
      <Header   setSidebarOpen={setSidebarOpen}  />
        {/*  */}
        {/**/}

        {/* Sidebar */}

        <View className="flex-1 p-5">
          {children}
        </View>

        {/* Bottom Navigation */}
      </SafeAreaView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        // onProfilePress={() => {
        //   setSidebarOpen(false);
        //   router.push('/common/profile');
        // }}
        // onSiteChangePress={() => {
        //   setSidebarOpen(false);
        //   router.push('/common/site-selection');
        // }}
        // onLogoutPress={() => {
        //   setSidebarOpen(false);
        //   handleLogout();
        // }}
  />
    </>
  );
}