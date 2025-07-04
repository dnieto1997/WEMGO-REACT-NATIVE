// components/DescriptionModal.js
import React from 'react';
import { Modal, View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DescriptionModal = ({ visible, onClose, description }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.content}>
          <ScrollView>
            <Text style={styles.description}>{description}</Text>
          </ScrollView>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#200f39',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  description: {
    fontSize: 15,
    color: '#444',
  },
  closeButton: {
    textAlign: 'center',
    color: '#944af5',
    marginTop: 15,
    fontWeight: 'bold',
  },
});

export default DescriptionModal;