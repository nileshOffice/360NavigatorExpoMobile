import clsx from "clsx";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CardProps } from "./Card.types";

const Card = ({
  children,
  className,
pressable = false,
  onPress,
  ...props
}:  CardProps) => {

   
        



    if (pressable) {
    return (
        <Pressable
      
        accessibilityRole="button"
        accessibilityLabel="Card"
        className={clsx(
            "rounded-xl p-4 shadow-sm! border border-border-light",
            className
        )}
       
        onPress={onPress}
        {...props}
        >
        {children}
        </Pressable>
    );
}
    if (!pressable) {
        return (
            <View style={styles.appCard}

                className={clsx(
                    " rounded-xl p-4  shadow-sm! border border-border-light bg-surface",
                    className
                )}
                {...props}
            >
                {children}
            </View>
        );
    }
};

export default Card;
const styles = StyleSheet.create({
    appCard: {
        backgroundColor: '#FFFFFF',

        // ─────────────────────────────
        // Android Shadow
        // ─────────────────────────────
        elevation: 10,

        // ─────────────────────────────
        // iOS Shadow
        // ─────────────────────────────
        shadowColor: 'rgba(15, 23, 42, 0.20)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.10,
        shadowRadius: 20,
        zIndex: 1,
    },
})