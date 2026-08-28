import CompanyLogo from '@/assets/images/360Nav_logo.svg';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { HEADER_CONFIG } from '../../config/headerConfig';
import AppIcon from '../ui/AppIcon';

type HeaderProps = {
  setSidebarOpen: (value: boolean) => void;
};

const Header = ({ setSidebarOpen }: HeaderProps ) => {
    const router = useRouter();
    const segments = useSegments();
    const routeName = segments[segments.length - 1];
    const config = HEADER_CONFIG[routeName] ?? {
    title: '',
    showBack: true,
    showMenu: false,
    showLogo: false,
    };


    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        }
        else {
            router.replace('/main');
        }
    };

  
    return (
        <View style={styles.header}>
            <View className="h-14 flex-row items-center px-4">

                {/* LEFT SIDE */}
                <View className="flex-1 flex-row items-center">

                    {/* HOME → MENU */}
                    {config.showMenu && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Toggle menu"
                            className="h-10 w-10 items-center justify-center"
                            onPress={() => setSidebarOpen(true)}
                        >
                            <AppIcon
                                family="Feather"
                                name="menu"
                                size={28}
                                color="#000000"
                            />
                        </Pressable>
                    )}

                    {/* OTHER SCREENS → BACK */}
                    {config.showBack && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                            className="h-10 w-10 items-center justify-center"
                            onPress={handleBack}
                        >
                            <AppIcon
                                family="Feather"
                                name="arrow-left"
                                size={28}
                                color="#000000"
                            />
                        </Pressable>
                    )}

                   

                </View>

                {/* LOGO */}
                {config.showLogo && (
                    <View>
                        <CompanyLogo
                            width={120}
                            height={56}
                        />
                    </View>
                )}
                 {/* SCREEN TITLE */}
                    {config.title && (
                        <Text className="ml-3 text-lg font-semibold text-gray-900">
                            {config?.title}
                        </Text>
                    )}

                {/* RIGHT SIDE */}
                <View className="flex-1 items-end">
                    {/* You can put profile icon here later */}
                </View>

            </View>
        </View>
    )
}

export default Header


//   --shadow-color: rgba(15, 23, 42, 0.08);

//   --shadow-sm: rgba(15, 23, 42, 0.04);
//   --shadow-md: rgba(15, 23, 42, 0.08);
//   --shadow-lg: rgba(15, 23, 42, 0.12);


const styles = StyleSheet.create({
    header: {
        //backgroundColor: '#F8FAFC',
        // ─────────────────────────────
        // Android Shadow
        // ─────────────────────────────
        elevation: 10,

        // ─────────────────────────────
        // iOS Shadow
        // ─────────────────────────────
        shadowColor: 'rgba(15, 23, 42, 0.25)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1.41,
        zIndex: 10,
    },
})