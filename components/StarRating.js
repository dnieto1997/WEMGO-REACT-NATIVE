import React from 'react';
import { View } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";

const StarRating = (props) => {
  // Generate an array of star icons
  const starIcons = Array.from({ length: props.totalStars }, (_, index) => (
    <Ionicons key={index} name="star" size={12} color="orange" />
  ));

  return <View style={{ flexDirection: 'row' }}>{starIcons}</View>;
};

export default StarRating;