import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Image,
  useColorScheme,
  PermissionsAndroid,
  Linking,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import {useRoute, useNavigation} from '@react-navigation/native';
import {getHttps, postHttps, postHttpsStories} from '../api/axios';
import {SocketContext} from '../context/SocketContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {COLORS} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {pick} from '@react-native-documents/picker';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import VideoPost from '../components/VideoPost';

const ChatParche = () => {
  const {id: parcheId} = useRoute().params;
  const navigation = useNavigation();
  const {socket} = useContext(SocketContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [messages, setMessages] = useState([]);
  const [DataUser, setDataUser] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentDownloadJob, setCurrentDownloadJob] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState(null); // 'image' | 'video'
  const [previewUrl, setPreviewUrl] = useState('');
  const ITEM_WIDTH = Dimensions.get('window').width - 40;
  const FIXED_HEIGHT = 450;
  const [isSending, setIsSending] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

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

      // ✅ Actualizar mensajes con fetchMessages al recibir mensaje
      const onParcheMessage = () => {
        fetchMessages();
      };

      socket.on('parcheMessage', onParcheMessage);

      return () => {
        socket.emit('leaveParche', parcheId);
        socket.off('parcheMessage', onParcheMessage);
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
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileType: msg.fileType,
        user: {
          _id: msg.sender.id,
          name: msg.sender.fullName,
          avatar: msg.sender.img,
        },
      }));

      setMessages(formatted.reverse());
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);

        const allGranted = Object.values(granted).every(
          v => v === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (!allGranted) {
          Alert.alert(
            'Permiso requerido',
            'Por favor habilita los permisos de cámara y almacenamiento para usar esta función.',
          );
          return false;
        }
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const downloadFile = async (fileUrl, fileName, messageId) => {
    try {
      setDownloadingId(messageId);
      setDownloadProgress(0);

      const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const download = RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: destPath,
        progressDivider: 1,
        progress: data => {
          const percentage = data.bytesWritten / data.contentLength;
          setDownloadProgress(percentage);
        },
      });

      setCurrentDownloadJob(download); // ✅ guarda el job para cancelar si es necesario

      await download.promise;

      setDownloadProgress(1);

      // ✅ mostrar verde completo por 0.5s
      setTimeout(() => {
        setDownloadingId(null);
        setDownloadProgress(0);
        setCurrentDownloadJob(null); // limpia job
      }, 500);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      setDownloadingId(null);
      setDownloadProgress(0);
      setCurrentDownloadJob(null);
    }
  };

  const cancelDownload = () => {
    if (currentDownloadJob) {
      currentDownloadJob.stop(); // ✅ cancela la descarga en RNFS
      setDownloadingId(null);
      setDownloadProgress(0);
      setCurrentDownloadJob(null);
      console.log('Descarga cancelada');
    }
  };

  const getFileIcon = fileType => {
    if (!fileType) return 'insert-drive-file';

    if (fileType.includes('pdf')) return 'picture-as-pdf';
    if (fileType.includes('excel') || fileType.includes('spreadsheet'))
      return 'grid-on';
    if (fileType.includes('audio')) return 'audiotrack';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'videocam';

    return 'insert-drive-file';
  };
  const openAttachmentMenu = () => setShowAttachmentModal(true);

  const pickImageOrVideo = () => {
    launchImageLibrary({mediaType: 'mixed'}, response => {
      if (response.assets?.length) {
        setSelectedFile(response.assets[0]);
        setShowFileModal(true);
      }
    });
  };

  const pickDocument = async () => {
    try {
      const [res] = await pick({
        mode: 'open',
        type: '*/*',
        requestLongTermAccess: false,
      });

      if (res && res.uri && res.name) {
        const destPath = `${RNFS.DownloadDirectoryPath}/${res.name}`;

        const fileContents = await RNFS.readFile(res.uri, 'base64');
        await RNFS.writeFile(destPath, fileContents, 'base64');

        setSelectedFile({
          uri: res.uri,
          type: res.type,
          fileName: res.name,
          size: res.size,
        });
        setShowFileModal(true);
      }
    } catch (err) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('Selección cancelada');
      } else {
        console.error('Error al seleccionar documento:', err);
        Alert.alert('Error', 'No se pudo procesar el documento.');
      }
    }
  };

  const renderMessageText = props => {
    const {text} = props.currentMessage;

    // Detecta si hay un link en el texto
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <Text style={{color: 'white', fontFamily: 'Poppins-Light', fontSize: 14}}>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <Text
                key={index}
                style={{color: '#4fa3f7', textDecorationLine: 'underline'}}
                onPress={() => Linking.openURL(part)}>
                {part}
              </Text>
            );
          } else {
            return <Text key={index}>{part}</Text>;
          }
        })}
      </Text>
    );
  };

  const handleSend = async () => {
    if (inputMessage.trim() === '' && !selectedFile) return;
    setIsSending(true);

    let filePayload = {};

    // Subir archivo si hay
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type || 'application/octet-stream',
        name: selectedFile.fileName || selectedFile.name || 'archivo',
      });

      try {
        const response = await postHttpsStories('parche-chat/upload', formData);

        filePayload = {
          fileUrl: response.data.fileUrl,
          fileName: response.data.fileName,
          fileType: response.data.fileType,
        };
      } catch (err) {
        console.error('Error al subir archivo:', err);
        Alert.alert('Error', 'No se pudo enviar el archivo.');
        setIsSending(false);
        return;
      }
    }

    const messageContent = inputMessage.trim() || '[Archivo adjunto]';

    socket.emit('sendParcheMessage', {
      parcheId,
      content: messageContent,
      senderId: DataUser.id,
      ...filePayload,
    });

    setInputMessage('');
    setInputHeight(40);
    setSelectedFile(null);
    setShowFileModal(false);
    setIsSending(false);
  };

  useEffect(() => {
    fetchMessages();

    if (socket && parcheId) {
      socket.emit('joinParche', parcheId); // ✅ solo el número

      const handleMessage = msg => {
        setMessages(prev => [
          {
            _id: msg.id,
            text: msg.content,
            createdAt: new Date(msg.timestamp),
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            fileType: msg.fileType,
            user: {
              _id: msg.sender.id,
              name: msg.sender.fullName,
              avatar: msg.sender.img,
            },
          },
          ...prev,
        ]);
      };

      socket.on('parcheMessage', handleMessage); // ✅ nombre correcto

      return () => {
        socket.emit('leaveParche', parcheId);
        socket.off('parcheMessage', handleMessage);
      };
    }
  }, [parcheId, socket]);

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
        <Text style={styles.headerTitle}>Chat del Parche</Text>
        <View style={{width: 40}} />
      </View>

      <GiftedChat
        messages={messages}
        user={{_id: DataUser.id}}
        renderUsernameOnMessage={true}
        keyboardShouldPersistTaps="always"
        scrollToBottom
        renderMessageText={renderMessageText}
        bottomOffset={Platform.OS === 'ios' ? 40 : 0}
        renderInputToolbar={() => (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={{top: 15, left: 5}}
              onPress={openAttachmentMenu}>
              <FontAwesome
                name="paperclip"
                size={24}
                color={'white'}
                style={{marginHorizontal: 8}}
              />
            </TouchableOpacity>

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
              <TouchableOpacity onPress={handleSend} disabled={isSending}>
                <View style={styles.sendButton}>
                  <FontAwesome name="send" size={22} color={'white'} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Modal nativo para confirmar envío */}
            <Modal visible={showFileModal} transparent animationType="fade">
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: '#3d3d3d',
                    padding: 20,
                    borderRadius: 10,
                    width: '80%',
                  }}>
                  <Text style={{color: 'white', marginBottom: 10}}>
                    ¿Enviar este archivo?
                  </Text>
                  <Text style={{color: 'white'}}>
                    Nombre: {selectedFile?.name || selectedFile?.fileName}
                  </Text>
                  <Text style={{color: 'white'}}>
                    Tamaño: {Math.round((selectedFile?.size || 0) / 1024)} KB
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 15,
                    }}>
                    <TouchableOpacity
                      onPress={() => setShowFileModal(false)}
                      style={{marginRight: 20}}>
                      <Text style={{color: 'red'}}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSend} disabled={isSending}>
                      <Text style={{color: 'green'}}>Enviar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}
        renderBubble={props => {
          const isSentByCurrentUser =
            props.currentMessage.user._id === DataUser.id;

          const fileUrl = props.currentMessage.fileUrl;
          const fileType = props.currentMessage.fileType;
          const isThisDownloading = downloadingId === props.currentMessage._id;

          // 👉 Renderizar archivo adjunto si existe
          if (fileUrl) {
            const isImage = fileType?.includes('image');
            const isVideo = fileType?.includes('video');

            return (
              <View
                style={{
                  backgroundColor: isSentByCurrentUser ? '#944af5' : '#3d3d3d',
                  padding: 8,
                  borderRadius: 12,
                  margin: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: isSentByCurrentUser ? 'flex-end' : 'flex-start',
                  maxWidth: '40%',
                  minHeight: 10,
                }}>
                {/* Icono del tipo de archivo */}
                <MaterialIcons
                  name={getFileIcon(fileType)}
                  size={24}
                  color="white"
                  style={{marginRight: 8}}
                />

                {/* Texto Archivo */}
                <Text style={{color: 'white', flex: 1}}>Archivo</Text>

                {/* Botón de preview si es imagen o video */}
                {isImage || isVideo ? (
                  <TouchableOpacity
                    onPress={() => {
                      setPreviewType(isImage ? 'image' : 'video');
                      setPreviewUrl(fileUrl);
                      setShowPreviewModal(true);
                    }}>
                    <MaterialIcons
                      name="remove-red-eye"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                ) : isThisDownloading ? (
                  downloadProgress === 1 ? (
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: 'green',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <MaterialIcons
                        name="file-download"
                        size={20}
                        color="white"
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={cancelDownload}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: 'green',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <MaterialIcons name="close" size={18} color="white" />
                    </TouchableOpacity>
                  )
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      downloadFile(fileUrl, 'Archivo', props.currentMessage._id)
                    }>
                    <MaterialIcons
                      name="file-download"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          }

          // 👉 Renderizar mensaje normal
          return (
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
              usernameStyle={{
                left: {
                  color: '#ccc',
                  fontSize: 12,
                  fontFamily: 'Poppins-Medium',
                  marginBottom: 2,
                  marginLeft: 6,
                },
              }}
            />
          );
        }}
        renderAvatar={props => {
          const userId = props.currentMessage.user._id;
          const isMe = userId === DataUser.id;

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(isMe ? 'Profile' : 'FriendTimeline', {
                  id: userId,
                })
              }>
              <Image
                source={{uri: props.currentMessage.user.avatar}}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  marginLeft: 4,
                  marginRight: 4,
                }}
              />
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={showPreviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreviewModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{position: 'absolute', top: 40, right: 20, zIndex: 10}}
            onPress={() => setShowPreviewModal(false)}>
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>

          {previewType === 'image' && (
            <FastImage
              source={{uri: previewUrl}}
              style={{width: '90%', height: '70%'}}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}

          {previewType === 'video' && (
            <VideoPost
              videoUrl={previewUrl}
              isVisible={true}
              style={{width: ITEM_WIDTH, height: FIXED_HEIGHT}}
              shouldPause={false}
            />
          )}
        </View>
      </Modal>
      <Modal visible={showAttachmentModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}>
          <View
            style={{
              backgroundColor: '#222',
              padding: 20,
              borderRadius: 10,
              width: '80%',
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 10,
              }}>
              Selecciona una opción
            </Text>

            {/* Cámara (foto) */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 8,
              }}
              onPress={async () => {
                setShowAttachmentModal(false);
                const granted = await requestCameraPermission();
                if (!granted) return;

                launchCamera({mediaType: 'photo'}, async response => {
                  if (response.assets?.length) {
                    const asset = response.assets[0];

                    try {
                      const stats = await RNFS.stat(asset.uri);
                      const sizeBytes = stats.size;

                      const formatFileSize = bytes => {
                        if (!bytes || isNaN(bytes)) return '0 KB';

                        const kb = bytes / 1024;
                        if (kb < 1024) {
                          return `${kb.toFixed(1)} KB`;
                        }

                        const mb = kb / 1024;
                        return `${mb.toFixed(2)} MB`;
                      };

                      const fileWithSize = {
                        ...asset,
                        size: sizeBytes,
                        formattedSize: formatFileSize(sizeBytes),
                      };

                      setSelectedFile(fileWithSize);
                      setShowFileModal(true);
                    } catch (err) {
                      console.warn(
                        'No se pudo obtener el tamaño de la imagen:',
                        err,
                      );
                    }
                  }
                });
              }}>
              <MaterialIcons
                name="photo-camera"
                size={24}
                color="white"
                style={{marginRight: 10}}
              />
              <Text style={{color: 'white', fontSize: 16}}>Cámara (foto)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 8,
              }}
              onPress={async () => {
                setShowAttachmentModal(false);
                const granted = await requestCameraPermission();
                if (!granted) return;

                launchCamera(
                  {mediaType: 'video', videoQuality: 'high'},
                  async response => {
                    if (response.assets?.length) {
                      const asset = response.assets[0];

                      try {
                        const stats = await RNFS.stat(asset.uri);
                        const sizeBytes = stats.size;

                        const formatFileSize = bytes => {
                          const kb = bytes / 1024;
                          if (kb < 1024) return `${kb.toFixed(1)} KB`;
                          return `${(kb / 1024).toFixed(2)} MB`;
                        };

                        const fileWithSize = {
                          ...asset,
                          size: sizeBytes,
                          formattedSize: formatFileSize(sizeBytes),
                        };

                        setSelectedFile(fileWithSize);
                        setShowFileModal(true);
                      } catch (err) {
                        console.warn(
                          'No se pudo obtener el tamaño del video:',
                          err,
                        );
                      }
                    }
                  },
                );
              }}>
              <MaterialIcons
                name="videocam"
                size={24}
                color="white"
                style={{marginRight: 10}}
              />
              <Text style={{color: 'white', fontSize: 16}}>Grabar video</Text>
            </TouchableOpacity>

            {/* Galería */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 8,
              }}
              onPress={() => {
                setShowAttachmentModal(false);
                launchImageLibrary({mediaType: 'photo'}, response => {
                  if (response.assets?.length) {
                    setSelectedFile(response.assets[0]);
                    setShowFileModal(true);
                  }
                });
              }}>
              <MaterialIcons
                name="photo-library"
                size={24}
                color="white"
                style={{marginRight: 10}}
              />
              <Text style={{color: 'white', fontSize: 16}}>Galería</Text>
            </TouchableOpacity>

            {/* Archivos */}
          

            {/* Cancelar */}
            <TouchableOpacity
              onPress={() => setShowAttachmentModal(false)}
              style={{marginTop: 10}}>
              <Text style={{color: 'red', textAlign: 'right'}}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
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
