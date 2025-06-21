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

const StoriesList = ({ stories, navigation, DataUser, User }) => {
  return (
    <FlatList
      data={stories.filter(item => item.user.id !== DataUser.id)}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.storiesContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ViewStories', { id: item.user.id })}
          style={styles.storyItem}
        >
          {item.stories[0].isLoading ? (
            <View style={[styles.storyImage, styles.loaderContainer]}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <Image
              source={{
                uri: item.stories.length > 0 ? item.stories[0].storyUrl : item.user.img,
              }}
              style={styles.storyImage}
            />
          )}
          <Text style={styles.storyText} numberOfLines={1}>
            {item.user.first_name} {item.user.last_name}
          </Text>
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <View style={styles.storyItem}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ViewStories', { id: DataUser.id })}
            style={styles.storyButton}
          >
            <Image
              source={{
                uri: User?.img ||
                  'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png',
              }}
              style={styles.storyImage}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddStory')}
            style={styles.plusIcon}
          >
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>

          <Text style={styles.storyText}>Tu Historia</Text>
        </View>
      }
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
    borderWidth: 2,
    borderColor: 'white',
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
    bottom: 0,
    right: 0,
    top: 10,
    backgroundColor: 'black',
    width: 23,
    height: 23,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyButton: {
    // Espacio reservado si quieres añadir estilo al botón principal
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444', // opcional, para que no se vea vacío
  },
});

export default StoriesList;
