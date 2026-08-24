import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import AppIcon from '@/app/common/components/ui/AppIcon';
import { AppText } from '@/app/common/components/ui/Typography';

import { TabItem, TabsProps } from './types';

const AppTabs: React.FC<TabsProps> = ({
  tabs,

  activeTab,
  defaultActiveTab,

  onChange,

  scrollable = false,
  showIndicator = true,

  indicatorHeight = 3,

  backgroundColor = '#FFFFFF',

  activeColor = '#2563EB',
  inactiveColor = '#64748B',
  indicatorColor,

  containerStyle,
  tabStyle,
  activeTabStyle,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<
    string | undefined
  >(defaultActiveTab ?? tabs[0]?.key);

  const [containerWidth, setContainerWidth] = useState(0);

  /**
   * Controlled vs uncontrolled
   */
  const selectedTab = activeTab ?? internalActiveTab;

  /**
   * Find currently active tab index
   */
  const activeIndex = Math.max(
    0,
    tabs.findIndex(tab => tab.key === selectedTab),
  );

  /**
   * Animated indicator position
   */
  const indicatorPosition = useSharedValue(activeIndex);

  /**
   * Animate indicator when active tab changes
   */
  useEffect(() => {
    const index = tabs.findIndex(tab => tab.key === selectedTab);

    if (index >= 0) {
      indicatorPosition.value = withTiming(index, {
        duration: 280,
      });
    }
  }, [selectedTab, tabs]);

  /**
   * Keep selected tab valid when tabs change dynamically
   */
  useEffect(() => {
    if (!tabs.length) {
      return;
    }

    const exists = tabs.some(
      tab => tab.key === selectedTab,
    );

    if (!exists) {
      const firstTab = tabs[0].key;

      setInternalActiveTab(firstTab);

      const firstTabData = tabs[0];

      onChange?.(firstTab, firstTabData);
    }
  }, [tabs]);

  const handleTabPress = (tab: TabItem) => {
    if (tab.disabled) {
      return;
    }

    if (activeTab === undefined) {
      setInternalActiveTab(tab.key);
    }

    onChange?.(tab.key, tab);
  };

  /**
   * Animated indicator
   */
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    if (!containerWidth || tabs.length === 0) {
      return {
        opacity: 0,
      };
    }

    const tabWidth = containerWidth / tabs.length;

    return {
      opacity: 1,

      transform: [
        {
          translateX:
            indicatorPosition.value * tabWidth,
        },
      ],
    };
  });

  const renderTab = (tab: TabItem) => {
    const isActive = selectedTab === tab.key;

    const tabActiveColor =
      tab.activeColor ?? activeColor;

    const tabInactiveColor =
      tab.inactiveColor ?? inactiveColor;

    const color = isActive
      ? tabActiveColor
      : tabInactiveColor;

    return (
      <Pressable
        key={tab.key}
        disabled={tab.disabled}
        onPress={() => handleTabPress(tab)}
        style={[
          styles.tab,
          tabStyle,
          isActive && activeTabStyle,
          tab.disabled && styles.disabledTab,
        ]}
      >
        <View style={styles.tabContent}>
          {tab.icon && (
            <AppIcon
              family={tab.iconFamily}
              name={tab.icon}
              size={tab.iconSize}
              color={color}
            />
          )}

          <AppText
            style={[
              styles.label,
              {
                color,
                fontWeight: isActive ? '600' : '600',
              },
            ]}
          >
            {tab.label}

            {tab.count !== undefined && (
              <AppText
                style={[
                  styles.count,
                  {
                    color,
                  },
                ]}
              >
                {' '}({tab.count})
              </AppText>
            )}
          </AppText>
        </View>
      </Pressable>
    );
  };

  const tabWidth =
    tabs.length > 0
      ? containerWidth / tabs.length
      : 0;

  const indicatorWidth = Math.max(
    0,
    tabWidth - 32,
  );

  const tabsContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
        containerStyle,
      ]}
      onLayout={event => {
        setContainerWidth(
          event.nativeEvent.layout.width,
        );
      }}
    >
      {tabs.map(renderTab)}

      {showIndicator && containerWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              height: indicatorHeight,
              backgroundColor:
                indicatorColor ?? activeColor,
            },
            animatedIndicatorStyle,
          ]}
        />
      )}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabsContent}
      </ScrollView>
    );
  }

  return tabsContent;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 8,
    position: 'relative',
  },

  scrollContent: {
    flexGrow: 1,
  },

  tab: {
    flex: 1,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 8,
  },

  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  label: {
    fontSize: 14,
  },

  count: {
    fontSize: 14,
  },

  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    borderRadius: 10,
  },

  disabledTab: {
    opacity: 0.45,
  },
});

export default AppTabs;