import { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    ViewStyle,
} from "react-native";

interface KeyboardAvoidingWrapperProps {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
}

const KeyboardAvoidingWrapper = ({
  children,
  contentContainerStyle,
}: KeyboardAvoidingWrapperProps) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode={
          Platform.OS === "ios" ? "interactive" : "on-drag"
        }
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default KeyboardAvoidingWrapper;