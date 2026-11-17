
import AppIcon from "@/src/common/components/ui/AppIcon";
import { AppText } from "@/src/common/components/ui/Typography";
import React, { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Animated,
    Pressable,
    View,
} from "react-native";

export type ToastType = "success" | "danger" | "warning";

export interface ToastProps {
  visible: boolean;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: "checkmark-circle-outline",
    iconColor: "#16A34A",
    iconBackground: "#DCFCE7",
    titleColor: "#166534",
    messageColor: "#166534",
    background: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  danger: {
    icon: "close-circle-outline",
    iconColor: "#DC2626",
    iconBackground: "#FEE2E2",
    titleColor: "#991B1B",
    messageColor: "#991B1B",
    background: "#FEF2F2",
    borderColor: "#FECACA",
  },
  warning: {
    icon: "warning-outline",
    iconColor: "#D97706",
    iconBackground: "#FEF3C7",
    titleColor: "#92400E",
    messageColor: "#92400E",
    background: "#FFFBEB",
    borderColor: "#FDE68A",
  },
};

const defaultTitles: Record<ToastType, string> = {
  success: "Success",
  danger: "Error",
  warning: "Warning",
};

const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  // Keeps the toast mounted while the hide animation runs. Replaces reading
  // the private Animated `__getValue()` during render.
  const [isMounted, setIsMounted] = useState(visible);

  const config = toastConfig[type];

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const animateOut = (onDone?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onDone?.();
      }
    });
  };

  const handleClose = () => {
    clearTimer();
    animateOut(onClose);
  };

  useEffect(() => {
    clearTimer();

    if (visible) {
      setIsMounted(true);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        timerRef.current = setTimeout(handleClose, duration);
      }
    } else {
      animateOut(() => setIsMounted(false));
    }

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration, message, title, type]);

  if (!isMounted) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? "box-none" : "none"}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="absolute left-4 right-4 z-9999"
      style={{
        top: insets.top + 12,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        className="flex-row items-center rounded-2xl border px-3 py-3 shadow-lg"
        style={{
          backgroundColor: config.background,
          borderColor: config.borderColor,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.10,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: config.iconBackground,
          }}
        >
          <AppIcon
            family="Ionicons"
            name={config.icon}
            size={22}
            color={config.iconColor}
          />
        </View>

        <View className="flex-1 pr-2">
          <AppText
            variant="bodySmall"
            weight="bold"
            className="text-sm"
            style={{ color: config.titleColor }}
          >
            {title || defaultTitles[type]}
          </AppText>

          <AppText
            variant="bodySmall"
            className="mt-0.5"
            style={{ color: config.messageColor }}
            numberOfLines={3}
          >
            {message}
          </AppText>
        </View>

        <Pressable
          onPress={handleClose}
          hitSlop={10}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <AppIcon
            family="Ionicons"
            name="close"
            size={18}
            color={config.iconColor}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default Toast;