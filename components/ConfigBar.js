import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ConfigBar = ({
  onViewPress,
  onReactionsPress,
  onEditPress,
  onDeletePress,
  isLoadingCount,
  Count,
  Count2,
}) => {
  return (
    <View style={styles.configBar}>
      <TouchableOpacity
        style={styles.configButton}
        activeOpacity={0.7}
        onPress={onViewPress}>
        <MaterialIcons name="remove-red-eye" size={24} color="#4CAF50" />
        {isLoadingCount ? (
          <ActivityIndicator size="small" color="#4CAF50" style={{marginTop: 4}} />
        ) : (
          <Text style={styles.configText}>{Count}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.configButton}
        activeOpacity={0.7}
        onPress={onReactionsPress}>
        <MaterialIcons name="favorite" size={24} color="red" />
        {isLoadingCount ? (
          <ActivityIndicator size="small" color="#4CAF50" style={{marginTop: 4}} />
        ) : (
          <Text style={styles.configText}>{Count2}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.configButton}
        onPress={onEditPress}
        activeOpacity={0.7}>
        <MaterialIcons name="edit" size={24} color="#2196F3" />
        <Text style={styles.configText}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.configButton}
        onPress={onDeletePress}
        activeOpacity={0.7}>
        <MaterialIcons name="delete" size={24} color="#F44336" />
        <Text style={styles.configText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  configBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  configButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  configText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default ConfigBar;
