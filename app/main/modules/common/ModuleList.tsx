import AppIcon from '@/app/common/components/ui/AppIcon';
import Card from '@/app/common/components/ui/Card/Card';
import CardSkeleton from '@/app/common/components/ui/CardSkeleton';
import { AppText } from '@/app/common/components/ui/Typography';
import React from 'react';
import { FlatList, View } from 'react-native';


type Modules = {
  companyId: number;
  moduleId: number;
  moduleExpired: number;
  licenseTypeId: number;
  dateDifference: number;
  toDate: string;
  fromDate: string;
  isMobileView: boolean;
  moduleName: string;
  backGroundImagePath: string | null;
  mobileBackGroundImagePath: string | null;
  description: string | null;
  mobileModuleName: string;
  redirectURL: string;
  routingId: number | null;
  url: string;
};

type ModuleListProps = {
  moduleList: Modules[];
  onHandleModuleList: (selectedModule: Modules | null) => void;
  isLoading: boolean;
  isSiteLoading: boolean;
};

type IconFamily = | 'Ionicons'| 'MaterialCommunityIcons'| 'Feather'| 'AntDesign' | 'FontAwesome6' ;


type ModuleColor = {
  border: string;
  icon: string;
  iconBg: string;
  iconName: string;
  iconType: IconFamily;
};

/**
 * Dynamic colors are kept as React Native colors instead of
 * NativeWind classes because moduleName is dynamic.
 * 
 * 
 * 
 */


const moduleColors: Record<number, ModuleColor> = {
  // Precision Assessments
  38: {
    border: '#3B82F6',
    icon: '#3B82F6',
    iconBg: '#DBEAFE',
    iconName: 'clipboard-check',
    iconType: 'MaterialCommunityIcons',
  },

  // BPMO
  24: {
    border: '#22C55E',
    icon: '#22C55E',
    iconBg: '#DCFCE7',
    iconName: 'sitemap',
    iconType: 'MaterialCommunityIcons',
  },

  // Gemba Exercises
  30: {
    border: '#F97316',
    icon: '#F97316',
    iconBg: '#FFEDD5',
    iconName: 'factory',
    iconType: 'MaterialCommunityIcons',
  },

  // Asset Walkdown
  95: {
    border: '#8B5CF6',
    icon: '#8B5CF6',
    iconBg: '#EDE9FE',
    iconName: 'map-marker-path',
    iconType: 'MaterialCommunityIcons',
  },
};

const defaultModuleColor: ModuleColor = {
  border: '#94A3B8',
  icon: '#64748B',
  iconBg: '#F1F5F9',
  iconName: 'view-grid-outline',
  iconType: 'MaterialCommunityIcons',
};

// const defaultModuleColor: ModuleColor = {
//   border: '#94A3B8',
//   icon: '#64748B',
//   iconBg: '#F1F5F9',
//   iconName: 'layout-grid',
//   iconType: 'lucide',
// };


const ModuleList = ({
  moduleList,
  onHandleModuleList,
  isLoading,
  isSiteLoading,
}: ModuleListProps) => {
  /**
   * Loading state
   */
  if (isSiteLoading || isLoading) {
    return (
      <View className="flex-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <CardSkeleton
            key={`module-skeleton-${index}`}
            className="mb-3"
          />
        ))}
      </View>
    );
  }



  /**
   * Empty state
   */
  if (!moduleList?.length) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <AppIcon
            family="MaterialCommunityIcons"
            name="view-grid-outline"
            size={30}
            className="text-slate-500!"
          />
          {/* <Image source={}/> */}
        </View>

        <AppText variant="h6" className="text-center">
          No modules available
        </AppText>

        <AppText
          variant="bodySmall"
          className="mt-1 text-center text-text-tertiary"
        >
          There are no modules available for this site.
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={moduleList}
      keyExtractor={(item, index) =>
        `${item.moduleId}-${index}`
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 20,
      }}
      renderItem={({ item }) => {
        const colors =
          moduleColors[item.moduleId] ?? defaultModuleColor;

        return (
          <Card
            className="mb-3 border-t border-r border-b border-slate-200/50 bg-card/80 p-4 shadow!"
            pressable={true}
            onPress={() => onHandleModuleList(item)}
            style={{
              borderLeftWidth: 3,
              borderLeftColor: colors.border!,
            }}
          >
            <View className="flex-row items-center gap-4">
              {/* Module Icon */}
              <View
                className="h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: colors.iconBg,
                }}
              >
                <AppIcon
                  family={colors.iconType}
                  name={colors.iconName}
                  size={26}
                  color={colors.icon}
                />
                {/* <Image
                source={item?.mobileBackGroundImagePath}className="h-8 w-8"resizeMode="contain"/> */}
              </View>

              {/* Module Information */}
              <View className="flex-1">
                <AppText variant="h6">
                  {item.mobileModuleName}
                </AppText>

                {item.description && (
                  <AppText
                    variant="bodySmall"
                    className="mt-1 text-text-tertiary"
                    numberOfLines={2}
                  >
                    {item.description}
                  </AppText>
                )}
              </View>

              {/* Arrow */}
              <AppIcon
                family="MaterialCommunityIcons"
                name="chevron-right"
                size={24}
                className="text-text-tertiary!"
              />
            </View>
          </Card>
        );
      }}
    />
  );
};

export default ModuleList;