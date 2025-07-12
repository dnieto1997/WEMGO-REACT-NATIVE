import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';

const ReactionsModal = ({visible, onClose, users, onNavigate}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Reaccionado por</Text>

          {users.length > 0 ? (
            <FlatList
              data={users}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => onNavigate(item.id)}>
                  <Image
                    source={{
                      uri: item.img
                        ? item.img
                        : 'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
                    }}
                    style={styles.profileImage}
                  />
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.userName}>
                      {item.first_name} {item.last_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={{maxHeight: '80%'}}
            />
          ) : (
            <Text style={styles.emptyText}>
              Nadie ha reaccionado a esta historia aún.
            </Text>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'black',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    textAlign: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#944af5',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
  },
});

export default ReactionsModal;
