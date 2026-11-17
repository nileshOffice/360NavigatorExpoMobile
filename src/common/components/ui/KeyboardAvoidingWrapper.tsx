import { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KeyboardAvoidingWrapperProps {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  /**
   * Height of everything above this wrapper on screen (safe area, header,
   * padding). KeyboardAvoidingView measures itself relative to its parent,
   * so without it the keyboard still covers the bottom of the content.
   * Defaults to the top safe-area inset. iOS only.
   */
  keyboardVerticalOffset?: number;
}

const KeyboardAvoidingWrapper = ({
  children,
  contentContainerStyle,
  keyboardVerticalOffset,
}: KeyboardAvoidingWrapperProps) => {
  const insets = useSafeAreaInsets();
  const iosOffset = keyboardVerticalOffset ?? insets.top;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // Android 15+ is edge-to-edge, so the window no longer resizes for the
      // keyboard; "padding" works on both platforms. The old fixed 100px
      // Android offset left a large gap above the keyboard.
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? iosOffset : 0}
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