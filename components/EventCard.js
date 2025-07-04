import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const EventCard = ({ event, navigation }) => {
  const banner = JSON.parse(event.img || '[]')[0]; // obtener primer banner del array
  const title = event.name;
  const location = event.city;
  const date = new Date(event.initial_date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handlePress = () => {
    navigation.navigate('EventDetails', { id: event.id });
  };

  return (
    <ImageBackground
      source={{ uri: banner }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{date}  {location}</Text>
        </View>

        <TouchableOpacity style={styles.joinButton} onPress={handlePress}>
          <Text style={styles.joinText}>Unirme</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: '#a64bf4',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  joinText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EventCard;
