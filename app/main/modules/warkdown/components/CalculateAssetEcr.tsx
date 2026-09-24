import AppIcon from '@/app/common/components/ui/AppIcon';
import { AppTabs, TabItem } from '@/app/common/components/ui/AppTab';
import { AppText } from '@/app/common/components/ui/Typography';
import Screen from '@/app/common/layouts/Screen';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';


const CalculateAssetEcr = () => {
      
      const inProgressActivityList = [];
      const completedActivityList = []
      
      const [selectedTab, setSelectedTab] = useState('config');
      const [isLoading, setIsLoading] = useState(false)
      const filteredActivityList = selectedTab === 'config' ? 'inProgressActivityList' : 'completedActivityList';
    
    
      useEffect(() => {
        if (
          !isLoading &&
          inProgressActivityList.length === 0 &&
          completedActivityList.length > 0
        ) {
          setSelectedTab('ecr')
        }
      }, [
        isLoading,
        inProgressActivityList.length,
        completedActivityList.length,
      ]);


      const assetEcrTabs: TabItem[] = [
        {
            key: 'config',
            label: 'Config',
            count: inProgressActivityList.length,
            icon: 'clock',
            iconFamily: 'Feather',
            iconSize: 20,
            activeColor: '#2563EB',
        },

        {
            key: 'ecr',
            label: 'Ecr',
            count: completedActivityList.length,
            icon: 'check-circle',
            iconFamily: 'Feather',
            iconSize: 20,
            activeColor: '#2563EB',
        },

    ];


    // 10. CURRENT TAB HAS NO DATA
      if (!filteredActivityList.length) {
        const isInProgress = selectedTab === 'config';
    
        return (
          <Screen>
            <AppTabs
              tabs={assetEcrTabs}
              activeTab={selectedTab}
              onChange={tab => setSelectedTab(tab)}
            />
    
            <View className="flex-1 items-center justify-center px-6">
              <AppIcon
                family="MaterialCommunityIcons"
                name={
                  isInProgress
                    ? 'progress-clock'
                    : 'check-circle-outline'
                }
                size={30}
                className="text-slate-500!"
              />
    
              <AppText
                variant="h6"
                className="mt-4 text-center">
                {isInProgress
                  ? 'No In Progress Walkdowns'
                  : 'No Completed Walkdowns'}
              </AppText>
    
              <AppText
                variant="bodySmall"
                className="mt-1 text-center text-text-tertiary">
                {isInProgress
                  ? 'There are no walkdowns currently in progress.'
                  : 'There are no completed walkdowns available.'}
              </AppText>
            </View>
          </Screen>
        );
      }
    

  return (
    <View>
      <Text>CalculateAssetEcr</Text>
    </View>
  )
}

export default CalculateAssetEcr