import React from 'react';
import {
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const StoriesList = ({ stories, navigation, DataUser }) => {
 
  const filteredStories = stories?.filter(item => item.user.id !== DataUser?.id) || [];

  return (
    <FlatList
      data={filteredStories}
      horizontal
      keyExtractor={(item, index) => `${item.user?.id}-${index}`}
      contentContainerStyle={styles.storiesContainer}
      ListHeaderComponent={
        <View style={styles.storyItem}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ViewStories', { id: DataUser?.id })}
          >
            <Image
              source={{
                uri:
                  DataUser?.img ||
                  'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
              }}
              style={styles.storyImage}
            />
          </TouchableOpacity>
         <TouchableOpacity
  onPress={() => navigation.navigate('AddStory')}
  style={styles.plusIcon}
>
  <MaterialIcons name="add" size={23} color="white" />
</TouchableOpacity>
          <Text style={styles.storyText}>Tu Historia</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ViewStories', { id: item.user.id })}
          style={styles.storyItem}
        >
          {item.stories[0]?.isLoading ? (
            <View style={[styles.storyImage, styles.loaderContainer]}>
              <ActivityIndicator size="small" color="#944af5" />
            </View>
          ) : (
            <Image
              source={{
                uri:
                  item.stories[0]?.storyUrl || item.user?.img ||
                  'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
              }}
              style={styles.storyImage}
            />
          )}
          <Text style={styles.storyText} numberOfLines={1}>
            {item.user.first_name} {item.user.last_name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  storiesContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  storyImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: '#864ae8',
  },
  storyText: {
    fontSize: 12,
    color: '#fff',
    width: 70,
    textAlign: 'center',
    marginTop: 4,
  },
  plusIcon: {
    position: 'absolute',
    top:35,
    right: -1,
    backgroundColor: '#864ae8',
    width: 22,
    height: 22,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  plusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -1,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
  },
});

export default StoriesList;
