import React, { forwardRef, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    View,
} from "react-native";

import { cn } from "@/app/lib/cn";
import { InputProps } from "./Input.types";

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      required,
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
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);


    const isDisabled = disabled || editable === false;

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
        <View
          className={cn(
            "flex-row items-center rounded-full border border-border-full px-4 h-14 bg-white ",

            focused && "border-primary",

            error && "border-error",

            isDisabled && "bg-surface-muted opacity-60",

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
            placeholderTextColor="#9CA3AF"
            className={cn(
              "flex-1 text-md text-text-primary items-center ",
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
            rightIcon && <View className="ml-3">{rightIcon}</View>
          )}
        </View>

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