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
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  TouchableWithoutFeedback,
  Modal,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage, {
  useAsyncStorage,
} from '@react-native-async-storage/async-storage';
import {
  getHttps,
  patchHttpsStories,
  deleteHttps,
  postHttps,
} from '../api/axios';
import {launchImageLibrary} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import {SocketContext} from '../context/SocketContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {Platform} from 'react-native';
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
  const {
    socket,
    sendMessage,
    setChatActive,
    removeChatActive,
    sendMessageStory,
  } = useContext(SocketContext);
  const animation = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSentFeedback, setShowSentFeedback] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(null);
  const [Count, setCount] = useState(0);
  const [Count2, setCount2] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isLoadingCount2, setIsLoadingCount2] = useState(false);
  const [ViewUsers, setViewUsers] = useState({});
  const [ViewUsers2, setViewUsers2] = useState({});

  const currentIndexRef = useRef(currentIndex);

  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);

  const [inputHeight, setInputHeight] = useState(40);
  const [hasReacted, setHasReacted] = useState(false);

  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  const hasEndedRef = useRef(false);

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
          navigation.navigate('Event');
        }
      }
    };

    loadSpecificStory();
  }, [route.params.storyId]);

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
        setLoading(false);
        return;
      }

      const hasOwnStory = apiStories.some(
        item =>
          item.user.id === DataUser.id &&
          Array.isArray(item.stories) &&
          item.stories.length > 0,
      );

      const hasRouteUserStory = apiStories.some(
        item =>
          item.user.id === id &&
          Array.isArray(item.stories) &&
          item.stories.length > 0,
      );

      if (!hasOwnStory && !hasRouteUserStory) {
        navigation.replace('AddStory');
        return;
      }

      // Ordenar priorizando el usuario de la ruta
      const sortedStories = apiStories.sort((a, b) =>
        a.user.id === id ? -1 : b.user.id === id ? 1 : 0,
      );

      // Agrupar por usuario con sus stories
      let groupedByUser = sortedStories
        .filter(user => Array.isArray(user.stories) && user.stories.length > 0)
        .map(user => ({
          user: user.user,
          stories: user.stories.map(story => ({
            ...story,
            user: user.user,
          })),
        }));

      // 🟣 Filtra para evitar que tus stories se incluyan cuando no deben
      if (id !== DataUser.id) {
        groupedByUser = groupedByUser.filter(
          group => group.user.id !== DataUser.id,
        );
      }

      // Aplanar para flatlist
      const allStories = groupedByUser.flatMap(group => group.stories);

      // Si no hay stories válidas, redirige
      if (allStories.length === 0) {
        navigation.replace('AddStory');
        return;
      }

      setIsOwner(allStories[0].user.id === DataUser.id);
      setStories(allStories);
      setUserStoryGroups(groupedByUser);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  const isVideo = url => {
    if (!url) return false;
    return /\.(mp4|mov|m4v|webm)$/i.test(url);
  };

  const handleNavigate = id => {
    setOpenModal(false);
    navigation.navigate('FriendTimeline', {id});
  };

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    if (stories.length === 0) return;

    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    const isCurrentStoryVideo = isVideo(currentStory.storyUrl);

    const isImage = !isCurrentStoryVideo;

    setIsCurrentVideo(isCurrentStoryVideo);
    setIsOwner(currentStory.user?.id === DataUser.id);

    // 🔁 Reiniciar protecciones
    hasEndedRef.current = false;
    activeAudioIndexRef.current = currentIndex;

    // 🧼 Limpiar animación
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    progress.setValue(0);

    // 👁 Registrar vista si no es del dueño
    if (currentStory.user?.id !== DataUser.id) {
      postHttps('story-views', {
        storyid: currentStory.id,
        user: DataUser.id,
      })
        .then(res => console.log('✅ Vista registrada:', res.data))
        .catch(err => console.log('❌ Error al registrar vista:', err));
    }

    // 🖼 Imagen
    if (!isAnimationPaused && isImage) {
      const duration = 5000;
      console.log(`▶️ Imagen con animación de ${duration}ms`);

      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      });

      animationRef.current.start(({finished}) => {
        if (finished && !isAnimationPaused) {
          goToNextStory();
        }
      });
    }

    return () => {
      console.log('🧹 Cleanup al salir de historia');
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [currentIndex, stories, isAnimationPaused]);

  const goToNextStory = () => {
    const nextIndex = currentIndexRef.current + 1;
    console.log(
      `➡️ Pasando de historia ${currentIndexRef.current} a ${nextIndex} (de ${stories.length})`,
    );

    if (nextIndex < stories.length) {
      flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
      setCurrentIndex(nextIndex);
    } else {
      console.log('🚪 Navegando a Event');
      navigation.navigate('Event');
    }
  };

  const handlePressIn = () => {
    setIsPaused(true);
    isAnimationPaused.current = true;
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };

  const handlePressOut = () => {
    setIsPaused(false);
    isAnimationPaused.current = false;
    // No reinicies aquí. El useEffect se encargará si corresponde.
  };

  const handleLongPress = () => {
    setIsPaused(true);
    isAnimationPaused.current = true;
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };

  const handleSend = useCallback(async () => {
    const storyId = stories[currentIndex].id;
    if (message.trim() === '') return;

    try {
      await sendMessageStory({
        receiver: id,
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
    }
    setMessage('');
    setInputHeight(40);
  }, [message, id, sendMessageStory]);

  const handleViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const isAnimationPaused = editModalVisible || alertVisible || openModal;

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

    setCurrentIndex(prevIndex => {
      let newIndex;
      if (locationX < width / 2) {
        newIndex = Math.max(prevIndex - 1, 0);
      } else {
        newIndex = prevIndex + 1 < stories.length ? prevIndex + 1 : prevIndex;
      }

      setIsOwner(stories[newIndex]?.user?.id === DataUser.id);

      if (newIndex !== prevIndex) {
        flatListRef.current?.scrollToIndex({index: newIndex, animated: true});
      } else {
        navigation.goBack();
      }

      progress.setValue(0);
      return newIndex;
    });
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

  const updateProgress = (current, total) => {
    const ratio = total > 0 ? current / total : 0;
    progress.setValue(ratio);
  };

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
      delayLongPress={300} // opcional
    >
      <View style={styles.container}>
        {stories.length > 0 ? (
          <View style={{flex: 1}}>
            {/* BARRAS DE PROGRESO SOLO DEL USUARIO ACTUAL */}
            <View style={styles.progressBarsWrapper}>
              {(() => {
                const currentStory = stories[currentIndex];
                if (!currentStory) return null;

                const userGroup = userStoryGroups.find(
                  group => group.user.id === currentStory.user.id,
                );
                if (!userGroup) return null;

                return (
                  <View style={styles.progressGroup}>
                    {userGroup.stories.map((story, idx) => {
                      const globalIndex = stories.findIndex(
                        s => s.id === story.id,
                      );
                      return (
                        <View
                          key={story.id || idx}
                          style={styles.progressBarBackground}>
                          <Animated.View
                            style={[
                              styles.progressBar,
                              globalIndex === currentIndex
                                ? {
                                    width: progress.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: ['0%', '100%'],
                                    }),
                                  }
                                : globalIndex < currentIndex
                                ? {width: '100%'}
                                : {width: '0%'},
                            ]}
                          />
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </View>

            {/* FLATLIST DE HISTORIAS */}
            <Animated.FlatList
              ref={flatListRef}
              data={stories}
              keyExtractor={item =>
                item.id?.toString() || Math.random().toString()
              }
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
              renderItem={({item, index}) => {
                const inputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ];

                const rotateY = scrollX.interpolate({
                  inputRange,
                  outputRange: ['50deg', '0deg', '-50deg'],
                  extrapolate: 'clamp',
                });

                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.9, 1, 0.9],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    style={[
                      styles.storyContainer,
                      {transform: [{rotateY}, {scale}]},
                    ]}>
                    {isVideo(item.storyUrl) && currentIndex === index ? (
                      <Video
                        ref={videoRef}
                        source={{uri: item.storyUrl}}
                        style={styles.storyImage}
                        resizeMode="cover"
                        repeat={false}
                        paused={currentIndex !== index || isPaused}
                        muted={false}
                        onLoad={meta => {
                          const durationMs = (meta.duration || 0) * 1000;

                          if (
                            index === currentIndex &&
                            item.id &&
                            durationMs >= 1000
                          ) {
                            console.log(
                              '🎬 Video cargado con duración:',
                              durationMs,
                            );

                            progress.setValue(0);

                            if (animationRef.current) {
                              animationRef.current.stop();
                              animationRef.current = null;
                            }

                            animationRef.current = Animated.timing(progress, {
                              toValue: 1,
                              duration: durationMs,
                              useNativeDriver: false,
                            });

                            animationRef.current.start(({finished}) => {
                              if (finished && !isPaused) {
                                console.log(
                                  '⏭️ Video terminado, pasando a siguiente historia',
                                );
                                goToNextStory();
                              } else {
                                console.log('⏸️ Video pausado o interrumpido');
                              }
                            });
                          }
                        }}
                        onEnd={() => {
                          progress.setValue(1);
                          goToNextStory();
                        }}
                      />
                    ) : (
                      <Image
                        source={{uri: item.storyUrl}}
                        style={styles.storyImage}
                      />
                    )}

                    <View style={styles.header}>
                      <View style={styles.userInfo}>
                        <Image
                          source={{uri: item.user.img}}
                          style={styles.profileImage}
                        />
                        <Text style={styles.username}>
                          {item.user.first_name} {item.user.last_name}
                        </Text>
                      </View>

                      <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.closeButton}>✖</Text>
                      </TouchableOpacity>
                    </View>

                    {item.caption ? (
                      <View style={styles.captionContainer}>
                        <Text style={styles.captionText}>{item.caption}</Text>
                      </View>
                    ) : null}
                  </Animated.View>
                );
              }}
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
          <View style={styles.configBar}>
            <TouchableOpacity
              style={styles.configButton}
              activeOpacity={0.7}
              onPress={() => setOpenModal(true)}>
              <MaterialIcons name="remove-red-eye" size={24} color="#4CAF50" />
              {isLoadingCount ? (
                <ActivityIndicator
                  size="small"
                  color="#4CAF50"
                  style={{marginTop: 4}}
                />
              ) : (
                <Text style={styles.configText}>{Count}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configButton}
              activeOpacity={0.7}
              onPress={() => setOpenModal2(true)}>
              <MaterialIcons name="favorite" size={24} color="red" />
              {isLoadingCount ? (
                <ActivityIndicator
                  size="small"
                  color="#4CAF50"
                  style={{marginTop: 4}}
                />
              ) : (
                <Text style={styles.configText}>{Count2}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configButton}
              onPress={handleEditStory}
              activeOpacity={0.7}>
              <MaterialIcons name="edit" size={24} color="#2196F3" />
              <Text style={styles.configText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configButton}
              onPress={handleDeleteStory}
              activeOpacity={0.7}>
              <MaterialIcons name="delete" size={24} color="#F44336" />
              <Text style={styles.configText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 🔥 Si NO es el dueño, muestra la caja de mensajes
          <View style={styles.bottomContainer}>
            {/* Contenedor del input + botón de enviar */}
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
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <FontAwesome name="send" size={22} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={toggleReaction}
              style={styles.reactButton}>
              <FontAwesome
                name="heart"
                size={25}
                color={hasReacted ? 'red' : 'gray'}
              />
            </TouchableOpacity>
          </View>
        )}

        <Modal
          transparent
          animationType="slide"
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeButton}>✖</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Editar Publicación</Text>

              <View style={styles.imageSection}>
                {editedImage ? (
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{uri: editedImage}}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setEditedImage(null)}>
                      <Text style={styles.removeButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickImage}
                    style={styles.imageButton}>
                    <Text style={styles.addButtonText}>📷 Agregar Imagen</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input3}
                placeholder="Editar descripción"
                placeholderTextColor="gray"
                value={editedDescription}
                onChangeText={setEditedDescription}
                multiline={true}
              />

              <View style={{top: 20}}>
                <TouchableOpacity
                  onPress={handleUpdateStory}
                  style={styles.saveButton}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={openModal}
          onRequestClose={() => setOpenModal(false)}>
          <View style={modalstyles.modalOverlay}>
            <View style={modalstyles.modalContainer}>
              <Text style={modalstyles.modalTitle}>Visto por</Text>

              {ViewUsers.length > 0 ? (
                <FlatList
                  data={ViewUsers}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={modalstyles.userItem}
                      onPress={() => handleNavigate(item.id)}>
                      <Image
                        source={{
                          uri: item.img
                            ? item.img
                            : 'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png',
                        }}
                        style={modalstyles.profileImage}
                      />
                      <View style={{marginLeft: 10}}>
                        <Text style={modalstyles.userName}>
                          {item.first_name} {item.last_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  style={{maxHeight: '80%'}}
                />
              ) : (
                <Text style={modalstyles.emptyText}>
                  Nadie ha visto esta historia aún.
                </Text>
              )}

              <TouchableOpacity
                style={modalstyles.closeButton}
                onPress={() => setOpenModal(false)}>
                <Text style={modalstyles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={openModal2}
          onRequestClose={() => setOpenModal2(false)}>
          <View style={modalstyles.modalOverlay}>
            <View style={modalstyles.modalContainer}>
              <Text style={modalstyles.modalTitle}>Reaccionado por </Text>

              {ViewUsers2.length > 0 ? (
                <FlatList
                  data={ViewUsers2}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={modalstyles.userItem}
                      onPress={() => handleNavigate(item.id)}>
                      <Image
                        source={{
                          uri: item.img
                            ? item.img
                            : 'https://static-00.iconduck.com/assets.00/profile-default-icon-2048x2045-u3j7s5nj.png',
                        }}
                        style={modalstyles.profileImage}
                      />
                      <View style={{marginLeft: 10}}>
                        <Text style={modalstyles.userName}>
                          {item.first_name} {item.last_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  style={{maxHeight: '80%'}}
                />
              ) : (
                <Text style={modalstyles.emptyText}>
                  Nadie ha reaccionado a esta historia aún.
                </Text>
              )}

              <TouchableOpacity
                style={modalstyles.closeButton}
                onPress={() => setOpenModal2(false)}>
                <Text style={modalstyles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {sendingStatus === 'sent' && (
          <View
            style={{
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
            }}>
            <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>
              Respuesta enviada
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
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
  progressBarsWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  progressGroup: {
    flexDirection: 'row',
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 1,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
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
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    perspective: 1500,
  },
  storyImage: {width, height: height - 30, resizeMode: 'cover'},
  header: {
    position: 'absolute',
    top: 30,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {flexDirection: 'row', alignItems: 'center'},
  profileImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  username: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  timestamp: {color: 'gray', fontSize: 12, marginLeft: 5},
  closeButton: {color: 'white', fontSize: 24, fontWeight: 'bold'},
  noStoriesContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  noStoriesText: {color: 'white', fontSize: 16},
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {backgroundColor: 'transparent', padding: 10},
  likeText: {fontSize: 32, color: 'white'},
  liked: {color: 'red'},
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
  sendButtonText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
  progressBarContainer: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: '100%',
    position: 'absolute',
    top: 10,
  },
  progressBar: {height: 5, backgroundColor: 'white'},
  ownerOptionsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 18,
  },
  input3: {
    color: 'black',
    fontSize: 16,
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginBottom: 15,
    textAlignVertical: 'top',
    height: 50,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContainer2: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  imageButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF80',
  },
  captionText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',

    flexWrap: 'wrap',
    fontFamily: 'Poppins-Light',
  },
  audioCardWhite: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
    marginBottom: 24,
    width: '80%',
  },
  gifWrapperWhite: {
    width: 220,
    height: 220,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioGif: {
    width: '100%',
    height: '100%',
  },

  progressBarFillCustom: {
    height: '100%',
    backgroundColor: '#914cf0', // o el color que tú prefieras
  },
  timeRowWhite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  timeTextWhite: {
    fontSize: 12,
    color: '#444',
  },
  progressBarCustom: {
    width: '80%',
    height: 4,
    backgroundColor: 'black', // 👈 temporal
    marginBottom: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
});

const modalstyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Mostrar desde abajo
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'black',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    textAlign: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#944af5',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
  },
});

export default ViewStories;
