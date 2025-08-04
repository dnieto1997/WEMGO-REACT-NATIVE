import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const NeonFrame = () => {
  const isDark = useColorScheme() === 'dark';
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
  }, []);

const animatedStyle = useAnimatedStyle(() => {
  const color = interpolateColor(
    progress.value,
    [
      0, 0.1, 0.2, 0.3, 0.4,
      0.5, 0.6, 0.7, 0.8, 0.9,
      1
    ],
    [
      '#0F0F0F', // negro profundo
      '#013220', // verde matrix
      '#1B003A', // púrpura apagado
      '#222244', // azul grisáceo
      '#2E0854', // púrpura elegante
      '#9400FF', // violeta neón
      '#00FFFF', // cian brillante
      '#FF00FF', // magenta neón
      '#FFFFFF', // blanco brillante
      '#00FF9F', // verde neón
      '#12C2E9'  // azul eléctrico
    ]
  );
  return {
    borderColor: color,
  };
});


  return (
    <View pointerEvents="none" style={styles.container}>
      {/* Brillo morado en los 4 lados del marco */}
      <LinearGradient
        colors={['#9400FF66', '#C471ED33', 'transparent']}
        style={[styles.glow, styles.leftGlow]}
        start={{ x: 1, y: 0.5 }}
        end={{ x: 0, y: 0.5 }}
      />
      <LinearGradient
        colors={['transparent', '#C471ED33', '#12C2E966']}
        style={[styles.glow, styles.rightGlow]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
      <LinearGradient
        colors={['#9400FF44', '#C471ED22', 'transparent']}
        style={[styles.glow, styles.topGlow]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
      />
      <LinearGradient
        colors={['transparent', '#C471ED22', '#12C2E944']}
        style={[styles.glow, styles.bottomGlow]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Marco animado con borde dinámico */}
      <Animated.View style={[styles.border, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    width: width * 0.96,
    height: height * 0.98,
    borderWidth: 2,
    borderRadius: 10,
    position: 'absolute',
    zIndex: 100,
  },
  glow: {
    position: 'absolute',
    zIndex: 99,
  },
  leftGlow: {
    width: 30,
    height,
    left: -20,
  },
  rightGlow: {
    width: 30,
    height: height * 0.98,
    right: 5,
    top: height * 0.01,
  },
  topGlow: {
    height: 30,
    width,
    top: -20,
  },
    bottomGlow: {
    height: 30,
    width: width * 0.96,
    bottom: 5,
    left: width * 0.02,
  },
});

export default NeonFrame;
