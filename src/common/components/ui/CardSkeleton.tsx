import React, { useEffect } from "react";
import { View } from "react-native";
import {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  className?: string;
}

const CardSkeleton = ({ className = "" }: SkeletonProps) => {
  const translateX = useSharedValue(-150);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(300, {
        duration: 1200,
      }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
      {
        skewX: "-20deg",
      },
    ],
  }));

  return (
    <View
      className={`overflow-hidden relative bg-slate-100 w-full  mb-2 rounded-xl ${className}`}
    >
      {/* Text skeleton lines */}
      <View className="p-4 gap-3" >
        <View className="h-3 w-3/4 rounded-full bg-slate-200 animate-pulse"  />
        <View className="h-3 w-full rounded-full bg-slate-200 animate-pulse" />
        <View className="h-3 w-1/2 rounded-full bg-slate-200 animate-pulse" />
      </View>

      {/* Horizontal shimmer */}
      {/* <Animated.View
        className="absolute top-0 bottom-0 w-24 bg-white/50"
        style={shimmerStyle}
      /> */}
    </View>
  );
};

export default CardSkeleton;