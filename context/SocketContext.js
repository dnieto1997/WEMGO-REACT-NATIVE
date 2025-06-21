import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postHttps } from '../api/axios';

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [refreshChats, setRefreshChats] = useState(false);
  const [activeChats, setActiveChats] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const connectSocket = async () => {
      const BASE_URL = "https://wemgo.online";
      // const BASE_URL = 'http://192.168.1.2:3002';

      try {
        const token = await AsyncStorage.getItem('authToken');
        const storedFcmToken = await AsyncStorage.getItem('fcmToken');
        await postHttps('notification/save-token', { token: storedFcmToken });
        if (!token) return;

        const newSocket = io(BASE_URL, {
          auth: { token: `Bearer ${token}` },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 3000,
        });

        newSocket.on('connect', () => {
          newSocket.emit('getOnlineUsers');
        });

        newSocket.on('onlineUsers', users => {
          setOnlineUsers(users);
        });

        newSocket.on('userConnected', ({ userId }) => {
          setOnlineUsers(prev => {
            if (!prev.some(user => user.id == userId)) {
              return [...prev, { id: userId }];
            }
            return prev;
          });
        });

        newSocket.on('userDisconnected', ({ userId }) => {
          setOnlineUsers(prev => prev.filter(user => user.id != userId));
        });

        newSocket.on('receiveMessage', async message => {
          setRefreshChats(prev => !prev);
        });

        newSocket.off('newComment');
        newSocket.on('newComment', async commentData => {
          // Lógica necesaria si deseas algo adicional
        });

        newSocket.off('newFeed');
        newSocket.on('newFeed', async feedData => {
          // Lógica necesaria si deseas algo adicional
        });

        newSocket.off('newReactionStory');
        newSocket.on('newReactionStory', async reactionData => {
          console.log('newReactionStory', reactionData);
        });

        newSocket.off('newReaction');
        newSocket.on('newReaction', async reactionData => {
          console.log('newReaction', reactionData);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Error conectando el socket:', error);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [activeChats]);

  // Funciones del contexto
  const sendMessage = messageData => {
    if (socket) {
      console.log('Enviando mensaje:', messageData);
      socket.emit('sendMessage', messageData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const sendMessageStory = messageData => {
    if (socket) {
      socket.emit('RespondStory', messageData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const listenForMessages = callback => {
    if (socket) {
      socket.on('receiveMessage', callback);
    }
  };

  const stopListeningForMessages = callback => {
    if (socket) {
      socket.off('receiveMessage', callback);
    }
  };

  const sendCommentNotification = commentData => {
    if (socket) {
      socket.emit('newComment', commentData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const listenForCommentNotifications = callback => {
    if (socket) {
      socket.on('newComment', callback);
    }
  };

  const sendReactionNotification = reactionData => {
    if (socket) {
      socket.emit('newReaction', reactionData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const listenForReactions = callback => {
    if (socket) {
      socket.off('newReaction');
      socket.on('newReaction', callback);
    }
  };

  const sendNewFeed = feedData => {
    if (socket) {
      console.log('Enviando nuevo feed:', feedData);
      socket.emit('newFeed', feedData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        sendMessage,
        setChatActive: (userId, chatId) => {
          setActiveChats(prev => ({ ...prev, [userId]: chatId }));
        },
        removeChatActive: userId => {
          setActiveChats(prev => {
            const updatedChats = { ...prev };
            delete updatedChats[userId];
            return updatedChats;
          });
        },
        sendMessageStory,
        listenForMessages,
        stopListeningForMessages,
        sendCommentNotification,
        listenForCommentNotifications,
        sendReactionNotification,
        listenForReactions,
        sendNewFeed,
        refreshChats,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider };
