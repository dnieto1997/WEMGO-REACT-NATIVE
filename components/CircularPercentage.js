import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants';


const CircularPercentage = ({ percentage, radius }) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View>
            <Svg height={radius * 2} width={radius * 2}>
                <Circle
                    cx={radius}
                    cy={radius}
                    r={radius - 5}
                    stroke="#d3d3d3"
                    strokeWidth={5}
                    fill="none"
                />
                <Circle
                    cx={radius}
                    cy={radius}
                    r={radius - 5}
                    stroke={COLORS.primary}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                />
            </Svg>
            <Text style={{ 
                textAlign: 'center', 
                position: "absolute",  
                bottom: 20,
                right: 12,
                fontFamily: "Roboto Bold"
                }}>{`${percentage}%`}</Text>
        </View>
    );
};

export default CircularPercentage;