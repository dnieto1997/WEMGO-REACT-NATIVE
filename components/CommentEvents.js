import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants';
import { deleteHttps, getHttps, postHttps, patchHttps } from '../api/axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { SocketContext } from '../context/SocketContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CommentEvents = ({
  eventId,
  isVisible,
  onClose,
  onCommentAdded,
  onCommentDeleted,
  eventOwnerId,
}) => {
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [mentionObj, setMentionObj] = useState(null); // {id, name}
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editMentionObj, setEditMentionObj] = useState(null); // Para edición
  const [DataUser, setDataUser] = useState({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
    const {sendCommentEventNotification} =
      useContext(SocketContext); // Integrar sockets

  // Menciones para crear
  const [mentionList, setMentionList] = useState([]);
const [mentionStart, setMentionStart] = useState(-1);
const [mentionQuery, setMentionQuery] = useState('');
const [suggestions, setSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [isSendingComment, setIsSendingComment] = useState(false);

  // Menciones para editar
  const [editShowSuggestions, setEditShowSuggestions] = useState(false);
  const [editSuggestions, setEditSuggestions] = useState([]);
  const [editMentionQuery, setEditMentionQuery] = useState('');
  const [editMentionStart, setEditMentionStart] = useState(-1);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        onClose();
      };
    }, []),
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setDataUser(parsedData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchComments();
      loadUserData();
    }
  }, [isVisible]);

  const fetchComments = async () => {
    try {
      const response = await getHttps(`comment-event/find/${eventId}`);
  
      let commentsArray = [];
      if (Array.isArray(response.data)) {
        commentsArray = response.data;
      } else if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
        commentsArray = [response.data];
      }
      setComments(commentsArray);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  

const fetchMentionUsers = async (query) => {
  try {
    if (!query) return [];
    const res = await getHttps(`users/search/${query}`);
    return res.data.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
    }));
  } catch {
    return [];
  }
};

const extractMentions = async (text) => {
  const mentionRegex = /@([\w\s]+)/g;
  const mentions = [...text.matchAll(mentionRegex)].map(m => m[1].trim());

  const res = await Promise.all(
    mentions.map(async (name) => {
      const searchRes = await getHttps(`users/search/${name}`);
      const foundUser = searchRes.data.find(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase() === name.toLowerCase()
      );
      return foundUser ? { id: foundUser.id, name: `@${name}` } : null;
    })
  );

  return res.filter(Boolean); // eliminar nulls
};

  // Detectar @ y mostrar sugerencias (crear)
  const handleCommentChange = async (text) => {
  setNewComment(text);
  if (mentionObj && !text.includes(mentionObj.name)) setMentionObj(null);

  const selection = text.lastIndexOf('@');
  if (selection !== -1) {
    const afterAt = text.slice(selection + 1);
    if (/^[\w\s]{0,20}$/.test(afterAt)) {
      setMentionQuery(afterAt);
      setMentionStart(selection);
      const users = await fetchMentionUsers(afterAt);
      setSuggestions(users);
      setShowSuggestions(true);
      return;
    }
  }
  setShowSuggestions(false);
  setMentionQuery('');
  setMentionStart(-1);
};

  // Insertar mención seleccionada como objeto (crear)
const handleSelectMention = (user) => {
  if (mentionStart === -1) return;

  const fullName = `${user.name}`;
  const mentionText = `@${fullName}`;

  const before = newComment.slice(0, mentionStart);
  const after = newComment.slice(mentionStart + mentionQuery.length + 1);
  const fullText = before + mentionText + after;
  setNewComment(fullText);

  setMentionList(prev => {
    const alreadyMentioned = prev.some(m => m.id === user.id);
    if (alreadyMentioned) return prev;
    return [...prev, { id: user.id, name: mentionText }];
  });

  setShowSuggestions(false);
  setMentionQuery('');
  setMentionStart(-1);
};

  // Detectar @ y mostrar sugerencias (editar)
  const handleEditCommentChange = async (text) => {
    setEditCommentText(text);
    if (editMentionObj && !text.includes(editMentionObj.name)) setEditMentionObj(null);

    const selection = text.lastIndexOf('@');
    if (selection !== -1) {
      const afterAt = text.slice(selection + 1);
      if (/^[\w\s]{0,20}$/.test(afterAt)) {
        setEditMentionQuery(afterAt);
        setEditMentionStart(selection);
        const users = await fetchMentionUsers(afterAt);
        setEditSuggestions(users);
        setEditShowSuggestions(true);
        return;
      }
    }
    setEditShowSuggestions(false);
    setEditMentionQuery('');
    setEditMentionStart(-1);
  };

  // Insertar mención seleccionada como objeto (editar)
  const handleEditSelectMention = (user) => {
    if (editMentionStart === -1) return;
    const before = editCommentText.slice(0, editMentionStart);
    const after = editCommentText.slice(editMentionStart + editMentionQuery.length + 1);
    const mentionText = `@${user.name}`;
    const fullText = before + mentionText + after;
    setEditCommentText(fullText);
    setEditMentionObj({ id: user.id, name: mentionText });
    setEditShowSuggestions(false);
    setEditMentionQuery('');
    setEditMentionStart(-1);
  };

  // Aquí se arma el body y se envía la mención correctamente (crear)
const addComment = async () => {
  if (!newComment.trim()) return;
  setIsSendingComment(true);

  try {
    const id_user_mention = mentionList.map(m => m.id);
    const user_mention = mentionList.map(m => m.name);

    const payload = {
      id_event: eventId, // ✅ CAMBIADO AQUÍ
      comments: newComment,
      id_user_mention: JSON.stringify(id_user_mention),
      user_mention: JSON.stringify(user_mention),
    };

  
    const response = await postHttps('comment-event', payload);
  

    const newCommentData = {
      commentId: response.data.id,
      commentText: newComment,
      userId: DataUser.id,
      userFirstName: DataUser.firstName,
      userLastName: DataUser.lastName,
      userImg: DataUser.img,
      eventId: eventId,
      idUserMention: id_user_mention,
      userMention: user_mention,
    };

    sendCommentEventNotification(newCommentData);

    setComments(prev => [...prev, newCommentData]);
    setNewComment('');
    setMentionList([]); // reset
    setShowSuggestions(false);
    onCommentAdded && onCommentAdded();
  } catch (error) {
    console.error('Error adding comment:', error);
  } finally {
    setIsSendingComment(false);
  }
};




  // Aquí se arma el body y se envía la mención correctamente (editar)
  const saveEditedComment = async commentId => {
    let id_user_mention = null;
    let user_mention = null;
    if (editMentionObj && editCommentText.includes(editMentionObj.name)) {
      id_user_mention = editMentionObj.id;
      user_mention = editMentionObj.name;
    }
    let body = {
      comments: editCommentText,
      id_user_mention,
      user_mention,
    };
    if (!id_user_mention) delete body.id_user_mention;
    if (!user_mention) delete body.user_mention;

    try {
      await patchHttps(`comment-event/${commentId}`, body);
      fetchComments();
      setEditingComment(null);
      setEditMentionObj(null);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const editComment = comment => {
    setEditingComment(comment.commentId);
    setEditCommentText(comment.commentText);
    setEditMentionObj(null); // Limpia mención previa al editar
  };

  const deleteComment = async commentId => {
    try {
      await deleteHttps(`comment-event/${commentId}`);
      const updatedComments = comments.filter(
        comment => comment.commentId !== commentId,
      );
      setComments(updatedComments);
      onCommentDeleted && onCommentDeleted();
    } catch (error) {
      console.log('Error deleting comment:', error);
    }
    fetchComments();
  };

 const navigateToProfile = (userId) => {
  if (DataUser?.id === userId) {
    navigation.navigate('Profile');
  } else {
    navigation.navigate('FriendTimeline', { id: userId });
  }
};


const renderCommentText = (item) => {
  const content = item.commentText;

  let idMentionList = [];
  let userMentionList = [];

  try {
    idMentionList = Array.isArray(item.idUserMention)
      ? item.idUserMention
      : JSON.parse(item.idUserMention || '[]');
    userMentionList = Array.isArray(item.userMention)
      ? item.userMention
      : JSON.parse(item.userMention || '[]');
  } catch {
    return <Text style={styles.commentText}>{content}</Text>;
  }

  if (!userMentionList.length || !idMentionList.length) {
    return <Text style={styles.commentText}>{content}</Text>;
  }

  // Partes del comentario con menciones resaltadas
  const elements = [];
  let remainingText = content;

  userMentionList.forEach((mention, i) => {
    const mentionIndex = remainingText.indexOf(mention);
    if (mentionIndex !== -1) {
      const beforeText = remainingText.substring(0, mentionIndex);
      const afterText = remainingText.substring(mentionIndex + mention.length);

      if (beforeText) {
        elements.push(
          <Text key={`before-${i}`} style={styles.commentText}>{beforeText}</Text>
        );
      }

      elements.push(
        <Text
          key={`mention-${i}`}
          style={styles.mentionLink}
          onPress={() => navigateToProfile(idMentionList[i])}
        >
          {mention}
        </Text>
      );

      remainingText = afterText;
    }
  });

  if (remainingText) {
    elements.push(
      <Text key="after" style={styles.commentText}>{remainingText}</Text>
    );
  }

  return <Text>{elements}</Text>;
};



  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <TouchableOpacity onPress={() => navigateToProfile(item.userId)}>
        <View style={styles.commentHeader}>
          <Image
            source={{
              uri:
                item.userImg ||
                'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
            }}
            style={styles.commentImage}
          />
          <Text style={{ color: "white" }}>
            {item.userFirstName} {item.userLastName}
          </Text>
        </View>
      </TouchableOpacity>

      {editingComment === item.commentId ? (
        <>
          <TextInput
            value={editCommentText}
            onChangeText={handleEditCommentChange}
            style={styles.input}
            placeholder="Edita tu comentario..."
            placeholderTextColor="white"
          />
          {editShowSuggestions && (
            <View style={styles.mentionsModal}>
              <FlatList
                data={editSuggestions}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleEditSelectMention(item)}
                    style={styles.mentionItem}
                  >
                    <Text style={{ color: 'white' }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </>
      ) : (
        renderCommentText(item)
      )}

      <View style={{ margin: 8 }} />

      <View style={styles.replyActions}>
        {(DataUser.id === item.userId || DataUser.id === eventOwnerId) && (
          <>
            {DataUser.id === item.userId &&
              (editingComment === item.commentId ? (
                <TouchableOpacity onPress={() => saveEditedComment(item.commentId)}>
                  <Icon name="check" size={25} color={COLORS.white} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => editComment(item)}>
                  <Icon name="edit" size={25} color={COLORS.white} />
                </TouchableOpacity>
              ))}
            <TouchableOpacity onPress={() => deleteComment(item.commentId)}>
              <Icon name="trash" size={25} color={COLORS.red} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Comentarios</Text>
            <FlatList
              data={comments}
              keyExtractor={(item, index) => `${index}`}
              renderItem={renderComment}
              contentContainerStyle={[
                styles.commentList,
                { flexGrow: 1, justifyContent: comments.length === 0 ? 'flex-end' : 'flex-start' }
              ]}
              keyboardShouldPersistTaps="handled"
            />
            <View style={styles.inputContainer}>
              <TextInput
                value={newComment}
                onChangeText={handleCommentChange}
                style={styles.input}
                placeholder="Escribe un Comentario..."
                placeholderTextColor="white"
              />
              <TouchableOpacity style={styles.replySendButton} onPress={addComment}   disabled={isSendingComment}>
                <MaterialIcons
                  name="send"
                  size={30}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            {showSuggestions && (
              <View style={styles.mentionsModal}>
                <FlatList
                  data={suggestions}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectMention(item)}
                      style={styles.mentionItem}
                    >
                      <Text style={{ color: 'white' }}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 2.3,
    backgroundColor: '#333333',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: "Poppins-Bold",
    color: "white"
  },
  commentList: {
    flexGrow: 1,
  },
  commentContainer: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentText: {
    fontSize: 14,
    color: "white",
    fontFamily: "Poppins-Bold",
    fontWeight: "bold"
  },
mentionLink: {
  color: '#944af4',
  fontWeight: 'bold',
  fontFamily: "Poppins-Bold"
},
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.gray,
    paddingTop: 8,
    backgroundColor: '#333333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    color: "white",
    fontWeight: "bold",
    fontFamily: "Poppins-Bold"
  },
  replySendButton: {
    backgroundColor: "#944af4",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginLeft: 10,
    width: 48,
    height: 48
  },
  mentionsModal: {
    position: 'absolute',
    left: (SCREEN_WIDTH * 0.3) / 2,
    width: SCREEN_WIDTH * 0.7,
    bottom: 60,
    backgroundColor: '#222',
    borderRadius: 10,
    maxHeight: 180,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
    alignSelf: 'center',
  },
  mentionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
});

export default CommentEvents;