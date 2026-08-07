import { cn } from "@/app/lib/cn";
import { AntDesign, Feather, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";


type IconFamily = | 'Ionicons'| 'MaterialCommunityIcons'| 'Feather'| 'AntDesign' | 'FontAwesome6';

interface AppIconProps {
    family?:IconFamily,
    name?:string,
    size?:number,
    color?:string,
    className?:string
}





export default function AppIcon({family = 'Ionicons',name,size = 20, color = '#000000',className}: AppIconProps){
    const IconMap = {
        Ionicons,
        MaterialCommunityIcons,
        Feather,
        AntDesign,
        FontAwesome6,

    }

    const IconComponent = IconMap[family];
    return (
        <IconComponent name={name as any} size={size}  className={cn("text-icon")}/>
    )
}

{/* <AppIcon family="Feather" name="sliders"size={22}color="#172033"/>

<AppIcon family="Feather" name="user" size={24} color="#172033"/>

<AppIcon family="Feather" name="chevron-right" size={24}color="#0A84FF"/>
    */}



