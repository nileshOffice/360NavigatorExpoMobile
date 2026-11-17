
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

/** Sheet height as a fraction of the space below the status bar. */
const SHEET_SIZE_FRACTION = {
  small: 0.3,
  dateBottomSheetSize: 0.35,
  medium: 0.45,
  large: 0.75,
  Xlarge: 0.87,
} as const;

/** Height of the library's default drag handle (10 + 4 + 10). */
const HANDLE_HEIGHT = 24;

interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  enableContentPanningGesture?: boolean;
  enablePanDownToClose?: boolean;
  size?: 'small' | 'medium' | 'large' | 'Xlarge' | 'dateBottomSheetSize';
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function AppBottomSheet({
  visible,
  onClose,
  enableContentPanningGesture = true,
  enablePanDownToClose = true,
  size = 'medium',
  title,
  description,
  children,
}: AppBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const wasVisible = useRef(false);
  const insets = useSafeAreaInsets();
  // Full app frame on this device (includes status / navigation bar areas).
  const { height: frameHeight } = useSafeAreaFrame();
  const sizeFraction = SHEET_SIZE_FRACTION[size];

  // Same percentage snap points as before, applied to the space below the
  // status bar (the sheet's container when topInset is set).
  const snapPoints = useMemo(() => [`${Math.round(sizeFraction * 100)}%`], [sizeFraction]);

  // Real visible height of the sheet's content on this device. The content
  // gets this exact height so lists flex inside it and footer buttons stay
  // pinned to the bottom, even when a tree is expanded. Without it the
  // content grew with the list and the button was clipped off the sheet.
  const contentHeight = Math.max(
    0,
    Math.round((frameHeight - insets.top) * sizeFraction) - HANDLE_HEIGHT,
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

  // Android back closes a dismissible sheet instead of acting on the screen
  // underneath (e.g. stepping a wizard back while a picker is still open).
  // Sheets that must not be dismissed keep the default back behaviour.
  useEffect(() => {
    if (!visible || !enablePanDownToClose) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      bottomSheetRef.current?.dismiss();
      return true;
    });

    return () => subscription.remove();
  }, [visible, enablePanDownToClose]);

  const hasHeader = !!title || !!description;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={enablePanDownToClose}
      enableContentPanningGesture={enableContentPanningGesture}
      // Tall sheets stop below the status bar / Dynamic Island.
      topInset={insets.top}
      // Move the sheet with the keyboard so search fields and the
      // Select / Continue buttons stay visible while typing.
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"

      onDismiss={handleDismiss}
      index={0}

      backdropComponent={renderBackdrop}
    >
      <BottomSheetView
        // Explicit device-based height (see contentHeight) instead of flex:1,
        // which the sheet did not constrain. Padding = px-5 pt-2.
        style={{
          height: contentHeight,
          overflow: 'hidden',
          paddingHorizontal: 20,
          paddingTop: 8,
          // Keeps the last button above the home indicator / Android nav bar.
          paddingBottom: insets.bottom + 5,
        }}
      >
        {hasHeader && (
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
        )}

        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

