import CompanyLogo from '@/assets/images/360Nav_logo.svg';
import { useRouter } from 'expo-router';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { pressHeaderBack } from '../../hooks/headerSlice';
import AppIcon from '../ui/AppIcon';

type HeaderProps = {
    setSidebarOpen: (value: boolean) => void;
};




const Header = ({ setSidebarOpen }: HeaderProps) => {

    const router = useRouter();
    const dispatch = useAppDispatch();


    const {
        title,
        showBack,
        showMenu,
        showLogo,
        backAction,
    } = useAppSelector((state) => state.header);

    

    const handleBack = () => {

        if (backAction === 'custom') {
            dispatch(pressHeaderBack());
            return;
        }

        if (backAction === 'main') {
            router.replace('/main');
            return;
        }

        if (backAction === 'goBack') {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/main');
            }
        }
    };

    return (
        <View style={styles.header}>

            <View className="h-14 flex-row items-center px-4">

                {/* LEFT SIDE */}
                <View className="flex-1 flex-row items-center">

                    {/* MENU */}
                    {showMenu && (
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

                    {/* BACK */}
                    {showBack && (
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
                {showLogo && (
                    <View>
                        <CompanyLogo
                            width={120}
                            height={56}
                        />
                    </View>
                )}

                {/* TITLE */}
                {title && (
                    <Text className="ml-3 text-lg font-semibold text-gray-900">
                        {title}
                    </Text>
                )}

                {/* RIGHT SIDE */}
                <View className="flex-1 items-end" />

            </View>

        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    header: {
        elevation: 10,

        shadowColor: 'rgba(15, 23, 42, 0.25)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1.41,

        zIndex: 10,
    },
});