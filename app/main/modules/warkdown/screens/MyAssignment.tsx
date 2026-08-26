import AppAccordion from '@/app/common/components/ui/AppAccordian.tsx/AppAccordion';
import AppIcon from '@/app/common/components/ui/AppIcon';
import { AppText, Heading } from '@/app/common/components/ui/Typography';
import { assignmentSectionHeader } from '@/app/data';
import { useAppSelector } from '@/app/lib/store/hooks';
import { RootState } from '@/app/lib/store/store';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useGetAssetListByActivityIdQuery } from '../api/walkdownApi';
import ActivityAssetInsList from '../components/ActivityAssetInsList';

const MyAssignment = () => {

     const { selectedActivityData } = useLocalSearchParams();

     const { currentUser } = useAppSelector((state) => state.auth);
      const selectedSite = useAppSelector(
        (state: RootState) => state.auth.selectedSite
      );
    const selectedActivity = selectedActivityData? JSON.parse(selectedActivityData as string) : null;
 




    const [expandedSection, setExpandedSection] = useState<string | null>(
        null
    );
    const handleSectionToggle = (sectionKey: string) => {
        setExpandedSection((current) =>
            current === sectionKey ? null : sectionKey
        );
    };


    const idDto = {
    id21: Number(currentUser?.companyId ?? 0),
    id22: selectedSite?.id ?? 0,
    id23: Number(currentUser?.userId ?? 0),
    
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
    } = useGetAssetListByActivityIdQuery(idDto, {
        skip: !canLoadActivityList,
    });



   
  console.log(selectedActivity)



    return (
        <> 
           

            {assignmentSectionHeader.map((headerItem) => {
                const isExpanded = expandedSection === headerItem.key;

                return (
                    <AppAccordion
                        key={headerItem.key}
                        className="border"
                        expanded={isExpanded}
                        onToggle={() => handleSectionToggle(headerItem.key)}
                        header={
                            <View
                                className="h-20 w-full flex-row justify-between items-center px-3"
                                style={{
                                    backgroundColor: `${headerItem.color}15`,
                                }}
                            >
                                {/* LEFT */}
                                <View className="flex-1 flex-row items-center gap-2">

                                    <View
                                        className="h-12 w-12 rounded-lg items-center justify-center"
                                        style={{
                                            backgroundColor: `${headerItem.color}25`,
                                        }}
                                    >
                                        <AppIcon
                                            name="user-check"
                                            family="Feather"
                                            size={22}
                                            color={headerItem.color}
                                        />
                                    </View>

                                    <Heading
                                        level={5}
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
                                        Asset: {headerItem.count}
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
                        <View className="flex-col gap-2 py-4  p-2">
                            <ScrollView
                                nestedScrollEnabled
                                showsVerticalScrollIndicator={false}
                                className="max-h-96"
                            >
                               
                               
                                <View className='max-h-40 flex-col gap-1 border-blue-600/15 border shadow-blue-500! rounded-xl p-2'>

                                 
                                     <ActivityAssetInsList/>

                                </View>
                            </ScrollView>
                        </View>
                    </AppAccordion>
    );
})}
           

            {/* <AppAccordion
                className="bg-[#8bcbb8]/5! border "
                expanded={expandedSection === 'completed'}
                onToggle={() => handleSectionToggle('completed')}
                header={
                    <View className="bg-[#8bcbb8]/10! h-20 w-full flex-row justify-between   items-center px-3 shadow-2xl ">

                        <View className="flex-1 flex-row items-center gap-2">
                            <View className='h-12 w-12 bg-teal-500/25 rounded-lg items-center flex justify-center'>
                                <AppIcon name='user-check' family='Feather' className='text-teal-800! relative left-0.5' size={22} />
                            </View>
                            <Heading level={6} className="flex-1 ">
                                COMPLETED
                            </Heading >
                        </View>

                        <View className="flex-row items-center">
                            <AppText variant='label' weight={'medium'}>
                                Asset: 2
                            </AppText>
                            <AppIcon
                                family="MaterialCommunityIcons"
                                name={
                                    expandedSection === 'completed'
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
              
             
                <View className='flex-col gap-2 py-4'>
                    <View className=" px-4 flex-col gap-2">
                         <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                        <View className='max-h-40 flex-col gap-1 border-blue-600/15 border shadow-blue-500! rounded-xl p-2'>
                           
                            <View className='flex-row  items-center gap-2'>
                                <View className='bg-background/45 p-2 rounded-lg'>
                                    <AppIcon family='AntDesign' name='product' size={18} className='text-primary-soft' /></View>

                                <View className='flex-1'>
                                    <AppText variant={'label'} weight={'semibold'}>Asset Name</AppText>
                                    <Heading level={6} >Ax-23520 - DRILL #10</Heading>
                                </View>
                            </View>
                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Manufacturel : </AppText>
                                        <AppText variant={'label'} >Pune</AppText>
                                    </View>
                                </View>
                            </View>
                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Model : </AppText>
                                        <AppText variant={'label'} >CN-122</AppText>
                                    </View>
                                </View>
                            </View>
                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Series No : </AppText>
                                        <AppText variant={'label'} >2201</AppText>
                                    </View>
                                </View>
                            </View>

                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Location : </AppText>
                                        <AppText variant={'label'} >India</AppText>
                                    </View>
                                </View>
                            </View>

                          
                        </View>
                          </ScrollView>
                    </View>
                    <View className="px-4 flex-col gap-2">
                         <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                        <View className='max-h-40 flex-col gap-1 border-blue-600/15 border shadow-blue-500! rounded-xl p-2'>
                           
                            <View className='flex-row  items-center gap-2'>
                                <View className='bg-background/45 p-2 rounded-lg'>
                                    <AppIcon family='AntDesign' name='product' size={18} className='text-primary-soft' /></View>

                                <View className='flex-1'>
                                    <AppText variant={'label'} weight={'semibold'}>Asset Name</AppText>
                                    <Heading level={6} >Ax-23520 - DRILL #10</Heading>
                                </View>
                            </View>
                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Manufacturel : </AppText>
                                        <AppText variant={'label'} >Pune</AppText>
                                    </View>
                                </View>
                            </View>
                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Model : </AppText>
                                        <AppText variant={'label'} >CN-122</AppText>
                                    </View>
                                </View>
                            </View>
                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Series No : </AppText>
                                        <AppText variant={'label'} >2201</AppText>
                                    </View>
                                </View>
                            </View>

                            <View className='flex-row gap-2 px-2 items-center ml-9'>
                                <View className='flex-row items-center gap-2'>
                                    <AppIcon
                                        family="MaterialCommunityIcons" name="circle"
                                        size={8}

                                    />
                                    <View className='flex-row ga--2'>
                                        <AppText variant={'label'} weight={'semibold'}>Location : </AppText>
                                        <AppText variant={'label'} >India</AppText>
                                    </View>
                                </View>
                            </View>

                           
                        </View>
                         </ScrollView>
                    </View>
                </View>
               
            </AppAccordion> */}

            {/* <AppAccordion
                className="bg-slate-200! border rounded-none! rounded-bl-2xl! rounded-tr-2xl!"
                expanded={expandedSection === 'completed'}
                onToggle={() => handleSectionToggle('completed')}
                header={

                    <View className="h-20 w-full flex-row justify-between   items-center px-3  ">

                        <View className="flex-1 flex-row items-center gap-2">
                            <View className='h-12 w-12 bg-slate-500/25 rounded-lg items-center flex justify-center'>
                                <AppIcon name='user-check' family='Feather' className='text-slate-800! relative left-0.5' size={22} />
                            </View>
                            <Heading level={6} className="flex-1 ">
                                ADDED
                            </Heading >
                        </View>

                        <View className="flex-row items-center">
                            <AppText variant='label' weight={'medium'}>
                                Asset: 2
                            </AppText>
                            <AppIcon
                                family="MaterialCommunityIcons"
                                name={
                                    expandedSection === 'completed'
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
               
                <View className="mx-2 my-4 flex-col gap-2">
                    <View>
                        <Heading >Hello  </Heading>
                    </View>
                </View>
            </AppAccordion> */}


        </>
    )
}

export default MyAssignment

