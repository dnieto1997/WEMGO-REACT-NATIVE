import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, SIZES, icons} from '../constants';
import Button from '../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Gender = ({navigation}) => {
  const [selectedGender, setSelectedGender] = useState(null);

  const handleGenderSelection = gender => {
    setSelectedGender(gender);
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconContainer}>
            <Image source={icons.back} style={styles.back} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gender</Text>
        </View>
        <Text style={styles.title}>What is your gender?</Text>
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 32,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            style={[
              styles.genderContainer,
              selectedGender === 'male' && {
                borderColor: COLORS.primary,
                borderWidth: 1,
              },
            ]}
            onPress={() => handleGenderSelection('male')}>
            <View style={styles.iconContainer}>
              <Ionicons name="male-outline" color={COLORS.white} size={30} />
            </View>
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderContainer,
              selectedGender === 'female' && {
                borderColor: COLORS.primary,
                borderWidth: 1,
              },
            ]}
            onPress={() => handleGenderSelection('female')}>
            <View style={styles.iconContainer}>
              <Ionicons name="female-outline" color={COLORS.white} size={30} />
            </View>
            <Text style={styles.genderText}>Female</Text>
          </TouchableOpacity>
        </View>
        <Button
          title="Continue"
          filled
          onPress={() => navigation.navigate('Interests')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: SIZES.width - 32,
  },
  headerIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    height: 16,
    width: 16,
    tintColor: COLORS.black,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Roboto Black',
    position: 'absolute',
    right: (SIZES.width - 32) / 2 - 32,
    color: 'black',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Roboto Regular',
    color: COLORS.black,
    marginVertical: 22,
  },
  genderContainer: {
    width: (SIZES.width - 32) / 2 - 12,
    height: 180,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    height: 75,
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },
  genderText: {
    fontSize: 18,
    fontFamily: 'Roboto Medium',
    color: COLORS.black,
    marginTop: 22,
  },
});
export default Gender;
