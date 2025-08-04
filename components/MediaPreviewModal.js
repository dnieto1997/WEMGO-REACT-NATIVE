import React from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MediaPreviewModal = ({
  visible,
  onClose,
  selectedMedia,
  setSelectedMedia,
  caption,
  setCaption,
  onUpload,
  isUploading
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cerrar */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Previsualización horizontal */}
          <FlatList
            horizontal
            data={selectedMedia}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.previewList}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={styles.previewItem}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    setSelectedMedia(prev => prev.filter((_, i) => i !== index))
                  }
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>

                {item.type?.startsWith('image') ? (
                  <Image source={{ uri: item.uri }} style={styles.previewImage} />
                ) : (
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.previewImage}
                    muted
                    paused
                    resizeMode="cover"
                  />
                )}
              </View>
            )}
          />

          {/* Input de descripción */}
          <TextInput
            style={styles.input}
            placeholder="Escribe una descripción..."
            placeholderTextColor="#888"
            value={caption}
            onChangeText={setCaption}
            multiline
          />

          {/* Botón de subir */}
          <TouchableOpacity onPress={onUpload} style={styles.uploadButton} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.uploadContent}>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.uploadText}>Subir a Wemgo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  previewList: {
    paddingVertical: 12,
  },
  previewItem: {
    marginRight: 14,
    position: 'relative',
  },
  previewImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
  },
  input: {
    color: '#fff',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    marginTop: 16,
    textAlignVertical: 'top',
    backgroundColor: '#1c1c1e',
  },
  uploadButton: {
    backgroundColor: '#7b4fff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MediaPreviewModal;
