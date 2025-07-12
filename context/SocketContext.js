import React, { createContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postHttps } from '../api/axios';

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [refreshChats, setRefreshChats] = useState(false);
  const [activeChats, setActiveChats] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  const connectSocket = async () => {
    const BASE_URL = 'https://wemgo.online';
    //const BASE_URL = 'http://192.168.1.12:3002';
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token || socketRef.current) return;

      const newSocket = io(BASE_URL, {
        auth: { token: `Bearer ${token}` },
        path: '/wemgo-sockettest/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket conectado');
        newSocket.emit('getOnlineUsers');
      });

      newSocket.on('onlineUsers', users => setOnlineUsers(users));

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

      newSocket.on('parcheMessage', () => {
  setRefreshChats(prev => !prev); 
});

      newSocket.on('newCommentEvent', async () => {});
      newSocket.on('newComment', async () => {});
      newSocket.on('newFollow', async () => {});
      newSocket.on('sendInvitation', async () => {});
      newSocket.on('newFeed', async () => {});
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

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!socketRef.current || !socketRef.current.connected) {
  
        connectSocket();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = messageData => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', messageData);
    } else {
      console.warn('Socket is not connected.');
    }
  };

  const sendMessageStory = messageData => {
    if (socketRef.current) {
      socketRef.current.emit('RespondStory', messageData);
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
    if (socketRef.current) {
      socketRef.current.emit('newComment', commentData);
    }
  };

  const sendCommentEventNotification = commentDataEvent => {
    if (socketRef.current) {
      socketRef.current.emit('newCommentEvent', commentDataEvent);
    }
  };

  const sendInvitationNotification = invitationData => {
    if (socketRef.current) {
      socketRef.current.emit('sendInvitation', invitationData);
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
    }
  };

  const sendToggleNotification = reactionData => {
    if (socketRef.current) {
      socketRef.current.emit('newFollow', reactionData);
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
      socketRef.current.emit('newFeed', feedData);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connectSocket,
        sendMessage,
        sendMessageStory,
        listenForMessages,
        stopListeningForMessages,
        sendCommentNotification,
        sendCommentEventNotification,
        sendInvitationNotification,
        listenForCommentNotifications,
        sendReactionNotification,
        listenForReactions,
        sendNewFeed,
        sendToggleNotification,
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
        refreshChats,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider };
