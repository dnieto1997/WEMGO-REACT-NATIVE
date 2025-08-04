import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
  PanResponder,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getHttps,
  patchHttpsStories,
  deleteHttps,
  postHttps,
} from '../api/axios';
import {launchImageLibrary} from 'react-native-image-picker';
import {SocketContext} from '../context/SocketContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import ProgressBars from '../components/ProgressBars';
import StoryItem from '../components/StoryItem';
import ConfigBar from '../components/ConfigBar';
import MessageInput from '../components/MessageInput';
import EditStoryModal from '../components/EditStoryModal';
import ViewersModal from '../components/ViewersModal';
import ReactionsModal from '../components/ReactionsModal';
const {width, height} = Dimensions.get('window');
const ViewStories = ({route}) => {
  const {id} = route.params;
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [DataUser, setDataUser] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedImage, setEditedImage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isCurrentVideo, setIsCurrentVideo] = useState(false);
  const [userStoryGroups, setUserStoryGroups] = useState([]);
  const activeAudioIndexRef = useRef(null);
  const {socket, sendMessageStory} = useContext(SocketContext);
  const [isPaused, setIsPaused] = useState(false);
  const [showSentFeedback, setShowSentFeedback] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(null);
  const [Count, setCount] = useState(0);
  const [Count2, setCount2] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isLoadingCount2, setIsLoadingCount2] = useState(false);
  const [ViewUsers, setViewUsers] = useState({});
  const [ViewUsers2, setViewUsers2] = useState({});
  const insets = useSafeAreaInsets();
  const currentIndexRef = useRef(currentIndex);
  const [isSending, setIsSending] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [hasReacted, setHasReacted] = useState(false);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const duration = 5000; // o el tiempo total por historia
  const animationRef = useRef(null);
  const storyTimerRef = useRef(null);
  const progressValueRef = useRef(0);
  const shouldPauseAnimation = useRef(false);
  const hasEndedRef = useRef(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const videoDurationRef = useRef(0);
  const isVideoLoadedRef = useRef(false);
  const viewedStoryIds = useRef(new Set());


  const pickImage = async () => {
    launchImageLibrary({}, response => {
      if (
        !response.didCancel &&
        !response.errorCode &&
        response.assets.length > 0
      ) {
        setEditedImage(response.assets[0].uri);
      }
    });
  };

  useEffect(() => {
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
    loadUserData();
  }, []);

  useEffect(() => {
    const loadSpecificStory = async () => {
      const storyId = route.params?.storyId;
      if (storyId) {
        try {
          const response = await getHttps(`stories/${storyId}`);
          const data = response.data;

          setStories([data]);
          setCurrentIndex(0);
          setLoading(false);
        } catch (error) {
          console.error('Error loading specific story:', error);
          navigation.goBack();
        }
      }
    };

    loadSpecificStory();
  }, [route.params.storyId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true);
      setIsPaused(true);
      shouldPauseAnimation.current = true;

      if (animationRef.current) {
        animationRef.current.stop();
      }

      if (storyTimerRef.current) {
        clearTimeout(storyTimerRef.current);
      }
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false);
      setIsPaused(false);
      shouldPauseAnimation.current = false;

      // Calcular el tiempo restante y reanudar animación
      const elapsed = progressValueRef.current || 0;
      const remaining = duration - elapsed;

      if (remaining > 0) {
        startProgressAnimation(remaining);
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({x: 0, y: gestureState.dy});
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          navigation.goBack(); // 👈 Cerrar la historia al deslizar hacia abajo
        } else {
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const startProgressAnimation = () => {
    const currentStory = stories[currentIndex];
    const isImage = !isVideo(currentStory?.storyUrl);
    const duration = isImage ? 5000 : videoDurationRef.current || 0;

    const elapsed = progressValueRef.current || 0;
    const remaining = duration - elapsed;

    if (remaining > 0 && !shouldPauseAnimation.current) {
      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: remaining,
        useNativeDriver: false,
      });

      animationRef.current.start(({finished}) => {
        if (finished && !shouldPauseAnimation.current) {
          goToNextStory();
        }
      });
    }
  };

  useEffect(() => {
    if (DataUser.id && !route.params?.storyId) {
      fetchStories();
    }
  }, [DataUser.id, route.params?.storyId]);

  const fetchStories = async () => {
    try {
      const response = await getHttps(`stories/find/${DataUser.id}`);
      const apiStories = response.data;

      if (!Array.isArray(apiStories) || apiStories.length === 0) {
        console.log('⚠️ No hay historias disponibles');

        // 👉 Verifica si el usuario actual es el mismo y no tiene historias
        if (id === DataUser.id) {
          navigation.replace('AddStory');
        } else {
          navigation.goBack();
        }

        setLoading(false);
        return;
      }


      let groupedByUser = apiStories
        .filter(user => Array.isArray(user.stories) && user.stories.length > 0)
        .map(user => {
          const sortedStories = [...user.stories].sort(
            (a, b) =>
              new Date(a.date_created).getTime() -
              new Date(b.date_created).getTime(),
          );
          const allSeen = sortedStories.every(s => s.seen);

          return {
            user: user.user,
            stories: sortedStories.map(story => ({
              ...story,
              user: user.user,
            })),
            viewAllStories: allSeen,
          };
        });

      console.log(
        '✅ Usuarios agrupados con historias:',
        groupedByUser.map(g => g.user.id),
      );

      const originalUserOrder = apiStories
        .filter(user => Array.isArray(user.stories) && user.stories.length > 0)
        .map(user => user.user.id);

      console.log('📌 Orden original del JSON:', originalUserOrder);

      groupedByUser.sort(
        (a, b) =>
          originalUserOrder.indexOf(a.user.id) -
          originalUserOrder.indexOf(b.user.id),
      );

      console.log(
        '🔄 Orden después de respetar el JSON:',
        groupedByUser.map(g => g.user.id),
      );

      if (id !== DataUser.id) {
        groupedByUser = groupedByUser.filter(
          group => group.user.id !== DataUser.id,
        );
      }

      console.log(
        '🧾 Orden final de userStoryGroups:',
        groupedByUser.map(g => g.user.id),
      );

      const currentUserGroup = groupedByUser.find(
        group => group.user.id === id,
      );
      if (!currentUserGroup || currentUserGroup.stories.length === 0) {
        console.log('🚫 Usuario actual sin historias → volver');

        if (id === DataUser.id) {
          navigation.replace('AddStory');
        } else {
          navigation.goBack();
        }

        return;
      }

      const allStories = groupedByUser.flatMap(group => group.stories);
      const hasUnseen = currentUserGroup.stories.some(s => !s.seen);

      let startingIndex = 0;
      if (hasUnseen) {
        const firstUnseen = currentUserGroup.stories.find(s => !s.seen);
        startingIndex = allStories.findIndex(s => s.id === firstUnseen.id);
      } else {
        startingIndex = allStories.findIndex(
          s => s.id === currentUserGroup.stories[0].id,
        );
      }

      const userIndex = groupedByUser.findIndex(group => group.user.id === id);
      const isLastUser = userIndex === groupedByUser.length - 1;

      console.log('🔍 userIndex:', userIndex);
      console.log('🔚 isLastUser:', isLastUser);
      console.log('👁️ viewAllStories:', currentUserGroup.viewAllStories);
      console.log('🎯 startingIndex:', startingIndex);

      setIsOwner(currentUserGroup.user.id === DataUser.id);
      setStories(allStories);
      setUserStoryGroups(groupedByUser);
      setCurrentIndex(startingIndex);

      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: startingIndex,
          animated: false,
        });
      }, 100);

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      setLoading(false);
    }
  };

  const handleAnimationPauseState = () => {
    const anyModalOpen =
      openModal || openModal2 || editModalVisible || alertVisible;

    if (anyModalOpen) {
      if (!shouldPauseAnimation.current) {
        setIsPaused(true);
        shouldPauseAnimation.current = true;

        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
      }
    } else {
      if (shouldPauseAnimation.current) {
        setIsPaused(false);
        shouldPauseAnimation.current = false;

        const remaining = duration - (progressValueRef.current || 0);
        if (remaining > 0) {
          animationRef.current = Animated.timing(progress, {
            toValue: 1,
            duration: remaining,
            useNativeDriver: false,
          });

          animationRef.current.start(({finished}) => {
            if (finished && !shouldPauseAnimation.current) {
              goToNextStory();
            }
          });
        }
      }
    }
  };
  useEffect(() => {
    handleAnimationPauseState();
  }, [openModal, openModal2, editModalVisible, alertVisible]);

  const isVideo = url => {
    if (!url) return false;
    return /\.(mp4|mov|m4v|webm)$/i.test(url);
  };

  const handleNavigate = id => {
    setOpenModal(false);
    navigation.navigate('FriendTimeline', {id});
  };


  useEffect(() => {
    if (
      !stories.length ||
      !stories[currentIndex] ||
      shouldPauseAnimation.current
    )
      return;

    const currentStory = stories[currentIndex];
    const isCurrentStoryVideo = isVideo(currentStory.storyUrl);
    const isImage = !isCurrentStoryVideo;

    setIsCurrentVideo(isCurrentStoryVideo);
    setIsOwner(currentStory.user?.id === DataUser.id);
    hasEndedRef.current = false;
    activeAudioIndexRef.current = currentIndex;

    // Detener y resetear progreso
    if (animationRef.current) animationRef.current.stop();
    progress.setValue(0);

    if (isImage) {
      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      });

      animationRef.current.start(({finished}) => {
        if (finished && !shouldPauseAnimation.current) {
          goToNextStory();
        }
      });
    } else {
      isVideoLoadedRef.current = false; // 🟡 Esperar onVideoLoad para iniciar animación
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [currentIndex, stories, shouldPauseAnimation]);

  const goToNextStory = () => {
    if (!stories || stories.length === 0) {
      console.log('🛑 No hay historias cargadas aún');
      return;
    }

    const currentStory = stories[currentIndex];
    if (!currentStory || !currentStory.user?.id) {
      console.log('❌ currentStory o user.id es undefined');
      return;
    }

    const currentUserId = currentStory.user.id;
    const isLastStory = currentIndex >= stories.length - 1;

    console.log('🟡 currentIndex:', currentIndex);
    console.log('🟡 stories.length:', stories.length);
    console.log('🟡 currentUserId:', currentUserId);

    if (isLastStory) {
      console.log('🟥 Última historia global → cerrar');
      navigation.goBack();
      return;
    }

    const nextStory = stories[currentIndex + 1];
    const nextUserId = nextStory?.user?.id;

    console.log('🟢 nextStory.id:', nextStory?.id);
    console.log('🟢 nextUserId:', nextUserId);

    let newIndex = currentIndex + 1;

    if (nextUserId !== currentUserId) {
      const nextGroup = userStoryGroups.find(
        group => group.user.id === nextUserId,
      );
      if (nextGroup) {
        const firstStoryId = nextGroup.stories[0]?.id;
        const firstIndex = stories.findIndex(s => s.id === firstStoryId);
        if (firstIndex !== -1) {
          newIndex = firstIndex;
          console.log('🔁 Nuevo índice de historia de otro usuario:', newIndex);
        }
      }
    }

    console.log('➡️ Ir a historia siguiente:', newIndex);
    setCurrentIndex(newIndex);
    flatListRef.current?.scrollToIndex({index: newIndex, animated: true});
    progress.setValue(0);
  };

  /* 
const goToPreviousStory = () => {
  if (currentIndex === 0) {
    navigation.goBack();
    return;
  }

  const currentStory = stories[currentIndex];
  const previousStory = stories[currentIndex - 1];
  const currentUserId = currentStory?.user?.id;
  const previousUserId = previousStory?.user?.id;

  let newIndex = currentIndex - 1;

  if (previousUserId !== currentUserId) {
    const previousGroup = userStoryGroups.find(group => group.user.id === previousUserId);
    if (previousGroup) {
      const lastStoryId = previousGroup.stories.at(-1)?.id;
      const lastIndex = stories.findIndex(s => s.id === lastStoryId);
      if (lastIndex !== -1) {
        newIndex = lastIndex;
      }
    }
  }

  console.log('⬅️ Ir a historia anterior:', newIndex);
  setCurrentIndex(newIndex);
  flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
  progress.setValue(0);
};
 */

  const startAnimation = () => {
    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    const isImage = !isVideo(currentStory.storyUrl);
    const duration = isImage ? 5000 : videoDurationRef.current || 0;

    if (duration === 0) return; 

    if (animationRef.current) animationRef.current.stop();
    progress.setValue(0);

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    });

    animationRef.current.start(({finished}) => {
      if (finished && !shouldPauseAnimation.current) {
        goToNextStory();
      }
    });
  };

  const handlePressIn = () => {
    setIsPaused(true);
    shouldPauseAnimation.current = true;
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };

  const handlePressOut = () => {
    setIsPaused(false);
    shouldPauseAnimation.current = false;

    const elapsed = progressValueRef.current || 0;
    const remaining = duration - elapsed;

    if (remaining > 0) {
      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: remaining,
        useNativeDriver: false,
      });

      animationRef.current.start(({finished}) => {
        if (finished && !shouldPauseAnimation.current) {
          goToNextStory();
        }
      });
    }
  };

  const handleLongPress = () => {
    setIsPaused(true);
    shouldPauseAnimation.current = true;
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };

  const handleSend = useCallback(async () => {
    const storyId = stories[currentIndex].id;
    if (message.trim() === '') return;
    setIsSending(true);
    try {
      await sendMessageStory({
        content: message,
        storyid: storyId,
      });
      setMessage('');

      socket.emit('sendNotification', {
        senderId: DataUser.id,
        receiverId: id,
        message: message,
      });
      setSendingStatus('sent');
      setShowSentFeedback(true);
      setShowSentFeedback(false);
      setTimeout(() => {
        setSendingStatus(null); // Oculta el mensaje
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
    setMessage('');
    setInputHeight(40);
  }, [message, id, sendMessageStory]);

const handleViewableItemsChanged = ({ viewableItems }) => {
  if (viewableItems.length === 0) return;

  const visibleItem = viewableItems[0];
  const visibleIndex = visibleItem.index;

  if (visibleIndex === null || visibleIndex === undefined) return;

  setCurrentIndex(visibleIndex);

  const story = stories[visibleIndex];
  if (!story || !DataUser?.id) return;

  const isOwner = story.user?.id === DataUser.id;
  const alreadyViewed = viewedStoryIds.current.has(story.id);

  if (!isOwner && !alreadyViewed) {
    viewedStoryIds.current.add(story.id);

    postHttps('story-views', {
      storyid: story.id,
      user: DataUser.id,
    })
      .then(() =>
        console.log('👁️ Vista registrada correctamente:', story.id),
      )
      .catch(err => console.log('❌ Error al registrar la vista:', err));
  }
};



  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    const loadCounterIfOwner = async () => {
      const currentStory = stories[currentIndex];
      if (!currentStory || !isOwner) return;

      try {
        setCount(0);
        setIsLoadingCount(true);

        const response = await getHttps(`story-views/${currentStory.id}`);
        const data = response.data;
        setCount(data.count);

        setViewUsers(data.users);
        setIsLoadingCount(false);
      } catch (error) {
        console.error('Error fetching story view count:', error);
      }
    };

    const loadCounterIfOwner2 = async () => {
      const currentStory = stories[currentIndex];
      if (!currentStory || !isOwner) return;

      try {
        setCount2(0);
        setIsLoadingCount2(true);

        const response = await getHttps(`story-reactions/${currentStory.id}`);
        const data = response.data;
        setCount2(data.count);
        setViewUsers2(data.users);
        setIsLoadingCount2(false);
      } catch (error) {
        console.error('Error fetching story view count:', error);
      }
    };

    loadCounterIfOwner();
    loadCounterIfOwner2();
  }, [currentIndex, isOwner, stories]);

  const handleTouch = event => {
    const {locationX} = event.nativeEvent;
    const isLeft = locationX < width / 2;

    if (isLeft) {
      if (currentIndex === 0) {
        navigation.goBack();
        return;
      }

      const currentStory = stories[currentIndex];
      const previousStory = stories[currentIndex - 1];
      const currentUserId = currentStory?.user?.id;
      const previousUserId = previousStory?.user?.id;

      let newIndex = currentIndex - 1;

      if (previousUserId !== currentUserId) {
        const previousGroup = userStoryGroups.find(
          group => group.user.id === previousUserId,
        );
        if (previousGroup) {
          const lastStoryId = previousGroup.stories.at(-1)?.id;
          const lastIndex = stories.findIndex(s => s.id === lastStoryId);
          if (lastIndex !== -1) newIndex = lastIndex;
        }
      }

      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({index: newIndex, animated: true});
      startAnimation(); // ⬅️ Aquí
    } else {
      if (currentIndex >= stories.length - 1) {
        navigation.goBack();
        return;
      }

      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({index: newIndex, animated: true});
      startAnimation(); // ⬅️ Aquí
    }
  };



  const toggleReaction = async () => {
    const storyId = stories[currentIndex].id;

    // Cambiar inmediatamente el estado local (UI optimista)
    const newReactionState = !hasReacted;
    setHasReacted(newReactionState);

    const payload = {
      storyid: storyId,
      user: DataUser.id,
    };

    try {
      await postHttps('story-reactions', payload);
      // No hacemos nada más aquí, el estado ya se actualizó visualmente
    } catch (error) {
      console.log('Error al registrar/quitar reacción:', error);
      // Revertir cambio si falló la petición
      setHasReacted(!newReactionState);
    }
  };

  useEffect(() => {
    const storyId = stories[currentIndex]?.id;

    if (!storyId || !DataUser.id) return; // Asegura que ambos estén definidos

    const checkReaction = async () => {
      try {
        const res = await getHttps(`story-reactions/${storyId}/${DataUser.id}`);
        setHasReacted(res?.data?.status === '1');
      } catch (err) {
        console.log('Error al verificar reacción', err);
      }
    };

    checkReaction();
  }, [currentIndex, stories, DataUser.id]);

  const handleDeleteStory = async () => {
    setAlertVisible(true); // ✅ Mostrar alert y pausar animación
    Alert.alert(
      'Eliminar historia',
      '¿Estás seguro de que quieres eliminar esta historia?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setAlertVisible(false),
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const storyId = stories[currentIndex].id;
              await deleteHttps(`stories/${storyId}`);

              let updatedStories = stories.filter(
                (_, index) => index !== currentIndex,
              );
              setStories(updatedStories);

              if (updatedStories.length > 0) {
                setCurrentIndex(Math.max(currentIndex - 1, 0));
              } else {
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error al eliminar la historia:', error);
            } finally {
              setAlertVisible(false); // ✅ Ocultar alert y reanudar animación
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleUpdateStory = async () => {
    try {
      const storyId = stories[currentIndex].id;
      const formData = new FormData();

      // Añadir la descripción si existe
      if (editedDescription) {
        formData.append('caption', editedDescription);
      }

      // Añadir la imagen si existe
      if (editedImage) {
        formData.append('story', {
          uri: editedImage,
          type: 'image/jpeg', // Ajustar si es necesario
          name: 'story.jpg',
        });
      }

      await patchHttpsStories(`stories/${storyId}`, formData);

      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  const handleEditStory = async () => {
    try {
      const storyId = stories[currentIndex].id;
      const response = await getHttps(`stories/${storyId}`);
      const storyData = response.data;
      setEditedDescription(storyData.caption || '');
      setEditedImage(storyData.storyUrl || null);
      setEditModalVisible(true);
    } catch (error) {
      console.error('Error fetching story for editing:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Solo reanudar si no hay modales abiertos
      if (!openModal && !openModal2 && !editModalVisible && !alertVisible) {
        setIsPaused(false);
        shouldPauseAnimation.current = false;

        const remaining = duration - (progressValueRef.current || 0);
        if (remaining > 0) {
          progress.setValue(progressValueRef.current / duration);
          animationRef.current = Animated.timing(progress, {
            toValue: 1,
            duration: remaining,
            useNativeDriver: false,
          });
          animationRef.current.start(({finished}) => {
            if (finished && !shouldPauseAnimation.current) {
              goToNextStory();
            }
          });
        }
      }

      return () => {
        // Al salir, pausa
        setIsPaused(true);
        shouldPauseAnimation.current = true;
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    }, [openModal, openModal2, editModalVisible, alertVisible]),
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={handleTouch}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={300}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateY: pan.y}],
          },
        ]}
        {...panResponder.panHandlers}>
        {stories.length > 0 ? (
          <View style={{flex: 1}}>
            {/* BARRAS DE PROGRESO SOLO DEL USUARIO ACTUAL */}
            <ProgressBars
              stories={stories}
              currentIndex={currentIndex}
              userStoryGroups={userStoryGroups}
              progress={progress}
              insets={insets}
            />

            {/* FLATLIST DE HISTORIAS */}
            <Animated.FlatList
              ref={flatListRef}
              data={stories}
              keyExtractor={item =>
                item.id?.toString() || Math.random().toString()
              }
              onMomentumScrollEnd={e => {
                const newIndex = Math.round(
                  e.nativeEvent.contentOffset.x / width,
                );
                if (newIndex !== currentIndex) {
                  setCurrentIndex(newIndex);
                  startAnimation(); // ⬅️ Aquí también
                }
              }}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {x: scrollX}}}],
                {useNativeDriver: true},
              )}
              

                onViewableItemsChanged={handleViewableItemsChanged}
               viewabilityConfig={viewabilityConfig}
              snapToInterval={width}
              snapToAlignment="center"
              decelerationRate="fast"
              getItemLayout={(_, index) => ({
                length: width, // ancho de la pantalla (asumiendo que cada historia ocupa toda la pantalla)
                offset: width * index,
                index,
              })}
              renderItem={({item, index}) => (
                <StoryItem
                  item={item}
                  index={index}
                  scrollX={scrollX}
                  isVideo={isVideo}
                  currentIndex={currentIndex}
                  isPaused={isPaused}
                  shouldPauseAnimation={shouldPauseAnimation}
                  progress={progress}
                  goToNextStory={goToNextStory}
                  navigation={navigation}
                  setIsCurrentVideo={setIsCurrentVideo}
                  videoRef={videoRef}
                  onVideoLoad={durationMs => {
                    if (durationMs > 0) {
                      videoDurationRef.current = durationMs;
                      isVideoLoadedRef.current = true;
                      startAnimation();
                    }
                  }}
                />
              )}
            />
          </View>
        ) : (
          <View style={styles.noStoriesContainer}>
            <Text style={styles.noStoriesText}>
              No hay historias para mostrar
            </Text>
          </View>
        )}

        {isOwner ? (
          <ConfigBar
            onViewPress={() => {
              setOpenModal(true);
              handleAnimationPauseState(); // detener animación al abrir
            }}
            onReactionsPress={() => {
              setOpenModal2(true);
              handleAnimationPauseState(); // detener animación al abrir
            }}
            onEditPress={() => {
              handleEditStory();
              handleAnimationPauseState(); // si handleEditStory abre modal, forzamos pausa
            }}
            onDeletePress={() => {
              handleDeleteStory();
              handleAnimationPauseState(); // opcional, por seguridad
            }}
            isLoadingCount={isLoadingCount}
            Count={Count}
            Count2={Count2}
          />
        ) : (
          // 🔥 Si NO es el dueño, muestra la caja de mensajes
          <MessageInput
            message={message}
            setMessage={setMessage}
            handleSend={handleSend}
            inputHeight={inputHeight}
            setInputHeight={setInputHeight}
            toggleReaction={toggleReaction}
            hasReacted={hasReacted}
            isSending={isSending}
          />
        )}

        <EditStoryModal
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            handleAnimationPauseState(); // PAUSAR O REANUDAR
          }}
          onSave={handleUpdateStory}
          loading={loading}
          pickImage={pickImage}
          editedImage={editedImage}
          setEditedImage={setEditedImage}
          editedDescription={editedDescription}
          setEditedDescription={setEditedDescription}
        />
        <ViewersModal
          visible={openModal}
          onClose={() => {
            setOpenModal(false);
            handleAnimationPauseState(); // PAUSAR O REANUDAR
          }}
          users={ViewUsers}
          onNavigate={handleNavigate}
        />

        <ReactionsModal
          visible={openModal2}
          onClose={() => {
            setOpenModal2(false);
            handleAnimationPauseState(); // PAUSAR O REANUDAR
          }}
          users={ViewUsers2}
          onNavigate={handleNavigate}
        />

        {sendingStatus === 'sent' && (
          <View style={styles.sendingStatus}>
            <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>
              Respuesta enviada
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  /* esta */ container: {flex: 1, backgroundColor: 'black'},
  /* esta */ loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },

  /* esta */ noStoriesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* esta */ noStoriesText: {color: 'white', fontSize: 16},
  sendingStatus: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    opacity: 0.9,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ViewStories;
