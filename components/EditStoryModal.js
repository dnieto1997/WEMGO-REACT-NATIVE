import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

const EditStoryModal = ({
  visible,
  onClose,
  onSave,
  loading,
  pickImage,
  editedImage,
  setEditedImage,
  editedDescription,
  setEditedDescription,
}) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.modalContent}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.closeButton}>✖</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Publicación</Text>

          <View style={styles.imageSection}>
            {editedImage ? (
              <View style={styles.imageWrapper}>
                <Image source={{uri: editedImage}} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setEditedImage(null)}>
                  <Text style={styles.removeButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                <Text style={styles.addButtonText}>📷 Agregar Imagen</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Editar descripción"
            placeholderTextColor="gray"
            value={editedDescription}
            onChangeText={setEditedDescription}
            multiline
          />

          <View style={{top: 20}}>
            <TouchableOpacity onPress={onSave} style={styles.saveButton}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  imageButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    color: 'black',
    fontSize: 16,
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginBottom: 15,
    textAlignVertical: 'top',
    height: 50,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditStoryModal;
