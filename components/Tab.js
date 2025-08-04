import { View, Text, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { COLORS } from '../constants';

const Tab = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const screens = [
      
        { name: "Event", route: "Event", icon: "home", iconType: "MaterialCommunityIcons" },
          { name: "Explore", route: "Explore", icon: "calendar-outline", iconType: "MaterialCommunityIcons" },
        { name: "Create", route: "ShareTypeScreen", icon: "plus", iconType: "Entypo", isCenter: true },
        { name: "Reels", route: "Reels", icon: "motion-play", iconType: "MaterialCommunityIcons" },
        { name: "Profile", route: "Profile", icon: "account-edit", iconType: "MaterialCommunityIcons" },
    ];

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                height: Platform.OS === 'ios' ? 80 : 70,
                backgroundColor: COLORS.white,
                borderRadius: 40,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                paddingHorizontal: 10,
                borderTopWidth: 0,
                zIndex: 100
            }}
        >
            {screens.map(({ name, route: targetRoute, icon, iconType, isCenter }) => {
                const isFocused = route.name === targetRoute;
                const iconColor = isFocused ? "#944af5" : COLORS.black;

                return (
                    <TouchableOpacity
                        key={name}
                        onPress={() => navigation.navigate(targetRoute)}
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                        <View style={
                            isCenter
                                ? {
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: "#9550f3",
                                    height: Platform.OS == 'ios' ? 60 : 50,
                                    width: Platform.OS == 'ios' ? 60 : 50,
                                    borderRadius: Platform.OS == 'ios' ? 35 : 30,
                                    borderWidth: 2,
                                    borderColor: COLORS.white,
                                    top: 0.5
                                }
                                : {}
                        }>
                            {iconType === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={icon} size={30} color={isCenter ? COLORS.white : iconColor} />}
                            {iconType === 'Entypo' && <Entypo name={icon} size={30} color={isCenter ? COLORS.white : iconColor} />}
                            {iconType === 'MaterialIcons' && <MaterialIcons name={icon} size={30} color={iconColor} />}
                            {iconType === 'FontAwesome5' && <FontAwesome5 name={icon} size={24} color={iconColor} />}
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    );
};

export default Tab;
