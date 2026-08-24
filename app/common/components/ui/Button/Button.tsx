import { cn } from "@/app/lib/cn";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ButtonProps } from "./Button.types";

const variants = {
  primary: {
    button: "bg-primary active:opacity-90",
    text: "text-text-white",
    loader: "#FFFFFF",
  },

  secondary: {
    button: "bg-primary-soft border border-primary/10 active:opacity-90",
    text: "text-primary",
    loader: "#2563EB",
  },

  outline: {
    button: "border border-border bg-transparent active:bg-surface",
    text: "text-text-primary",
    loader: "#0F172A",
  },

  ghost: {
    button: "bg-transparent active:bg-surface",
    text: "text-text-primary",
    loader: "#0F172A",
  },

  text: {
    button: "bg-transparent",
    text: "text-primary",
    loader: "#2563EB",
  },

  success: {
    button: "bg-success active:opacity-90",
    text: "text-white",
    loader: "#FFFFFF",
  },

  warning: {
    button: "bg-warning active:opacity-90",
    text: "text-white",
    loader: "#FFFFFF",
  },

  danger: {
    button: "bg-error active:opacity-90",
    text: "text-white",
    loader: "#FFFFFF",
  },

  info: {
    button: "bg-info active:opacity-90",
    text: "text-white",
    loader: "#FFFFFF",
  },

  neutral: {
    button: "bg-surface active:opacity-90",
    text: "text-text-primary",
    loader: "#0F172A",
  },
};

const sizes = {
  xs: "min-h-10 px-3", // 36px
  sm: "min-h-12 px-4", // 40px
  md: "min-h-14 px-5", // 44px (DEFAULT)
  lg: "min-h-16 px-6", // 48px
  xl: "min-h-20 px-7", // 56px
};

const textSizes = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  xxl: "text-2xl"
};

const radius = {
  square: "rounded-none",
  rounded: "rounded-xl",
  pill: "rounded-full",
};

export default function Button({
  children,
  title,
  variant = "primary",
  size = "md",
  textSize = "md",
  shape = "pill",
  leftIcon,
  rightIcon,
  loading,
  disabled,
  fullWidth,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  return (
    <Pressable
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      accessibilityState={{
        disabled,
        busy: loading,
      }}
      className={cn(
        "flex flex-row items-center justify-center gap-2.5 ",
        variants[variant].button,
        sizes[size],
        textSizes[textSize],
        radius[shape],
        fullWidth && "w-full",
        disabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variants[variant].loader} />
      ) : (
        < >
          
          {

        
          
              <View className="flex flex-row items-center gap-1.5" >
                {/* <Text className={cn("tracking-normal leading-none font-sans-semibold font-bold flex flex-row", variants[variant].text, textSizes[size])}>
                  {children}
                </Text> */}
                <View>{children}</View>
                {
                 title
                 &&<View className=""><Text className={cn("tracking-normal leading-none font-sans-semibold font-bold ", variants[variant].text, textSizes[size])}>{title}</Text></View>}
                
              </View>
             
          }
         
        </>
      )}
    </Pressable>
  );
}