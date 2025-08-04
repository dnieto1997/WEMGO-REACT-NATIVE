import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import Header from '../components/Header';
import FollowerCard from '../components/FollowerCard';
import { getHttps } from '../api/axios';
import Tab from '../components/Tab';
import { KeyboardAvoidingView, Platform } from 'react-native';

const Following = ({ navigation, route }) => {
  const { id } = route.params;
  const [followers, setFollowers] = useState([]);
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const response = await getHttps(`followers/following/${id}`);
      setFollowers(response.data);
      setFilteredFollowers(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredFollowers(followers);
    } else {
      const filtered = followers.filter((follower) => {
        const fullName = `${follower.first_name} ${follower.last_name}`.toLowerCase();
        return fullName.includes(searchText.toLowerCase());
      });
      setFilteredFollowers(filtered);
    }
  }, [searchText, followers]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={{ marginTop: 20 }}>
            <Header title="Siguiendo" />
          </View>

          {!loading && followers.length > 0 && (
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>
          )}

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>
                Cargando personas que sigues...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFollowers}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={
                filteredFollowers.length === 0
                  ? styles.emptyContainer
                  : { paddingVertical: 16 }
              }
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>
                  Este usuario todavía no sigue a nadie
                </Text>
              )}
              renderItem={({ item }) => (
                <FollowerCard
                  onPress={() =>
                    navigation.navigate('FriendTimeline', { id: item.id })
                  }
                  avatar={{
                    uri: item.img
                      ? item.img
                      : 'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
                  }}
                  name={`${item.first_name} ${item.last_name}`}
                  checked={item.checked}
                />
              )}
              showsVerticalScrollIndicator={true}
              initialNumToRender={10}
              maxToRenderPerBatch={20}
              windowSize={21}
              removeClippedSubviews={true}
            />
          )}
        </View>

        <Tab />
        <View style={{ margin: 40 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black', // o COLORS.secondaryBlack
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#555',
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
});

export default Following;
