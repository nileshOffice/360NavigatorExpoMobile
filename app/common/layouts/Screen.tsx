import { styled } from "nativewind";
import { ScrollView } from "react-native";
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
      <SafeAreaView className={`flex-1 bg-background ${className}`}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1  bg-background ${className}`}>
      {children}
    </SafeAreaView>
  );
}