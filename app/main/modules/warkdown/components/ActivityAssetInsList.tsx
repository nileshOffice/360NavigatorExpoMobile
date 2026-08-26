import AppIcon from '@/app/common/components/ui/AppIcon'
import { AppText, Heading } from '@/app/common/components/ui/Typography'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const ActivityAssetInsList = () => {
    return (
        <View>
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
                        size={6}

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
                        size={6}

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
                        size={6}

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
                        size={6}

                    />
                    <View className='flex-row ga--2'>
                        <AppText variant={'label'} weight={'semibold'}>Location : </AppText>
                        <AppText variant={'label'} >India</AppText>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ActivityAssetInsList

const styles = StyleSheet.create({})