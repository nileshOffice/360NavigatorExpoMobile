import { useLogoutUserMutation } from '@/app/auth/authApi';
import { logout, setSiteSelectionOpen } from '@/app/auth/authSlice';
import AppIcon from '@/app/common/components/ui/AppIcon';
import { AppText } from '@/app/common/components/ui/Typography';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { persistor } from '@/app/lib/store/store';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Pressable,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = styled(RNSafeAreaView);




interface SidebarProps {
    visible: boolean;
    onClose: () => void;
    onProfilePress?: () => void;
  
    onLogoutPress?: () => void;
}

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.82;

const Sidebar = ({
    visible,
    onClose,
    onProfilePress,
    onLogoutPress,
}: SidebarProps) => {
    const translateX = useSharedValue(-SIDEBAR_WIDTH);
    const overlayOpacity = useSharedValue(0);
    //------------ state Defind Here ----------------------
    const { currentUser,selectedSite } = useAppSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation()
    const router = useRouter();
    const dispatch = useAppDispatch();

  

    const onSiteChangePress = () => {
        dispatch(setSiteSelectionOpen(true));
    };

    const handleLogout = async (isFullyLogout: boolean) => {
    try {
        if (!currentUser) {
        await persistor.purge();
        router.replace("/auth");
        return;
        }

        const idDto = {
        id21: Number(currentUser.sessionId),
        id22: Number(currentUser.userId),
        id51: isFullyLogout,
        };

        // 1. Call logout API
        await logoutUser(idDto).unwrap();

        // 2. Clear Redux state
        dispatch(logout());

        // 3. If total logout, clear persisted Redux data
        if (isFullyLogout) {
        await persistor.flush();
        await persistor.purge();
        }

        // 4. Go to login
        router.replace("/auth");

    } catch (error) {
        console.error("Logout API error:", error);
    }
    };

    //------------ state Defind Here ----------------------

    useEffect(() => {
        if (visible) {
            translateX.value = withTiming(0, {
                duration: 280,
            });

            overlayOpacity.value = withTiming(1, {
                duration: 250,
            });
        } else {
            translateX.value = withTiming(-SIDEBAR_WIDTH, {
                duration: 240,
            });

            overlayOpacity.value = withTiming(0, {
                duration: 200,
            });
        }
    }, [visible]);

    const sidebarStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value,
            },
        ],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    if (!visible) {
        return null;
    }



  


    return (
        <View className="absolute inset-0 z-50 flex-row">

            {/* Sidebar */}
            <Animated.View
                style={[
                    {
                        width: SIDEBAR_WIDTH,
                    },
                    sidebarStyle,
                ]}
                className="h-full bg-white shadow-2xl dark:bg-slate-900"
            >
                <SafeAreaView className="flex-1">

                    {/* Header */}
                    <View className="border-b border-slate-200 px-5 py-5 dark:border-slate-700">

                        <View className="flex-row items-center">

                            {/* Avatar */}
                            <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <AppIcon
                                    family="Feather"
                                    name="user"
                                    size={22}
                                    color="#2563eb"
                                />
                            </View>

                            <View className="ml-3 flex-1">
                                <AppText className="text-base font-semibold text-slate-900 dark:text-white">
                                   {currentUser?.fullName}
                                </AppText>

                             
                                  <AppText className="text-sm text-slate-500 dark:text-slate-400">
                                    Site Name: {selectedSite?.siteName}
                                </AppText>
                               
                            </View>

                            {/* Close */}
                            <Pressable
                                onPress={onClose}
                                className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                            >
                                <AppIcon
                                    family="Feather"
                                    name="x"
                                    size={20}
                                    color="#64748b"
                                />
                            </Pressable>

                        </View>
                    </View>

                    {/* Menu */}
                    <View className="px-3 py-4">

                        {/* Profile */}
                        <Pressable
                            onPress={onProfilePress}
                            className="mb-1 flex-row items-center rounded-xl px-3 py-3"
                        >
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                <AppIcon
                                    family="Feather"
                                    name="user"
                                    size={20}
                                    color="#64748b"
                                />
                            </View>

                            <AppText className="ml-3 flex-1 text-base text-slate-700 dark:text-slate-200">
                                My Profile
                            </AppText>

                            <AppIcon
                                family="Feather"
                                name="chevron-right"
                                size={16}
                                color="#94a3b8"
                            />
                        </Pressable>

                        {/* Change Site */}
                        <Pressable
                            onPress={onSiteChangePress}
                            className="mb-1 flex-row items-center rounded-xl px-3 py-3"
                        >
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                <AppIcon
                                    family="Feather"
                                    name="map-pin"
                                    size={20}
                                    color="#64748b"
                                />
                            </View>

                            <View className="ml-3 flex-1">
                                <AppText className="text-base text-slate-700 dark:text-slate-200">
                                    Change Site
                                </AppText>
                              
                                <AppText className="text-xs text-slate-500 dark:text-slate-400">
                                    Switch your current site
                                </AppText>
                            </View>

                            <AppIcon
                                family="Feather"
                                name="chevron-right"
                                size={16}
                                color="#94a3b8"
                            />
                        </Pressable>

                    </View>

                    {/* Logout */}
                    <View className="mt-auto border-t border-slate-200 px-3 py-4 dark:border-slate-700">

                        <Pressable
                             onPress={() => handleLogout(true)}
                            className="flex-row items-center rounded-xl px-3 py-3"
                        >
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
                                <AppIcon
                                    family="Feather"
                                    name="log-out"
                                    size={20}
                                    color="#ef4444"
                                />
                            </View>

                            <AppText className="ml-3 text-base font-medium text-red-500!" >
                                Logout
                            </AppText>
                        </Pressable>

                    </View>

                </SafeAreaView>
            </Animated.View>

            {/* Overlay */}
            <Animated.View
                style={overlayStyle}
                className="flex-1 bg-black/40"
            >
                <Pressable
                    className="flex-1"
                   onPress={onClose}
                />
            </Animated.View>

        </View>
    );
};

export default Sidebar;