import { forwardRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { cn } from "@/src/lib/cn";
import { InputProps } from "@/src/common/components/ui/Input/Input.types";

const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(
  (
    {
      label,
      required,
      onRightIconPress,
      error,
      helperText,
      leftIcon,
      rightIcon,
      loading = false,
      disabled = false,
      editable = true,
      containerClassName,
      inputClassName,
      className,
      onFocus,
      onBlur,
      onPress,
      ...props
      
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);


    const isDisabled = disabled || editable === false;
    // Read-only "select" fields: make the whole field tappable. A
    // non-editable TextInput does not reliably receive presses on Android.
    const isPressableField = !!onPress && editable === false && !disabled;

    return (
      <View className={cn("w-full", containerClassName)}>
        {/* Label */}
        {label && (
          <Text className="mb-2 text-md font-medium text-text-primary">
            {label}
            {required && <Text className="text-error"> *</Text>}
          </Text>
        )}

        {/* Input Wrapper */}
        <Pressable
          disabled={!isPressableField}
          onPress={onPress}
          accessibilityRole={isPressableField ? "button" : undefined}
          accessibilityLabel={isPressableField ? label : undefined}
          className={cn(
            "flex-row items-center rounded-full border border-border-full px-4 h-14 bg-white ",

            focused && "border-primary",

            error && "border-error",

            isDisabled && !isPressableField && "bg-surface opacity-60",

            className
          )}
        >
          {leftIcon && (
            <View className="mr-3">
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={ref}
            editable={!isDisabled}
            style={isPressableField ? { pointerEvents: "none" } : undefined}
            placeholderTextColor="#9CA3AF"
            className={cn(
              "flex-1 text-md text-text-primary items-center h-12 ",
              inputClassName
            )}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />

          {loading ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            rightIcon && (
              <View className="ml-3">
                <Pressable
                  onPress={onRightIconPress}
                  disabled={!onRightIconPress}
                  hitSlop={10}
                  accessibilityRole={onRightIconPress ? "button" : undefined}
                >
                  {rightIcon}
                </Pressable>
              </View>
            )
          )}
        </Pressable>

        {/* Bottom Text */}
        {error ? (
          <Text className="mt-1 text-xs text-error">
            {error}
          </Text>
        ) : helperText ? (
          <Text className="mt-1 text-xs text-text-secondary">
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = "Input";

export default Input;