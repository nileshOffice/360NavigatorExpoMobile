import React from "react";
import { Text } from "react-native";

import { cn } from "@/src/lib/cn";



import {
    fontWeights,
    typographyVariants,
} from "@/src/common/components/ui/Typography/typography.styles";
import { TypographyProps } from "@/src/common/components/ui/Typography/Typography.types";

export default function Typography({
  children,

  variant = "body",

  weight,

  color,

  center,

  className,

  style,

  ...props
}: TypographyProps) {
  return (
    <Text
      {...props}
      style={[
        color && { color },
        style,
      ]}
      className={cn(
        "text-text-primary",

        typographyVariants[variant],

        weight && fontWeights[weight],

        center && "text-center",

        className
      )}
    >
      {children}
    </Text>
  );
}