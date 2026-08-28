import clsx from 'clsx';
import React from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleProp,
  UIManager,
  View,
  ViewStyle,
} from 'react-native';


if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AppAccordionProps {
  expanded: boolean;
  onToggle: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  className?: string;
}

const AppAccordion = ({
  expanded,
  onToggle,
  header,
  children,
  containerStyle,
  className
}: AppAccordionProps) => {
  const handleToggle = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );

    onToggle();
  };

  return (
    <View

      className={clsx(
                 "mb-3  rounded-xl  bg-card/80 ",
                 className
             )}
    
      style={[
        {
          overflow: 'hidden',
        },
        containerStyle,
      ]}
    >
      {/* Completely controlled by parent */}
      <Pressable onPress={handleToggle}>
        {header}
      </Pressable>

      {/* Completely controlled by parent */}
      {expanded && (
        <View>
          {children}
        </View>
      )}
    </View>
  );
};

export default AppAccordion;

