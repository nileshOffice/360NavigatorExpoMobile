import React from "react";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/app/lib/cn";
import { CheckboxProps } from "./Checkbox.types";

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

const iconSizes = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export default function Checkbox({
  checked,
  defaultChecked = false,
  label,
  description,
  disabled = false,
  onChange,
  onValueChange,
  size = "md",
  className,
  boxClassName,
  labelClassName,
  descriptionClassName,
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState(
    checked ?? defaultChecked
  );

  React.useEffect(() => {
    if (typeof checked === "boolean") {
      setInternalChecked(checked);
    }
  }, [checked]);

  const isChecked = typeof checked === "boolean" ? checked : internalChecked;

  const handlePress = () => {
    if (disabled) return;

    const nextValue = !isChecked;

    if (typeof checked !== "boolean") {
      setInternalChecked(nextValue);
    }

    onChange?.(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled }}
      onPress={handlePress}
      disabled={disabled}
      className={cn("flex-row items-start gap-3", className)}
    >
      <View
        className={cn(
          "items-center justify-center rounded-md border border-border-full bg-white",
          sizeClasses[size],
          isChecked ? "border-primary bg-primary" : "border-border-full",
          disabled && "opacity-60",
          boxClassName
        )}
      >
        {isChecked ? (
          <Text className={cn("font-semibold text-white", iconSizes[size])}>
            ✓
          </Text>
        ) : null}
      </View>

      {(label || description) && (
        <View className="flex-1">
          {label ? (
            typeof label === "string" ? (
              <Text className={cn("text-sm text-text-primary", labelClassName)}>
                {label}
              </Text>
            ) : (
              label
            )
          ) : null}

          {description ? (
            <Text
              className={cn("mt-1 text-xs text-text-secondary", descriptionClassName)}
            >
              {description}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
