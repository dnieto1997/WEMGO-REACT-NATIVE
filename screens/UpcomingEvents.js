import {View, StyleSheet, FlatList} from 'react-native';
import React, {useEffect} from 'react';
import {COLORS} from '../constants';
import {SafeAreaView} from 'react-native-safe-area-context';
import HeaderV2 from '../components/HeaderV2';
import {ScrollView} from 'react-native-virtualized-view';
import {upcomingEvents} from '../data';
import UpcomingEventItem from '../components/UpcomingEventItem';
import {getHttps} from '../api/axios';

const UpcomingEvents = () => {
  const callApi = async () => {
    try {
      const response = await getHttps('event');

    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    callApi();
  }, []);

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <HeaderV2 title="Upcoming Events" />
        <ScrollView
          style={{marginVertical: 16}}
          showsVerticalScrollIndicator={false}>
          <FlatList
            data={upcomingEvents}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <UpcomingEventItem
                image={item.image}
                title={item.title}
                address={item.address}
                date={item.date}
                onPress={() => console.log('New Year Explore Event')}
                attenderImage1={item.attenderImage1}
                attenderImage2={item.attenderImage2}
              />
            )}
          />
        </ScrollView>
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
});
export default UpcomingEvents;
