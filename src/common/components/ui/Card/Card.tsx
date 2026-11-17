import clsx from "clsx";
import { Pressable, StyleSheet, View } from "react-native";
import { CardProps } from "./Card.types";

const BASE_CLASSES = "rounded-xl p-4 shadow-sm! border border-border-light";

const Card = ({
  children,
  className,
  pressable = false,
  onPress,
  style,
  accessibilityLabel,
  ...props
}: CardProps) => {
  // Merge (not replace) caller styles: passing `style` used to drop the
  // card background and elevation entirely.
  const mergedStyle = [styles.appCard, style];

  if (pressable) {
    return (
      <Pressable
        {...props}
        style={mergedStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={clsx(BASE_CLASSES, className)}
        android_ripple={{ color: "rgba(37, 99, 235, 0.08)", borderless: false }}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      {...props}
      style={mergedStyle}
      accessibilityLabel={accessibilityLabel}
      className={clsx(BASE_CLASSES, className)}
    >
      {children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  appCard: {
    backgroundColor: "#FFFFFF",

    // Android shadow. 10 was very heavy and expensive inside long lists.
    elevation: 3,

    // iOS shadow
    shadowColor: "rgba(15, 23, 42, 0.20)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});
