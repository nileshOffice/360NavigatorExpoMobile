import { setSafetyAcknowledged } from '@/app/auth/authSlice';
import AppIcon from '@/app/common/components/ui/AppIcon';
import { AppModal } from '@/app/common/components/ui/AppModal';
import { AppTabs, TabItem } from '@/app/common/components/ui/AppTab';
import Button from '@/app/common/components/ui/Button/Button';
import Card from '@/app/common/components/ui/Card/Card';
import CardSkeleton from '@/app/common/components/ui/CardSkeleton';
import { AppText, Heading } from '@/app/common/components/ui/Typography';
import { APP_ROUTES } from '@/app/common/config/routes';
import Screen from '@/app/common/layouts/Screen';
import { safetyGuidelines } from '@/app/data';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { RootState } from '@/app/lib/store/store';
import { formatDateTime } from '@/app/lib/utils';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useGetAssetWalkDownActivityListQuery } from '../api/walkdownApi';
import { AssetWalkDownActivity, IdDto } from '../api/walkdownApi.types';
import { setSelectedActivity, setSelectedTab } from '../redux/walkDownSlice/selectedWalkDown';


export interface WalkdownItem {
  id: number;
  title: string;
  description: string;
  assets: number;
  date: string;

  icon: string;
  iconFamily:
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'Feather'
  | 'AntDesign'
  | 'FontAwesome6';

  iconBackground: string;
  iconColor: string;

  badgeBackground: string;
  badgeColor: string;
}


type assetRegistryListProps = {
  assetList: WalkdownItem[];
  onHandleAssetListSelected: (selectedModule: WalkdownItem | null) => void;
  isLoading: boolean;
};

const AssetRegistry = () => {

  const dispatch = useAppDispatch();

  const activeTab = useAppSelector(
    state => state.assetWalkDown.selectedTab
  )

  const { currentUser } = useAppSelector((state) => state.auth);
  const selectedSite = useAppSelector(
    (state: RootState) => state.auth.selectedSite
  );

  const safetyAcknowledged = useAppSelector(
  (state) => state.auth.safetyAcknowledged
);

  const idDto: IdDto = {
    id21: Number(currentUser?.companyId ?? 0),
    id22: selectedSite?.id ?? 0,
    id23: Number(currentUser?.userId ?? 0),
    id24: 99,
    id: 'C',
    id25: 0,
    id26: 1,
  };

  const canLoadActivityList =
    !!currentUser?.companyId &&
    !!currentUser?.userId &&
    !!selectedSite?.id;

  const {
    data: activityList = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAssetWalkDownActivityListQuery(idDto, {
    skip: !canLoadActivityList,
  });

  const inProgressActivityList = useMemo(
    () =>
      activityList.filter(
        item => item.statusId === 0 || item.statusId === null,
      ),
    [activityList],
  );

  const completedActivityList = useMemo(
    () =>
      activityList.filter(
        item => item.statusId === 1,
      ),
    [activityList],
  );




  const filteredActivityList = activeTab === 'inProgress' ? inProgressActivityList : completedActivityList;


  useEffect(() => {
    if (
      !isLoading &&
      inProgressActivityList.length === 0 &&
      completedActivityList.length > 0
    ) {
      dispatch(setSelectedTab('completed'));
    }
  }, [
    isLoading,
    inProgressActivityList.length,
    completedActivityList.length,
    dispatch,
  ]);

  const walkdownTabs: TabItem[] = [
    {
      key: 'inProgress',
      label: 'In Progress',
      count: inProgressActivityList.length,
      icon: 'clock',
      iconFamily: 'Feather',
      iconSize: 20,
      activeColor: '#2563EB',
    },

    {
      key: 'completed',
      label: 'Completed',
      count: completedActivityList.length,
      icon: 'check-circle',
      iconFamily: 'Feather',
      iconSize: 20,
      activeColor: '#2563EB',
    },

  ];


  // Registry wolkdownList 

  /**
     * Loading state
     */
  if (isLoading) {
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
  if (!activityList?.length) {
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
            Activity Assignmnet List Not Found
        </AppText>

        <AppText
          variant="bodySmall"
          className="mt-1 text-center text-text-tertiary"
        >
          There are no Activity Assignmnet available for this site.
        </AppText>
      </View>
    );
  }


  // 10. CURRENT TAB HAS NO DATA
  if (!filteredActivityList.length) {
    const isInProgress = activeTab === 'inProgress';

    return (
      <Screen>
        <AppTabs
          tabs={walkdownTabs}
          activeTab={activeTab}
          onChange={tab =>
            dispatch(
              setSelectedTab(
                tab as 'inProgress' | 'completed',
              ),
            )
          }
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


  const handleActivityPress = (item: AssetWalkDownActivity) => {
    dispatch(setSelectedActivity(item));

    router.push({
      pathname: APP_ROUTES.assetAssignment as any,
      params: {
        expandPanel: 'assigned',
      },
    });
  };




  return (
    <>
      <Screen  >

        <AppTabs
          tabs={walkdownTabs}
          activeTab={activeTab}
          onChange={tab => dispatch(setSelectedTab(tab as 'inProgress' | 'completed'))}

        />


        <View className='flex-1 my-2'>
          <FlatList
            data={filteredActivityList}
            keyExtractor={(item) => item?.id.toString()}
            renderItem={({ item }) => (
              <Card className='mb-2' pressable={true}
                 onPress={() => handleActivityPress(item)}
             >
                <View className='flex-row justify-between gap-2 items-start'>
                  <View className='flex-row gap-4'>
                    <View
                      className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft"
                    >
                      <AppIcon
                        family="MaterialCommunityIcons"
                        name="clipboard-check-outline"
                        color="#2563EB"
                        size={24}
                      />
                    </View>
                    <View className='flex--1 gap-1'>
                      <AppText variant={'h5'} >Walkdown ID:{item?.woId}</AppText>
                      <AppText weight={"medium"} variant={'bodySmall'} className='text-text-tertiary!'>{item?.description}</AppText>
                    </View>
                  </View>
                  <View className='p-2 rounded-2xl bg-primary-soft'>
                    <AppText className='text-primary!' variant={'caption'} weight='bold'>{item?.assetCount} Assets</AppText>
                  </View>
                </View>
                <View className='flex-row justify-between mt-3'>
                  <View className='flex-row items-center gap-2'>
                    <AppIcon family='Ionicons' size={12} name='calendar-outline' className='ml-3 text-primary/80!' />
                    <AppText variant='label'>{formatDateTime(item.scheduleDate)}</AppText>
                  </View>
                  <View>
                    <AppIcon
                      family="Feather"
                      name="chevron-right"
                      size={20}
                      color="#64748B"
                    />
                  </View>
                </View>

              </Card>
            )}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </Screen>

      <View>
        <AppModal
          showCloseButton={false}
          visible={!safetyAcknowledged}
          onClose={() =>  dispatch(setSafetyAcknowledged(false))}
          position="center"
        >
          <View className='w-[60%] m-auto flex justify-center items-center pt-2 '>
            <View className="w-20 h-20  rounded-full bg-blue-100 flex items-center justify-center text-center my-4">
              <AppIcon family="MaterialCommunityIcons" name="shield-check" size={40} color="#2563EB" />
            </View>

            <Heading level={5} className='text-center!' >Your safety is your personal responsibilty</Heading>
           
          </View>
           <View className='my-6'>
              {safetyGuidelines.map((item: any) => (
                <View key={item.id} className="flex-row gap-4 items-center mb-4">

                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center ">
                    <AppIcon
                      name={item.icon}
                      family={item.iconFamily}
                      size={20}
                      color="#2563EB"
                    />
                  </View>

                  <AppText variant={'label'} className='w-[85%]' weight="regular" numberOfLines={4}>{item.text}</AppText>

                </View>
              ))}
            </View>
          <Button title="I Agree" fullWidth onPress={() => {
            dispatch(setSafetyAcknowledged(true));
          }} />
        </AppModal>
      </View>


    </>
  )
}

export default AssetRegistry

