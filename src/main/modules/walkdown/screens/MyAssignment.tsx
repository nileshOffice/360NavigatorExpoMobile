import MyAssignemnt from '@/assets/images/assignment.svg';
import AppAccordion from '@/src/common/components/ui/AppAccordion/AppAccordion';
import AppIcon from '@/src/common/components/ui/AppIcon';
import Button from '@/src/common/components/ui/Button/Button';
import CardSkeleton from '@/src/common/components/ui/CardSkeleton';
import { AppText, Heading } from '@/src/common/components/ui/Typography';
import { APP_ROUTES } from '@/src/common/config/routes';
import { useScreenHeader } from '@/src/common/hooks/useScreenHeader';
import { assignmentSectionHeader } from '@/src/data';
import { useAppDispatch, useAppSelector } from '@/src/lib/store/hooks';
import { RootState } from '@/src/lib/store/store';
import { useGetAssetListByActivityIdQuery } from '@/src/main/modules/walkdown/api/walkdownApi';
import ActivityAssetInsList from '@/src/main/modules/walkdown/components/ActivityAssetInsList';
import { setSelectedAssetData } from '@/src/main/modules/walkdown/redux/walkDownSlice/selectedAssetData';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';



const MyAssignment = () => {
    
    const dispatch = useAppDispatch();
    
    const selectedActivity = useAppSelector(
        state => state.assetWalkDown.selectedActivity
    );
    // const [selectedActivityId, setSelectedActivityId] = useState<any>(selectedActivity?.woId);
    const { expandPanel } = useLocalSearchParams();
    const [expandedSection, setExpandedSection] = useState<string | null>(
        expandPanel === 'assigned' ? 'assigned' : "assigned"
    );

    


    useScreenHeader({ title: 'My Assignment', showBack: true, showMenu: false, showLogo: false, backAction: 'goBack', });

    // The expanded list keeps its 320px height on normal phones but shrinks on
    // short screens (e.g. iPhone SE, 360x640dp Android) so the three section
    // headers and the Add button still fit.
    const { height: windowHeight } = useWindowDimensions();
    const expandedListMaxHeight = Math.min(320, Math.max(180, windowHeight - 520));


    const { currentUser } = useAppSelector((state) => state.auth);
    const selectedSite = useAppSelector(
        (state: RootState) => state.auth.selectedSite
    );


    const idDto = {
        id21: Number(currentUser?.companyId ?? 0),
        id22: Number(selectedSite?.id ?? 0),
        id23: Number(selectedActivity?.woId ?? 0),
    };

    const canLoadActivityList =
        !!currentUser?.companyId &&
        !!currentUser?.userId &&
        !!selectedActivity?.woId;

    const {
        data: myAssignmentList = [],
        isLoading,
        isFetching,
        isError,
    } = useGetAssetListByActivityIdQuery(idDto, {
        skip: !canLoadActivityList,
    });


      
    




    useEffect(() => {
        if (!expandPanel) return;

        const panelKey = Array.isArray(expandPanel)
            ? expandPanel[0]
            : expandPanel;

        const matchedHeader = assignmentSectionHeader.find(
            item => item.key === panelKey
        );

        if (!matchedHeader) return;

        setExpandedSection(matchedHeader.key);
    }, [expandPanel]);


    // Derived lists (no extra state / render pass needed).
    const { assignedAssetListData, completedAssetListData, addedAssetListData } = useMemo(() => {
        const isExisting = (asset: any) => asset.isNew === false || asset.isNew === null;

        return {
            assignedAssetListData: myAssignmentList.filter(
                (asset) => asset.assetProgressStatus === 4 && isExisting(asset),
            ),
            completedAssetListData: myAssignmentList.filter(
                (asset) => [5, 3].includes(asset.assetProgressStatus) && isExisting(asset),
            ),
            addedAssetListData: myAssignmentList.filter(
                (asset) => [4, 5, 3].includes(asset.assetProgressStatus) && asset.isNew === true,
            ),
        };
    }, [myAssignmentList]);



    const handleSectionToggle = (sectionKey: string) => {
        setExpandedSection((current) =>
            current === sectionKey ? null : sectionKey
        );
    };


    const handleCreateAsset = () => {
          router.push(APP_ROUTES.createNewAsset);
    }

    const handleClickExercise = (item: any) => {
        dispatch(setSelectedAssetData(item));
        router.push(APP_ROUTES.updateDeleteAsset);
    };

    // Background reload (e.g. after a create / update / submit): the old list
    // stays visible, so show that newer data is on its way. The first load
    // uses the skeleton instead.
    const isRefreshing = isFetching && !isLoading;
    const refreshingIndicator = isRefreshing ? (
        <View
            className="flex-row items-center gap-2 self-start"
            accessibilityRole="progressbar"
            accessibilityLabel="Refreshing asset list"
        >
            <ActivityIndicator size="small" color="#2b7fff" />
            <AppText variant="label" className="text-text-tertiary">Refreshing...</AppText>
        </View>
    ) : null;

    const addAssetButton = (
        <Button fullWidth onPress={handleCreateAsset}>
            <View className="flex-row items-center justify-center gap-2">
                <AppIcon name="plus-circle" family="Feather" color="#fff" size={20} />
                <AppText variant="body" weight="semibold" className="text-white">
                    Add New Asset
                </AppText>
            </View>
        </Button>
    );




    /**
         * Loading state
         */
    if (isLoading) {
        return (
            <View className="flex-1">
                {Array.from({ length: 3 }).map((_, index) => (
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
    if (!myAssignmentList?.length) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                {refreshingIndicator && <View className="mb-4">{refreshingIndicator}</View>}
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
                    No assets yet
                </AppText>

                <AppText
                    variant="bodySmall"
                    className="mt-1 text-center text-text-tertiary"
                >
                    There are no assets in this walkdown yet.
                </AppText>

                {/* Previously hidden here, so an empty walkdown could never get its first asset. */}
                <View className="mt-6 w-full">{addAssetButton}</View>
            </View>
        );
    }

  




    return (
        <>

            <View className='flex-1'>
              <View className='flex-1'>
                <View className='mb-6'>
                    {/* Decorative image drawn first so the heading text stays on top of it on narrow screens.
                        Kept inside the screen (top-0 / right-0): the screen container clips anything
                        outside its edges, so negative offsets cut off the top and right of the image. */}
                    <View
                        pointerEvents="none"
                        className="absolute right-0 top-0"
                    >
                        <MyAssignemnt height={100} preserveAspectRatio="xMidYMid slice" />
                    </View>
                    <Heading level={4}  >My Assignments </Heading>
                    <AppText variant='label' className='mb-2'>Track and Manage all assigned assets</AppText>
                    {/* self-start: sizes to its text instead of a fixed 35% width that clipped on small screens. */}
                    <View className='flex-row gap-2 items-center self-start bg-slate-50 border border-slate-300 p-1  px-2 rounded '>

                        <AppIcon family='Feather' name='layers' size={14} color='#2b7fff' className="text-blue-500 font-bold" />
                        <AppText variant='label'>
                            Total Asset :  <Text className='text-[#2b7fff] font-semibold'>{assignedAssetListData?.length}</Text>
                        </AppText>
                    </View>
                    {refreshingIndicator && <View className='mt-2'>{refreshingIndicator}</View>}
                </View>


                {assignmentSectionHeader.map((headerItem) => {
                    const isExpanded = expandedSection === headerItem.key;
                    let sectionData = [];
                    if (headerItem.key === 'assigned') {
                        sectionData = assignedAssetListData;
                    } else if (headerItem.key === 'added') {
                        sectionData = addedAssetListData;
                    } else if (headerItem.key === 'completed') {
                        sectionData = completedAssetListData;
                    }
                    return (
                        <AppAccordion
                            key={headerItem.key}
                            className={`border ${headerItem.accordionCard} `}
                            expanded={isExpanded}
                            onToggle={() => handleSectionToggle(headerItem.key)}
                            header={
                                <View
                                    className={`min-h-20  w-full flex-row justify-between items-center px-3 ${headerItem.bgcolorHeader}`}
                                >
                                    {/* LEFT */}
                                    <View className="flex-1 flex-row items-center gap-2">
                                        <View
                                            className="h-12 w-12 rounded-lg items-center justify-center bg-ree"
                                            style={{
                                                backgroundColor: `${headerItem.bgIcon}20`,
                                            }}
                                        >
                                            <AppIcon
                                                name={headerItem.iconName}
                                                family="MaterialCommunityIcons"
                                                size={22}
                                                color={headerItem.bgIcon}
                                            />
                                        </View>
                                        <Heading
                                            level={6}
                                            className="flex-1"
                                        >
                                            {headerItem.title}
                                        </Heading>

                                    </View>

                                    {/* RIGHT */}
                                    <View className="flex-row items-center gap-2">

                                        <AppText variant="label" weight="medium">
                                            Asset: {sectionData?.length}
                                        </AppText>

                                        <AppIcon
                                            family="MaterialCommunityIcons" name={
                                                isExpanded
                                                    ? 'chevron-up'
                                                    : 'chevron-down'
                                            }
                                            size={20}
                                            color="#334155"
                                        />

                                    </View>
                                </View>
                            }
                        >
                            {/* BODY */}
                            <View className={`flex-col gap-2 py-4  p-2 ${headerItem.bgcolorBody}`}
                            >

                                <View style={{ maxHeight: expandedListMaxHeight }}>

                                    <ActivityAssetInsList
                                        activityInstrumentAssetList={sectionData}
                                        isLoading={isLoading}
                                        isFetching={isFetching}
                                        borderColor={headerItem?.borderCard}
                                        onHandleExercise={handleClickExercise}
                                    />

                                </View>

                            </View>
                        </AppAccordion>
                    );
                })}
              </View>

                {/* Normal footer instead of an absolutely positioned button, so it
                    never covers the last section or list items. AppLayout already
                    adds the bottom safe area below it. */}
                <View className="py-3">
                    {addAssetButton}
                </View>
            </View>


        </>
    )
}

export default MyAssignment

