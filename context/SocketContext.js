import React, { createContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postHttps } from '../api/axios';

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // 🛡 Previene conexiones múltiples
  const [refreshChats, setRefreshChats] = useState(false);
  const [activeChats, setActiveChats] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const connectSocket = async () => {
      //const BASE_URL = 'http://192.168.1.17:3002';
         const BASE_URL = 'https://wemgo.online';

      try {
        const token = await AsyncStorage.getItem('authToken');
        const storedFcmToken = await AsyncStorage.getItem('fcmToken');
      
        

        if (!token || socketRef.current) return;

        const newSocket = io(BASE_URL, {
          auth: { token: `Bearer ${token}` },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 3000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

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

        newSocket.on('receiveMessage', async () => {
          setRefreshChats(prev => !prev);
        });

        // Limpieza previa
        newSocket.off('newComment');
        newSocket.off('newFeed');
        newSocket.off('newReaction');
        newSocket.off('newReactionStory');
        newSocket.off('newFollow');
         newSocket.off('sendInvitation');

        newSocket.on('newComment', async commentData => {
          // lógica opcional
        });

        newSocket.on('newFollow', async followData => {
          // lógica opcional
        });

          newSocket.on('sendInvitation', async invitationData => {
          // lógica opcional
        });


        newSocket.on('newFeed', async feedData => {
          // lógica opcional
        });

        newSocket.on('newReactionStory', async reactionData => {
          console.log('newReactionStory', reactionData);
        });

        newSocket.on('newReaction', async reactionData => {
          console.log('newReaction', reactionData);
        });
      } catch (error) {
        console.error('Error conectando el socket:', error);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

 

  const sendMessage = messageData => {
    if (socketRef.current) {
      console.log('Enviando mensaje:', messageData);
      socketRef.current.emit('sendMessage', messageData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const sendMessageStory = messageData => {
    if (socketRef.current) {
      socketRef.current.emit('RespondStory', messageData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const listenForMessages = callback => {
    if (socketRef.current) {
      socketRef.current.on('receiveMessage', callback);
    }
  };

  const stopListeningForMessages = callback => {
    if (socketRef.current) {
      socketRef.current.off('receiveMessage', callback);
    }
  };

  const sendCommentNotification = commentData => {
    console.log(commentData)
    if (socketRef.current) {
      socketRef.current.emit('newComment', commentData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

    const sendInvitationNotification = invitationData => {
    console.log(invitationData)
    if (socketRef.current) {
      socketRef.current.emit('sendInvitation', invitationData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const listenForCommentNotifications = callback => {
    if (socketRef.current) {
      socketRef.current.on('newComment', callback);
    }
  };

  const sendReactionNotification = reactionData => {
    if (socketRef.current) {
      socketRef.current.emit('newReaction', reactionData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

    const sendToggleNotification = reactionData => {
    if (socketRef.current) {
      socketRef.current.emit('newFollow', reactionData);
    } else {
      console.warn('Socket is not connected.');
    }
  };


  const listenForReactions = callback => {
    if (socketRef.current) {
      socketRef.current.off('newReaction');
      socketRef.current.on('newReaction', callback);
    }
  };

  const sendNewFeed = feedData => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('📤 Enviando newFeed:', feedData);
      socketRef.current.emit('newFeed', feedData);
    } else {
      console.warn('Socket no conectado.');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
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
        sendToggleNotification,
        sendInvitationNotification,
        refreshChats,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider };
