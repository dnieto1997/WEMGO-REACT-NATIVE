import React, {useState, useEffect, useContext,useRef} from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Keyboard,
} from 'react-native';
import {COLORS} from '../constants';
import {deleteHttps, getHttps, patchHttps, postHttps} from '../api/axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {SocketContext} from '../context/SocketContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CommentItem = ({
  feedId,
  isVisible,
  onClose,
  onCommentAdded,
  onCommentDeleted,
  feedOwnerId,
  focusCommentId
}) => {
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [DataUser, setDataUser] = useState({});
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [likecomment, setLikecomment] = useState(false);
  const [likereply, setLikereply] = useState(false);
const [isSendingComment, setIsSendingComment] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(false);
const [suggestions, setSuggestions] = useState([]);
const [mentionQuery, setMentionQuery] = useState('');
const [mentionStart, setMentionStart] = useState(-1);
const [mentionObj, setMentionObj] = useState(null);
 const [keyboardHeight, setKeyboardHeight] = useState(0);
 const flatListRef = React.useRef(null);
 const [mentionList, setMentionList] = useState([]);



  const {sendCommentNotification, listenForCommentNotifications} =
    useContext(SocketContext); // Integrar sockets


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

    const handleNewComment = newCommentData => {
      if (newCommentData.feedId === feedId) {
        setComments(prevComments => [...prevComments, newCommentData]);
      }
    };

    listenForCommentNotifications(() => {});
    listenForCommentNotifications(handleNewComment);

    return () => {
      listenForCommentNotifications(() => {}); // Desuscribirse al desmontar
    };
  }, [isVisible]);


useEffect(() => {
  if (isVisible && focusCommentId && comments.length > 0) {
    const index = comments.findIndex(c => c.commentId === focusCommentId);
    if (index !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }, 300);
    }
  }
}, [isVisible, focusCommentId, comments]);

  const editReply = reply => {
    setEditingReply(reply.replyId);
    setEditReplyText(reply.replyText);
  };

  const saveEditedReply = async replyId => {
    try {
      await patchHttps(`w-reply/${replyId}`, {reply: editReplyText});
      setEditingReply(null);
      fetchComments();
      setSelectedComment(prev => ({
        ...prev,
        replies: prev.replies.map(r =>
          r.replyId == replyId ? {...r, replyText: editReplyText} : r,
        ),
      }));
    } catch (error) {
      console.error('Error editing reply:', error);
    }
  };
  const deleteReply = async replyId => {
    try {
      await deleteHttps(`w-reply/${replyId}`);
      fetchComments();
    } catch (error) {
      console.error('Error deleting reply:', error);
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

  const fetchComments = async () => {
    try {
      const response = await getHttps(`comments/find/${feedId}`);
  
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
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

const addComment = async () => {
  if (!newComment.trim()) return;
  setIsSendingComment(true);

  try {
    const id_user_mention = mentionList.map(m => m.id);
    const user_mention = mentionList.map(m => m.name);

    const payload={
 id_feed: feedId,
      comments: newComment,
      id_user_mention: JSON.stringify(id_user_mention),
      user_mention: JSON.stringify(user_mention),
    }



    const response = await postHttps('comments', payload);

    const newCommentData = {
      commentId: response.data.id,
      commentText: newComment,
      userId: DataUser.id,
      userFirstName: DataUser.firstName,
      userLastName: DataUser.lastName,
      feedId: feedId,
      idUserMention: id_user_mention,
      userMention: user_mention,
    };

    sendCommentNotification(newCommentData);

    setComments(prev => [...prev, newCommentData]);
    setNewComment('');
    setMentionList([]); // reset
    setShowSuggestions(false);
    onCommentAdded();
  } catch (error) {
    console.error('Error adding comment:', error);
  } finally {
    setIsSendingComment(false);
  }
};




  const editComment = comment => {
    setEditingComment(comment.commentId);
    setEditCommentText(comment.commentText);
  };

  const saveEditedComment = async commentId => {
    try {
      await patchHttps(`comments/${commentId}`, {comments: editCommentText});
      fetchComments();
      setEditingComment(null);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const deleteComment = async commentId => {
    try {
      await deleteHttps(`comments/${commentId}`);
      const updatedComments = comments.filter(
        comment => comment.commentId !== commentId,
      );
      setComments(updatedComments);

      onCommentDeleted();
    } catch (error) {
      console.log('Error deleting comment:', error);
    }
    fetchComments();
  };
  const addReply = async parentId => {
    if (!newReply.trim()) return;

    try {
      const response = await postHttps('w-reply', {
        id_feed: feedId,
        id_comments: parentId,
        reply: newReply,
      });

      if (response.status === 201) {
        setNewReply('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

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


  const navigateToProfile = userId => {
    onClose();
    if (DataUser.id == userId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('FriendTimeline', {id: userId});
    }
  };

  const likeComment = async commentId => {
    const updatedComments = [...comments];

    // Encuentra el comentario a actualizar
    const commentToUpdate = updatedComments.find(
      c => c.commentId === commentId,
    );

    if (commentToUpdate) {
      // Optimistic UI: actualiza estado local de inmediato
      commentToUpdate.liked = !commentToUpdate.liked;
      commentToUpdate.likeCount += commentToUpdate.liked ? 1 : -1;
      setComments(updatedComments);
      setLikecomment(prev => !prev);
    }
    try {
      await postHttps('like/comment', {id_comment: commentId, type: 'COMMENT'});
      setLikecomment(!likecomment);
      fetchComments();
    } catch (error) {
      if (commentToUpdate) {
        commentToUpdate.liked = !commentToUpdate.liked;
        commentToUpdate.likeCount += commentToUpdate.liked ? 1 : -1;
        setComments([...updatedComments]);
        setLikecomment(prev => !prev);
      }
    }
  };

  const likeReply = async replyId => {
    setLikereply(prev => !prev);

    // También puedes actualizar la estructura de comentarios directamente si lo deseas
    const updatedComments = [...comments];
    const replyToUpdate = updatedComments
      .flatMap(c => c.replies || [])
      .find(r => r.replyId === replyId);
    if (replyToUpdate) {
      replyToUpdate.liked = !replyToUpdate.liked;
      replyToUpdate.likeCount += replyToUpdate.liked ? 1 : -1;
      setComments(updatedComments);
    }

    try {
      await postHttps('like/reply', {id_reply: replyId, type: 'REPLY'});
      setLikereply(!likereply);

      // Recargar comentarios para reflejar cambios
      const updatedComments = await getHttps(`comments/find/${feedId}`);
      setComments(updatedComments.data);

      // Actualizar las respuestas en el modal
      if (selectedComment) {
        const updatedComment = updatedComments.data.find(
          c => c.commentId === selectedComment.commentId,
        );
        setSelectedComment(updatedComment);
      }
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };
  const openReplyModal = async comment => {
    const updatedComment = comments.find(
      c => c.commentId === comment.commentId,
    );
    fetchComments();
    setSelectedComment(updatedComment);
    setReplyModalVisible(true);
  };

  const renderReplies = comment => {
    if (comment.replies && comment.replies.length === 1) {
      return renderReply({item: comment.replies[0]});
    } else if (comment.replies && comment.replies.length > 1) {
      return (
        <TouchableOpacity onPress={() => openReplyModal(comment)}>
          <Text style={styles.viewMoreText}>View More Replies</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  useEffect(() => {
    if (replyModalVisible && selectedComment) {
      fetchComments();
    }
  }, [replyModalVisible]);

  const renderReply = ({item}) => (
    <View style={styles.replyItem}>
      <View style={styles.replyHeader}>
        <TouchableOpacity
          onPress={() => navigateToProfile(item.replyUser.userId)}
          style={styles.userContainer}>
          <Image
            source={{
              uri:
                item.replyUser?.users_img ||
                'https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png',
            }}
            style={styles.commentImage}
          />
          <Text style={styles.replyAuthor}>
            {item.replyUser?.firstName} {item.replyUser?.lastName}
          </Text>
        </TouchableOpacity>
      </View>

      {editingReply === item.replyId ? (
        <TextInput
          style={styles.input}
          value={editReplyText}
          onChangeText={setEditReplyText}
        />
      ) : (
        <Text style={styles.replyText}>{item.replyText}</Text>
      )}

      <View style={styles.replyActions}>
        <TouchableOpacity onPress={() => likeReply(item.replyId)}>
          <Icon name="heart" size={25} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={{color: 'white'}}>{item.replyUser.replycount}</Text>
        {DataUser.id == item.replyUser.userId && (
          <>
            {editingReply === item.replyId ? (
              <TouchableOpacity onPress={() => saveEditedReply(item.replyId)}>
                <Icon name="check" size={25} color={COLORS.success} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => editReply(item)}>
                <Icon name="edit" size={25} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </>
        )}
        {(DataUser.id === feedOwnerId ||
          DataUser.id == item.replyUser.userId) && (
          <TouchableOpacity onPress={() => deleteReply(item.replyId)}>
            <Icon name="trash" size={25} color={COLORS.red} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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

  let result = [];
  let currentIndex = 0;

  userMentionList.forEach((mention, i) => {
    const index = content.indexOf(mention, currentIndex);
    if (index !== -1) {
      const before = content.substring(currentIndex, index);
      result.push(<Text key={`before-${i}`} style={styles.commentText}>{before}</Text>);
      result.push(
        <Text
          key={`mention-${i}`}
          style={{ color: '#944af4', fontWeight: 'bold' }}
          onPress={() => navigateToProfile(idMentionList[i])}
        >
          {mention}
        </Text>
      );
      currentIndex = index + mention.length;
    }
  });

  result.push(<Text key="after" style={styles.commentText}>{content.substring(currentIndex)}</Text>);
  return <Text>{result}</Text>;
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
        <Text style={{ color: 'white' }}>
          {item.userFirstName} {item.userLastName}
        </Text>
      </View>
    </TouchableOpacity>

   {editingComment === item.commentId ? (
  <TextInput
    style={styles.input}
    value={editCommentText}
    onChangeText={setEditCommentText}
  />
) : (
  renderCommentText(item)
)}

    <View style={{ margin: 8 }} />

    <View style={styles.replyActions}>
      <TouchableOpacity onPress={() => likeComment(item.commentId)}>
        <Icon name="heart" size={25} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        {item.reactionCount}
      </Text>

      {(DataUser.id === item.userId || DataUser.id === feedOwnerId) && (
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

      <TouchableOpacity onPress={() => setReplyingTo(item.commentId)}>
        <Text style={styles.replyText}>Reply</Text>
      </TouchableOpacity>
    </View>

    <View style={{ margin: 8 }} />

    {replyingTo === item.commentId && (
      <View style={styles.replyInputContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Escribe una Replica ..."
          placeholderTextColor={'white'}
          value={newReply}
          onChangeText={setNewReply}
        />
        <TouchableOpacity
          style={styles.replySendButton}
          onPress={() => addReply(item.commentId)}
        >
          <MaterialIcons name="send" size={30} color="white" />
        </TouchableOpacity>
      </View>
    )}

    {renderReplies(item)}
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
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Comentarios</Text>
        <FlatList
         ref={flatListRef}
          data={comments}
          keyExtractor={(item, index) => `${index}`}
          renderItem={renderComment}
            getItemLayout={(data, index) => (
    { length: 120, offset: 120 * index, index }
  )}
          contentContainerStyle={styles.commentList}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un Comentario..."
            placeholderTextColor={'white'}
            value={newComment}
            onChangeText={handleCommentChange}
          />
       <TouchableOpacity
  style={[styles.replySendButton, isSendingComment && { opacity: 0.5 }]}
  onPress={addComment}
  disabled={isSendingComment}
>
  <MaterialIcons name="send" size={30} color="white" />
</TouchableOpacity>
        </View>
      </View>

      {showSuggestions && suggestions.length > 0 && (
  <View style={{ backgroundColor: 'white', maxHeight: 150 }}>
    {suggestions.map(user => (
      <TouchableOpacity
        key={user.id}
        onPress={() => handleSelectMention(user)}
        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
      >
        <Text style={{ color: 'black' }}>{user.name}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}
      {selectedComment && (
        <Modal
          visible={replyModalVisible}
          animationType="slide"
          transparent={true}>
          <View style={styles.replyModalContainer}>
            <Text style={styles.modalTitle}>
              Replies to {selectedComment.userFirstName}'s Comment
            </Text>
            <FlatList
              data={selectedComment.replies}
              keyExtractor={reply => `${reply.replyId}`}
              renderItem={renderReply}
            />
            <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },

  commentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  replyInput: {
    flex: 1, // Para que ocupe todo el espacio disponible
    fontSize: 14,
    paddingVertical: 5,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  replyInputContainer: {
    flexDirection: 'row', // Para alinear el input y el botón en una fila
    alignItems: 'center', // Centrar verticalmente
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 5,
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
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  commentText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  replyText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Poppins-Bold',
  },
  replyItem: {
    marginLeft: 20,
    padding: 6,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gray,
    marginBottom: 4,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.gray,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  addButton: {
    backgroundColor: 'gray',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  viewMoreText: {
    backgroundColor: 'gray',
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'right',
  },
  replyModalContainer: {
    flex: 0.7,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 'auto',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  replyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  userContainer: {
    flexDirection: 'row', // Hace que la imagen y el texto estén en la misma línea
    alignItems: 'center', // Alinea la imagen y el nombre verticalmente
  },
  commentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10, // Espacio entre la imagen y el nombre
  },
  replyAuthor: {
    fontSize: 16,
    color: 'white',
  },
  commentImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  replySendButton: {
    backgroundColor: '#944af4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginLeft: 10,
    width: 48,
    height: 48,
  },

  ...StyleSheet.flatten(styles),
});

export default CommentItem;
