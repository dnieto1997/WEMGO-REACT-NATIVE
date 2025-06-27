import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Platform, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getHttps, postHttps } from '../api/axios';
import { SocketContext } from '../context/SocketContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatParche = () => {
  const { id: parcheId } = useRoute().params;
  const navigation = useNavigation();
  const { socket } = useContext(SocketContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [messages, setMessages] = useState([]);
  const [DataUser, setDataUser] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);

  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setDataUser(JSON.parse(data));
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchMessages();

    if (socket) {
      socket.emit('joinParche', parcheId);

      socket.on('parcheMessage', handleNewMessage);

      return () => {
        socket.emit('leaveParche', parcheId);
        socket.off('parcheMessage', handleNewMessage);
      };
    }
  }, [parcheId, socket]);

  const fetchMessages = async () => {
    try {
      const response = await getHttps(`parche-chat/${parcheId}`);
      const formatted = response.data.map(msg => ({
        _id: msg.id,
        text: msg.content,
        createdAt: new Date(msg.timestamp),
        user: {
          _id: msg.sender.id,
          name: msg.sender.fullName,
          avatar: msg.sender.img,
        },
      }));
      console.log(response.data)
      setMessages(formatted.reverse());
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const handleNewMessage = (newMessage) => {
    setMessages(prev =>
      GiftedChat.append(prev, [
        {
          _id: newMessage.id,
          text: newMessage.content,
          createdAt: new Date(newMessage.timestamp),
          user: {
            _id: newMessage.sender.id,
            name: newMessage.sender.fullName,
            avatar: newMessage.sender.img,
          },
        },
      ])
    );
  };

const handleSend = () => {
  if (!inputMessage.trim() || !DataUser.id) return;

  socket.emit('sendParcheMessage', {
    parcheId,
    content: inputMessage,
    senderId: DataUser.id,  // IMPORTANTE: El senderId se manda al backend
  });

  setInputMessage('');
  setInputHeight(40);
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <FontAwesome name="arrow-left" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat del Parche</Text>
        <View style={{ width: 40 }} />
      </View>

      <GiftedChat
        messages={messages}
        user={{ _id: DataUser.id }}
        keyboardShouldPersistTaps="always"
        scrollToBottom
        bottomOffset={Platform.OS === 'ios' ? 40 : 0}
        renderInputToolbar={() => (
          <View style={styles.inputContainer}>
            <View style={styles.inputMessageContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.lightBackground,
                    color: 'white',
                  },
                ]}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="white"
                multiline
                textAlignVertical="top"
                onContentSizeChange={(event) =>
                  setInputHeight(event.nativeEvent.contentSize.height)
                }
              />
              <TouchableOpacity onPress={handleSend}>
                <View style={styles.sendButton}>
                  <FontAwesome name="send" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: '#944af5',
                padding: 8,
                borderRadius: 20,
              },
              left: {
                backgroundColor: '#3d3d3d',
                padding: 8,
                borderRadius: 20,
              },
            }}
            textStyle={{
              right: {
                color: 'white',
                fontFamily: 'Poppins-Light',
                fontSize: 14,
              },
              left: {
                color: 'white',
                fontFamily: 'Poppins-Light',
                fontSize: 14,
              },
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  headerBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  inputMessageContainer: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 10,
    backgroundColor: '#3d3d3d',
    paddingVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#2a2a2a',
    color: 'white',
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#944af6',
    padding: 8,
    borderRadius: 999,
    marginHorizontal: 12,
  },
});

export default ChatParche;
