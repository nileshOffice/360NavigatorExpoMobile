import { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import AppIcon from '@/src/common/components/ui/AppIcon';

import AppText from '@/src/common/components/ui/Typography/AppText';
import {
    AppModalProps
} from '@/src/common/components/ui/AppModal/AppModal.types';

const AppModal = ({
  visible,
  onClose,
  position = 'center',
  title,
  subtitle,
  children,
  showCloseButton = true,
  closeOnBackdropPress = true,
  containerStyle,
  animationDuration = 250,
}: AppModalProps) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const translateY = useSharedValue(40);
  const insets = useSafeAreaInsets();

  // Keeps the native Modal mounted until the hide animation has finished.
  // Closing is driven only by the `visible` prop: previously the content was
  // faded out before the parent agreed to close, so a parent that kept
  // `visible` true left an invisible Modal blocking every touch.
  const [isRendered, setIsRendered] = useState(visible);
  if (visible && !isRendered) {
    setIsRendered(true);
  }

  useEffect(() => {
    if (visible) {

      opacity.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });

      if (position === 'center') {
        scale.value = withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.ease),
        });
      } else {
        translateY.value = withTiming(0, {
          duration: animationDuration,
          easing: Easing.out(Easing.ease),
        });
      }
    } else {
      opacity.value = withTiming(0, {
        duration: animationDuration,
      }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });

      if (position === 'center') {
        scale.value = withTiming(0.92, {
          duration: animationDuration,
        });
      } else {
        translateY.value = withTiming(40, {
          duration: animationDuration,
        });
      }
    }
  }, [visible, position]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const centerModalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  const bottomModalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  // The parent decides whether to close; the effect above animates it out.
  const handleClose = () => {
    onClose();
  };

  const modalContent = (
    <>
      {(title || showCloseButton) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && (
              <AppText
                variant="label"
                className="text-gray-900 dark:text-white"
              >
                {title}
              </AppText>
            )}

            {subtitle && (
              <AppText
                variant="caption"
                className="mt-1 text-gray-500 dark:text-gray-400"
              >
                {subtitle}
              </AppText>
            )}
          </View>

          {showCloseButton && (
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={10}
            >
              <AppIcon
                name="close"
                family="MaterialCommunityIcons"
                size={22}
                color="#6B7280"
              />
            </Pressable>
          )}
        </View>
      )}

      {/* Scrolls when the content is taller than the modal (small screens,
          large font sizes) so actions at the bottom stay reachable. */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          position === 'bottom' && { paddingBottom: insets.bottom + 20 },
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </>
  );

  return (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            backdropStyle,
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={
              closeOnBackdropPress
                ? handleClose
                : undefined
            }
          />
        </Animated.View>

        {position === 'center' ? (
          <Animated.View
            style={[
              styles.centerModal,
              centerModalStyle,
              containerStyle,
            ]}
          >
            {modalContent}
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.bottomModal,
              bottomModalStyle,
              containerStyle,
            ]}
          >
            <View style={styles.dragIndicator} />

            {modalContent}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  centerModal: {
    width: '88%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  bottomModal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  dragIndicator: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    marginTop: 10,
    marginBottom: 4,
  },

  header: {
    minHeight: 60,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titleContainer: {
    flex: 1,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  scroll: {
    flexGrow: 0,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
});

export default AppModal;