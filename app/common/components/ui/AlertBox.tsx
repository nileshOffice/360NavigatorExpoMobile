import AppIcon from "@/app/common/components/ui/AppIcon";
import React from "react";
import { Pressable, Text, View } from "react-native";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertBoxProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
}

const alertConfig = {
  success: {
    icon: "check-circle",
    container: "bg-green-50 border-green-200",
    iconColor: "#16A34A",
    titleColor: "text-green-800",
    messageColor: "text-green-700",
  },

  error: {
    icon: "close-circle",
    container: "bg-red-50 border-red-200",
    iconColor: "#DC2626",
    titleColor: "text-red-800",
    messageColor: "text-red-700",
  },

  warning: {
    icon: "warning",
    container: "bg-orange-50 border-orange-200",
    iconColor: "#EA580C",
    titleColor: "text-orange-800",
    messageColor: "text-orange-700",
  },

  info: {
    icon: "information-circle",
    container: "bg-blue-50 border-blue-200",
    iconColor: "#2563EB",
    titleColor: "text-blue-800",
    messageColor: "text-blue-700",
  },
};

export const AlertBox = ({
  type = "info",
  title,
  message,
  onClose,
}: AlertBoxProps) => {
  const config = alertConfig[type];

  return (
    <View
      className={`mx-4 flex-row items-start rounded-xl border px-4 py-3 ${config.container}`}
    >
      {/* Icon */}
      <View className="mr-3 pt-0.5">
        <AppIcon
          family="Ionicons"
          name={config.icon}
          size={22}
          color={config.iconColor}
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        {title && (
          <Text
            className={`text-sm font-semibold ${config.titleColor}`}
          >
            {title}
          </Text>
        )}

        <Text
          className={`text-sm leading-5 ${title ? "mt-0.5" : ""} ${
            config.messageColor
          }`}
        >
          {message}
        </Text>
      </View>

      {/* Close */}
      {onClose && (
        <Pressable
          onPress={onClose}
          hitSlop={10}
          className="ml-2 p-1"
        >
          <AppIcon
            family="Ionicons"
            name="close"
            size={18}
            color={config.iconColor}
          />
        </Pressable>
      )}
    </View>
  );
};