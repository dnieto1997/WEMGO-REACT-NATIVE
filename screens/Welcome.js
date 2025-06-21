import React from 'react';
import {View, Text, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageContainer from '../components/PageContainer';
import Button from '../components/Button';
import Onboarding1Styles from '../styles/OnboardingStyles';
import {COLORS, images} from '../constants';

const Welcome = ({navigation}) => {
  return (
    <SafeAreaView style={Onboarding1Styles.container}>
      <PageContainer>
        <View style={Onboarding1Styles.contentContainer}>
          <Image
            source={images.onboarding1}
            resizeMode="contain"
            style={Onboarding1Styles.illustration}
          />
          <Image
            source={images.ornament}
            resizeMode="contain"
            style={Onboarding1Styles.ornament}
          />
          <View style={Onboarding1Styles.buttonContainer}>
            <View style={Onboarding1Styles.titleContainer}>
              <Text style={[Onboarding1Styles.title]}>Organized</Text>
              <Text style={Onboarding1Styles.subTitle}>A Premium Event</Text>
            </View>

            <Text style={Onboarding1Styles.description}>
              Find the Best event near you with just one of best app
            </Text>

            <Button
              title="Sign In"
              filled
              onPress={() => navigation.navigate('Login')}
              style={Onboarding1Styles.nextButton}
            />
            <Button
              title="Register By No"
              onPress={() => navigation.navigate('PhoneNumber')}
              textColor={COLORS.secondary}
              style={Onboarding1Styles.skipButton}
            />
          </View>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
};

export default Welcome;
