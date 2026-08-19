import CompanyLogo from '@/assets/images/360Nav_logo.svg';
import React, { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import AppIcon from '../ui/AppIcon';
const Header = ({setSidebarOpen}:any) => {

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
    return (
        <View style={styles.header} className="">
            <View className="h-16 flex-row justify-between items-center px-6">


                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Toggle menu"
                    className={`h-10 w-10 items-center justify-center`}
                   onPress={() => setSidebarOpen(true)}
                >
                    <AppIcon family="Feather" name="menu" size={28} color="#000000" />
                </Pressable>

                <View>
                    <CompanyLogo width={120} height={56} />
                </View>

               <View><Text>&nbsp;</Text></View>
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
        backgroundColor: '#F8FAFC',

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