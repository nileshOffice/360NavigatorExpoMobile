import { StyleProp, ViewStyle } from 'react-native';





export type TabKey = string;

export interface TabItem {
  key: TabKey;
  label: string;

  count?: number;

  icon?: string;
  iconFamily?:'Ionicons'| 'MaterialCommunityIcons'| 'Feather'| 'AntDesign' | 'FontAwesome6' ; 
  iconSize?: number;

  activeColor?: string;
  inactiveColor?: string;
  indicatorColor?: string;

  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];

  activeTab?: TabKey;
  defaultActiveTab?: TabKey;

  onChange?: (tabKey: TabKey, tab: TabItem) => void;

  scrollable?: boolean;
  showIndicator?: boolean;

  indicatorHeight?: number;

  backgroundColor?: string;

  activeColor?: string;
  inactiveColor?: string;
  indicatorColor?: string;

  containerStyle?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
}