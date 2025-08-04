import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AddStory from './AddStory';
import CreateEventV2 from './CreateEventV2';
import Header from '../components/Header';
import CreateReel from './CreateReel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const TAB_HEIGHT = 80;

const ShareTypeScreen = () => {
  const [selectedTab, setSelectedTab] = useState('story');
  const insets = useSafeAreaInsets();

  const getTitle = () => {
    switch (selectedTab) {
      case 'story':
        return 'Nueva Historia';
      case 'publicacion':
        return 'Nueva Publicación';
      case 'reels':
        return 'Nuevo GoReel';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'story':
        return <AddStory />;
      case 'publicacion':
        return <CreateEventV2 />;
      case 'reels':
        return <CreateReel />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.headerContainer, { top: insets.top + 10, left: 10 }]}>
        <Header title={getTitle()} />
      </View>

      {/* Contenido */}
      <View style={{ width, height: height - TAB_HEIGHT }}>
        <View style={{ flex: 1 }}>{renderContent()}</View>
      </View>

      {/* Tabs */}
    <View style={styles.tabsWrapper}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === 'story' && styles.tabSelected]}
      onPress={() => setSelectedTab('story')}
    >
      <MaterialIcons
        name="motion-photos-on"
        size={20}
        color="#fff"
        style={styles.icon}
      />
      <Text style={styles.tabText}>Historia</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tabButton, selectedTab === 'publicacion' && styles.tabSelected]}
      onPress={() => setSelectedTab('publicacion')}
    >
      <MaterialIcons
        name="post-add"
        size={20}
        color="#fff"
        style={styles.icon}
      />
      <Text style={styles.tabText}>Publicación</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tabButton, selectedTab === 'reels' && styles.tabSelected]}
      onPress={() => setSelectedTab('reels')}
    >
      <MaterialIcons
        name="video-library"
        size={20}
        color="#fff"
        style={styles.icon}
      />
      <Text style={styles.tabText}>Reels</Text>
    </TouchableOpacity>
  </ScrollView>
</View>

    </SafeAreaView>
  );
};

export default ShareTypeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 20,
  },
  icon: {
  marginRight: 6,
},
  tabsWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(18,18,18,0.95)',
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderColor: '#2e2e2e',
  },
  scrollContent: {
     paddingHorizontal: 10,
  alignItems: 'center',
  flexDirection: 'row',
  },
  tabButton: {
    flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 20,
  marginHorizontal: 6,
  borderRadius: 30,
  backgroundColor: '#222',
  borderWidth: 1,
  borderColor: '#333',
  },
  tabSelected: {
    backgroundColor: '#944af5',
    borderColor: '#944af5',
    shadowColor: '#944af5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
