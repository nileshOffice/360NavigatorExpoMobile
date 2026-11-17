import AppIcon from '@/src/common/components/ui/AppIcon';
import { AppText, Heading } from '@/src/common/components/ui/Typography';
import type { ReactNode } from 'react';
import { FlatList, Pressable, View } from 'react-native';


type ActivityInstructmentAssetListProps = {
  activityInstrumentAssetList:any;
onHandleExercise: (selectedExercise: any) => void;
  isLoading: boolean;
  isFetching:boolean;
  borderColor:any;
};

/**
 * One "Label : value" line. The value truncates instead of running past the
 * card edge on narrow screens / large font sizes.
 */
const DetailRow = ({ label, value, ellipsizeMode = 'tail' }: { label: string; value: ReactNode; ellipsizeMode?: 'tail' | 'middle' }) => (
    <View className='flex-row gap-2 px-2 items-center ml-9'>
        <View className='flex-1 flex-row items-center gap-2'>
            <AppIcon
                family="MaterialCommunityIcons" name="circle"
                size={6}

            />
            <View className='flex-1 flex-row gap-1 items-center'>
                <AppText variant={'label'} weight={'semibold'}>{label} : </AppText>
                <AppText variant={'label'} numberOfLines={1} ellipsizeMode={ellipsizeMode} className='flex-1'>{value}</AppText>
            </View>
        </View>
    </View>
);

const ActivityAssetInsList = ({ activityInstrumentAssetList ,isLoading, borderColor,onHandleExercise }:ActivityInstructmentAssetListProps) => {


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
                // New (unsynced) assets can have a null id; .toString() crashed.
                keyExtractor={(item, index) => `${item?.id ?? item?.assetNum ?? 'asset'}-${index}`}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => onHandleExercise(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`${item?.assetNum ?? ''} ${item?.name ?? ''}`.trim() || 'Asset'}
                        // Press feedback, same ripple colour as Card.
                        android_ripple={{ color: "rgba(37, 99, 235, 0.08)", borderless: false }}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
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
                            <DetailRow label="Manufacturer" value={item?.manufacturer} />
                            <DetailRow label="Model" value={item?.makeModel} />
                            <DetailRow label="Serial No" value={item?.serialNum} />
                            <DetailRow
                                label="Location"
                                value={`${item?.location ?? ''}-${item?.locationDescription ?? ''}`}
                                ellipsizeMode="middle"
                            />
                        </View>
                    </Pressable>

                )}

            />

        </View>
    )
}

export default ActivityAssetInsList

