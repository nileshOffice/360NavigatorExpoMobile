import { styled } from "nativewind";
import { View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
};

const SafeAreaView = styled(RNSafeAreaView);

  
export default function AuthLayout({ children }: Props) {
  return (
    <SafeAreaView className="flex-1 p-5  bg-background"  edges={['top', 'left', 'right']}>
      <View className="flex-1 ">
        {children}
      </View>
    </SafeAreaView>
   
  );
}