import { useLogoutUserMutation } from '@/src/auth/authApi';
import { setSiteSelectionOpen } from '@/src/auth/authSlice';
import { resetSessionState } from '@/src/auth/session';
import { APP_ROUTES } from '@/src/common/config/routes';
import AppIcon from '@/src/common/components/ui/AppIcon';
import { AppText } from '@/src/common/components/ui/Typography';
import { useAppDispatch, useAppSelector } from '@/src/lib/store/hooks';
import { persistor } from '@/src/lib/store/store';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Pressable,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    runOnJS,
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


const Sidebar = ({
    visible,
    onClose,
    onProfilePress,
    onLogoutPress,
}: SidebarProps) => {
    const { width: windowWidth } = useWindowDimensions();
    const SIDEBAR_WIDTH = Math.min(windowWidth * 0.82, 360);
    const translateX = useSharedValue(-SIDEBAR_WIDTH);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Stays mounted until the slide-out animation has finished; previously
    // the drawer disappeared instantly on close.
    const [isMounted, setIsMounted] = useState(visible);
    if (visible && !isMounted) {
        setIsMounted(true);
    }
    const overlayOpacity = useSharedValue(0);
    //------------ state Defind Here ----------------------
    const { currentUser,selectedSite } = useAppSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation()
    const router = useRouter();
    const dispatch = useAppDispatch();

  

    const onSiteChangePress = () => {
        onClose();
        dispatch(setSiteSelectionOpen(true));
    };

    // Android back closes the drawer instead of leaving the screen.
    useEffect(() => {
        if (!visible) return;
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });
        return () => subscription.remove();
    }, [visible, onClose]);

    const confirmLogout = () => {
        if (isLoggingOut) return;
        Alert.alert(
            'Logout',
            'Do you want to logout from this session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => handleLogout(true),
                },
            ],
            { cancelable: true },
        );
    };

    const handleLogout = async (isFullyLogout: boolean) => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            if (currentUser) {
                // Tell the server the session ended. Failure (offline,
                // expired session) must not trap the user in the app.
                await logoutUser({
                    id21: Number(currentUser.sessionId),
                    id22: Number(currentUser.userId),
                    id51: isFullyLogout,
                })
                    .unwrap()
                    .catch((error) => {
                        if (__DEV__) {
                            console.warn('Logout API error:', error);
                        }
                    });
            }
        } finally {
            onClose();
            resetSessionState(dispatch);

            if (isFullyLogout) {
                await persistor.flush();
                await persistor.purge();
            }

            setIsLoggingOut(false);
            router.replace(APP_ROUTES.auth);
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
            }, (finished) => {
                if (finished) {
                    runOnJS(setIsMounted)(false);
                }
            });

            overlayOpacity.value = withTiming(0, {
                duration: 200,
            });
        }
    }, [visible, SIDEBAR_WIDTH]);

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

    if (!isMounted) {
        return null;
    }



  


    return (
        <View
            className="absolute inset-0 z-50 flex-row"
            // Don't block the screen while the close animation runs.
            pointerEvents={visible ? 'auto' : 'none'}
        >

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
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel="Close menu"
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
                        {/* Profile screen is not built yet: the row is shown but not tappable. */}
                        <Pressable
                            onPress={onProfilePress}
                            disabled={!onProfilePress}
                            accessibilityRole="button"
                            accessibilityLabel="My Profile"
                            accessibilityState={{ disabled: !onProfilePress }}
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
                            accessibilityRole="button"
                            accessibilityLabel="Change Site"
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
                            onPress={confirmLogout}
                            disabled={isLoggingOut}
                            accessibilityRole="button"
                            accessibilityLabel="Logout"
                            accessibilityState={{ disabled: isLoggingOut, busy: isLoggingOut }}
                            className="flex-row items-center rounded-xl px-3 py-3"
                        >
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
                                {isLoggingOut ? (
                                    <ActivityIndicator size="small" color="#ef4444" />
                                ) : (
                                    <AppIcon
                                        family="Feather"
                                        name="log-out"
                                        size={20}
                                        color="#ef4444"
                                    />
                                )}
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
                    accessibilityRole="button"
                    accessibilityLabel="Close menu"
                />
            </Animated.View>

        </View>
    );
};

export default Sidebar;