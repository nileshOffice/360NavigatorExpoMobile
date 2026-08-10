
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large';
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function AppBottomSheet({
  visible,
  onClose,
  size = 'medium',
  title,
  description,
  children,
}: AppBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const wasVisible = useRef(false);
  const snapPoints = useMemo(
    () => ({ small: ['30%'], medium: ['50%'], large: ['75%'] })[size],
    [size]
  );
  const renderBackdrop = useCallback(
    (backdropProps: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    []
  );
  const handleDismiss = useCallback(() => {
    wasVisible.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      const presentationFrame = requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });

      wasVisible.current = true;
      return () => cancelAnimationFrame(presentationFrame);
    }

    if (!visible && wasVisible.current) {
      bottomSheetRef.current?.dismiss();
      wasVisible.current = false;
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView className="px-5 pb-8 pt-2">
        <View className="mb-5">
          {title && (
            <Text className="text-xl font-bold text-text-primary">
              {title}
            </Text>
          )}

          {description && (
            <Text className="mt-1 text-sm text-text-secondary">
              {description}
            </Text>
          )}
        </View>

        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

