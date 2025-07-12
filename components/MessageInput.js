import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const MessageInput = ({
  message,
  setMessage,
  handleSend,
  isSending,
  inputHeight,
  setInputHeight,
  hasReacted,
  toggleReaction,
}) => {
  return (
    <View style={styles.bottomContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {height: Math.max(40, inputHeight)}]}
          placeholder="Enviar mensaje..."
          placeholderTextColor="gray"
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          onContentSizeChange={event =>
            setInputHeight(event.nativeEvent.contentSize.height)
          }
        />
        <TouchableOpacity
          onPress={handleSend}
          style={styles.sendButton}
          disabled={isSending}>
          <FontAwesome name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={toggleReaction} style={styles.reactButton}>
        <FontAwesome
          name="heart"
          size={25}
          color={hasReacted ? 'red' : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1c1c1e',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 6,
    margin: 10,
    width: '87%',
    right: 17,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 6,
    paddingBottom: Platform.OS === 'ios' ? 10 : 6,
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#914cf0',
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactButton: {
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    right: 20,
    backgroundColor: 'black',
  },
});

export default MessageInput;
