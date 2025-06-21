import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
  Image,
  useColorScheme,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Bubble, GiftedChat} from 'react-native-gifted-chat';
import {SocketContext} from '../context/SocketContext';
import {getHttps, patchHttps} from '../api/axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {COLORS} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

const MessageDetails = ({navigation, route}) => {
  const {id} = route.params;
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [DataUser, setDataUser] = useState({});
  const {socket} = useContext(SocketContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [inputHeight, setInputHeight] = useState(40);

  useEffect(() => {
    const loadAndFetch = async () => {
      await loadUserData();
      if (id) {
        setTimeout(() => {
          fetchMessages();
        }, 500);
      }
    };
    loadAndFetch();
  }, [id]);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setDataUser(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Emitir eventos socket para chat activo/inactivo
  useFocusEffect(
    useCallback(() => {
      const setActive = async () => {
        try {
          const data = await AsyncStorage.getItem('userData');
          if (data && socket) {
            const parsedData = JSON.parse(data);
            const userId = parsedData.id;
            socket.emit('setChatActive', { senderId: userId, receiverId: id });
          }
        } catch (error) {
          console.error('Error obteniendo userId:', error);
        }
      };

      setActive();

      return async () => {
        try {
          const data = await AsyncStorage.getItem('userData');
          if (data && socket) {
            const parsedData = JSON.parse(data);
            const userId = parsedData.id;
            socket.emit('removeChatActive', userId);
            fetchMessages();
          }
        } catch (error) {
          console.error('Error removiendo userId:', error);
        }
      };
    }, [id, socket]),
  );

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    try {
      const response = await getHttps(`chat/conversation/${id}`);
      const formattedMessages = response.data.map(msg => ({
        _id: msg.id,
        text: msg.content,
        createdAt: new Date(msg.timestamp),
        user: {
          _id: msg.sender.id,
          name: msg.sender.fullName,
          avatar: msg.sender.img,
        },
        story: msg.story || null,
        isRead: msg.isRead,
      }));
      setChatMessages(formattedMessages);
      await patchHttps(`chat/markAsRead/${id}`, {});
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [id]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = newMessage => {
        if (newMessage.sender.id === id || newMessage.receiver.id === id) {
          setChatMessages(prev =>
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
                story: newMessage.story || null,
                isRead:
                  newMessage.sender.id === DataUser.id ? 1 : newMessage.isRead,
              },
            ]),
          );
          if (newMessage.sender.id !== DataUser.id) {
            patchHttps(`chat/markAsRead/${id}`, {});
          }
        }
      };

      socket.on('receiveMessage', handleNewMessage);

      return () => {
        socket.off('receiveMessage', handleNewMessage);
      };
    }
  }, [id, socket, DataUser.id]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = async newMessage => {
        await fetchMessages();
      };

      socket.on('receiveMessage', handleNewMessage);
      return () => socket.off('receiveMessage', handleNewMessage);
    }
  }, [id, socket, fetchMessages]);

  // Solo enviar el mensaje, el backend decide si envía push o no
  const handleSend = useCallback(() => {
    if (inputMessage.trim() === '') return;

    socket.emit('sendMessage', { receiver: id, content: inputMessage });

    setInputMessage('');
    setInputHeight(40);

    setTimeout(async () => {
      await fetchMessages();
    }, 1000);
  }, [inputMessage, id, socket, fetchMessages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              navigation.goBack();
            }, 100);
          }}
          style={styles.headerBtn}>
          <AntDesign name="arrowleft" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={{flexDirection: 'row'}}></View>
      </View>
      {/* Chat */}
      <View style={{flex: 1}}>
        <GiftedChat
          messages={chatMessages}
          user={{_id: DataUser.id}}
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
                      backgroundColor: isDarkMode
                        ? COLORS.darkBackground
                        : COLORS.lightBackground,
                      color: 'white',
                    },
                  ]}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder="Escribe..."
                  placeholderTextColor="white"
                  multiline
                  textAlignVertical="top"
                  onContentSizeChange={event =>
                    setInputHeight(event.nativeEvent.contentSize.height)
                  }
                />
                <TouchableOpacity onPress={handleSend}>
                  <View style={styles.sendButton}>
                    <FontAwesome name="send" size={22} color={'white'} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderBubble={props => {
            const isSentByCurrentUser =
              props.currentMessage.user._id === DataUser.id;
            const isMessageRead = props.currentMessage.isRead === 1;
            const story = props.currentMessage.story;

            const isVideo =
              story?.img?.endsWith('.mp4') ||
              story?.img?.endsWith('.mov') ||
              story?.img?.includes('video');

            return (
              <View>
                {story && (
                  <>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontSize: 10,
                      }}>
                      {isSentByCurrentUser
                        ? 'Respondiste a su historia'
                        : 'Respondió a tu historia'}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ViewStories', {
                          id: props.currentMessage.user._id,
                          storyId: story.id,
                        })
                      }
                      style={{
                        marginTop: 4,
                        alignSelf: isSentByCurrentUser
                          ? 'flex-end'
                          : 'flex-start',
                      }}>
                      <View style={{position: 'relative'}}>
                        <Image
                          source={{uri: story.img}}
                          style={{width: 90, height: 130, borderRadius: 12}}
                        />
                        {isVideo && (
                          <View
                            style={{
                              position: 'absolute',
                              top: '40%',
                              left: '40%',
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              borderRadius: 20,
                              padding: 6,
                            }}>
                            <Text style={{color: 'white', fontSize: 18}}>
                              ▶
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </>
                )}
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
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 10,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  headerBtn: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    right: 15,
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
  readReceiptImage: {
    width: 16,
    height: 16,
    borderRadius: 999,
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 4,
  },
});

export default MessageDetails;