import AppAccordion from '@/app/common/components/ui/AppAccordian.tsx/AppAccordion';
import AppIcon from '@/app/common/components/ui/AppIcon';
import Button from '@/app/common/components/ui/Button/Button';
import CardSkeleton from '@/app/common/components/ui/CardSkeleton';
import { AppText, Heading } from '@/app/common/components/ui/Typography';
import { assignmentSectionHeader } from '@/app/data';
import { useAppSelector } from '@/app/lib/store/hooks';
import { RootState } from '@/app/lib/store/store';
import MyAssignemnt from '@/assets/images/assignment.svg';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useGetAssetListByActivityIdQuery } from '../api/walkdownApi';
import ActivityAssetInsList from '../components/ActivityAssetInsList';


const MyAssignment = () => {

    const selectedActivity = useAppSelector(
        state => state.assetWalkDown.selectedActivity
    );
    const [assetDivStep, setAssetDivStep] = useState(0);

    const [isAssetOrInstrumentList, setIsAssetOrInstrumentList] = useState(false);
    // const [selectedActivityId, setSelectedActivityId] = useState<any>(selectedActivity?.woId);
    const { expandPanel } = useLocalSearchParams();
    const [expandedSection, setExpandedSection] = useState<string | null>(
        expandPanel === 'assigned' ? 'assigned' : "assigned"
    );


    const [assetOrInstrument, setAssetOrInstrument] = useState(1);
    const [assignedAssetListData, setAssignedAssetListData] = useState<any[]>([]);
    const [completedAssetListData, setCompletedAssetListData] = useState<any[]>([]);
    const [addedAssetListData, setAddedAssetListData] = useState<any[]>([]);


    const { currentUser } = useAppSelector((state) => state.auth);
    const selectedSite = useAppSelector(
        (state: RootState) => state.auth.selectedSite
    );

    console.log("selectedActivity", selectedActivity)





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


    useEffect(() => {
        if (!myAssignmentList.length) {
            setAssignedAssetListData([]);
            setCompletedAssetListData([]);
            setAddedAssetListData([]);
            return;
        }

        setAssignedAssetListData(
            myAssignmentList.filter(
                a =>
                    a.assetProgressStatus === 4 &&
                    (a.isNew === false || a.isNew === null)
            )
        );

        setCompletedAssetListData(
            myAssignmentList.filter(
                a =>
                    [5, 3].includes(a.assetProgressStatus) &&
                    (a.isNew === false || a.isNew === null)
            )
        );

        setAddedAssetListData(
            myAssignmentList.filter(
                a =>
                    [4, 5, 3].includes(a.assetProgressStatus) &&
                    a.isNew === true
            )
        );
    }, [myAssignmentList]);



    const handleSectionToggle = (sectionKey: string) => {
        setExpandedSection((current) =>
            current === sectionKey ? null : sectionKey
        );
    };




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
                    Activity  List Not available
                </AppText>

                <AppText
                    variant="bodySmall"
                    className="mt-1 text-center text-text-tertiary"
                >
                    There are no Activity available for this site.
                </AppText>
            </View>
        );
    }




    return (
        <>

            <View className='flex-1 relative'>
                <View className='mb-6'>
                    <Heading level={4}  >My Assignments </Heading>
                    <AppText variant='label' className='mb-2'>Track and Manage all assigned assets</AppText>
                    <View className='flex-row gap-2 items-center bg-slate-50 border-slate-300/30 p-1 border w-[35%] px-2 rounded '>

                        <AppIcon family='Feather' name='layers' size={14} color='#2b7fff' className="text-blue-500 font-bold" />
                        <AppText variant='label'>
                            Total Asset :  <Text className='text-[#2b7fff] font-semibold'>{assignedAssetListData?.length}</Text>
                        </AppText>
                    </View>
                    <View
                        pointerEvents="none"
                        className="absolute   -right-3 -top-5  z-9999"
                        style={{ zIndex: 999 }}
                    >
                        <MyAssignemnt height={100} preserveAspectRatio="xMidYMid slice" />
                    </View>
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
                                    className={`h-20  w-full flex-row justify-between items-center px-3 ${headerItem.bgcolorHeader}`}
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

                                        <AppText
                                            variant="label"
                                            weight="medium"
                                        >
                                            Asset: {sectionData?.length}
                                        </AppText>

                                        <AppIcon
                                            family="MaterialCommunityIcons"
                                            name={
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

                                <View className="max-h-80">

                                    <ActivityAssetInsList
                                        activityInstrumentAssetList={sectionData}
                                        isLoading={isLoading}
                                        isFetching={isFetching}
                                        borderColor={headerItem?.borderCard}
                                    />

                                </View>

                            </View>
                        </AppAccordion>
                    );
                })}


                <View className="absolute bottom-2 left-0 right-0  py-3 ">
                    <Button fullWidth>
                        <View className="flex-row items-center justify-center gap-2">
                            <AppIcon
                                name="plus-circle"
                                family="Feather"
                                color="#fff"
                                size={20}
                            />

                            <AppText
                                variant="body"
                                weight="semibold"
                                className="text-white"
                            >
                                Add New Asset
                            </AppText>
                        </View>
                    </Button>
                </View>
            </View>


        </>
    )
}

export default MyAssignment

