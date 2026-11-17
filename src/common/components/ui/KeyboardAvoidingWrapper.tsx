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
      // Android 15+ is edge-to-edge, so the window no longer resizes for the
      // keyboard; "padding" works on both platforms. The old fixed 100px
      // Android offset left a large gap above the keyboard.
      behavior="padding"
      keyboardVerticalOffset={0}
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