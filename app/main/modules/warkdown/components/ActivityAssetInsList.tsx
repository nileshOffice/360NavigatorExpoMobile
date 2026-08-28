import AppIcon from '@/app/common/components/ui/AppIcon';
import { AppText, Heading } from '@/app/common/components/ui/Typography';
import React from 'react';
import { FlatList, View } from 'react-native';


type ActivityInstructmentAssetListProps = {
  activityInstrumentAssetList:any;
//   onHandleModuleList: (selectedModule:  | null) => void;
  isLoading: boolean;
  isFetching:boolean;
  borderColor:any;
};

const ActivityAssetInsList = ({ activityInstrumentAssetList ,isLoading, borderColor }:ActivityInstructmentAssetListProps) => {


    if (!activityInstrumentAssetList?.length) {
        return (
            <View className="flex-1 items-center justify-center px-6 ">
                <AppText variant="h5" className="text-center">
                    List Not available
                </AppText>
            </View>
        );
    }




    return (
        <View>
            <FlatList
                data={activityInstrumentAssetList}
                contentContainerStyle={{
                    paddingBottom: 50,
                }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item?.id.toString()}
                renderItem={({ item }) => (
                    <View className={`max-h-72 border   rounded-xl p-2 mb-2  ${borderColor} `}
                      >
                        <View className='flex-row  items-center gap-2'>
                            <View className='bg-background p-2 rounded-lg'>
                                <AppIcon family='AntDesign' name='product' size={18} className='text-primary-soft' /></View>

                            <View className='flex-1'>
                                <AppText variant={'label'} weight={'semibold'}>Asset Name</AppText>
                                <Heading level={6} >{item?.assetNum} - {item?.name}</Heading>
                            </View>
                        </View>
                        <View className='flex-row gap-2 px-2 items-center ml-9'>
                            <View className='flex-row items-center gap-2'>
                                <AppIcon
                                    family="MaterialCommunityIcons" name="circle"
                                    size={6}

                                />
                                <View className='flex-row ga--2'>
                                    <AppText variant={'label'} weight={'semibold'}>Manufacturel : </AppText>
                                    <AppText variant={'label'} >{item?.manufacturer}</AppText>
                                </View>
                            </View>
                        </View>
                        <View className='flex-row gap-2 px-2 items-center ml-9'>
                            <View className='flex-row items-center gap-2'>
                                <AppIcon
                                    family="MaterialCommunityIcons" name="circle"
                                    size={6}

                                />
                                <View className='flex-row ga--2'>
                                    <AppText variant={'label'} weight={'semibold'}>Model : </AppText>
                                    <AppText variant={'label'} >{ item?.makeModel}</AppText>
                                </View>
                            </View>
                        </View>
                        <View className='flex-row gap-2 px-2 items-center ml-9'>
                            <View className='flex-row items-center gap-2'>
                                <AppIcon
                                    family="MaterialCommunityIcons" name="circle"
                                    size={6}

                                />
                                <View className='flex-row ga--2'>
                                    <AppText variant={'label'} weight={'semibold'}>Series No : </AppText>
                                    <AppText variant={'label'} >{item?.serialNum}</AppText>
                                </View>
                            </View>
                        </View>
                        <View className='flex-row gap-2 px-2 items-center ml-9'>
                            <View className='flex-row items-center gap-2'>
                                <AppIcon
                                    family="MaterialCommunityIcons" name="circle"
                                    size={6}

                                />
                                <View className='flex-row ga--2 items-center '>
                                    <AppText variant={'label'} weight={'semibold'}>Location : </AppText>
                                    <AppText variant={'label'} numberOfLines={1} lineBreakMode='middle'  className='w-[75%]'>{item?.location
                                }-{item?.locationDescription}</AppText>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

            /> 
          
        </View>
    )
}

export default ActivityAssetInsList

