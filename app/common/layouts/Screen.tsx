import { styled } from "nativewind";
import { View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
};

export default function Screen({
  children,
  scroll = false,
  className = "",
}: Props) {
  if (scroll) {
    return (
      
    <View className={`flex-1   ${className}`}>
         {children}
    </View>
    );
  }

  return (
    <View className={`flex-1  ${className}`}>
        {children}
    </View>
  );
}