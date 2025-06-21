import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getHttps, patchHttpsStories } from '../api/axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

const EditFeed = ({ socket, sendNewFeed }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [feed, setFeed] = useState(null);
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
   const [updating, setUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, [id]);

  const fetchFeed = async () => {
    try {
      const response = await getHttps(`feed/${id}`);
      setFeed(response.data);
      setDescription(response.data.feed_description);
      setExistingImages(JSON.parse(response.data.feed_img || '[]'));
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        const selectedImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`
        }));
        setNewImages([...newImages, ...selectedImages]);
      }
    });
  };

  const removeExistingImage = (uri) => {
    setExistingImages(existingImages.filter(img => img !== uri));
  };

  const removeNewImage = (uri) => {
    setNewImages(newImages.filter(img => img.uri !== uri));
  };

  const handleUpload = async () => {
    if (existingImages.length === 0 && newImages.length === 0) {
      Alert.alert('Error', 'Debe seleccionar al menos una imagen.');
      return;
    }
  
    setUpdating(true);
    setUpdateSuccess(false);
  
    let success = false;
    let attempt = 0;
  
    while (!success) {
      try {
        attempt++;
        const formData = new FormData();
  
        [...existingImages, ...newImages.map(img => img.uri)].forEach((uri, index) => {
          formData.append('actfeed', {
            uri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
          });
        });
  
        formData.append('description', description);
  
        console.log(`🔄 Intento de actualización #${attempt}`);
  
        await patchHttpsStories(`feed/${id}`, formData, true);
  
        console.log('✅ Publicación actualizada correctamente');
        setUpdateSuccess(true);
        success = true; // ✅ La actualización fue exitosa
  
        Alert.alert('Éxito', 'Publicación actualizada correctamente.');
  
        setTimeout(() => {
          setUpdating(false);
          setUpdateSuccess(false);
          navigation.goBack(); // Solo se regresa si la actualización fue exitosa
        }, 2000);
      } catch (error) {
        console.error(`⚠️ Error en intento #${attempt}, reintentando...`, error);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos antes de reintentar
      }
    }
  };
  
  
  
  

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Editar Publicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      <FlatList
        data={[...existingImages.map(uri => ({ uri })), ...newImages]}
        horizontal
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => item.name ? removeNewImage(item.uri) : removeExistingImage(item.uri)}>
              <Icon name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={pickImage}>
        <Text style={styles.addButtonText}>Añadir Imagen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={handleUpload}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Actualizar Publicación</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backButton: { position: 'absolute', top: 10, left: 10, zIndex: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20,color:'black' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 20,color:'black' },
  imageWrapper: { position: 'relative', marginRight: 10 },
  image: { width: 150, height: 150, borderRadius: 8 },
  removeButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'red', borderRadius: 15, padding: 5 },
  addButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, marginTop: 10 },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  saveButton: { backgroundColor: 'green', padding: 15, borderRadius: 8, marginTop: 20 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

export default EditFeed;
