import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './styles';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      const mediaLibraryPermission = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
      if (mediaLibraryPermission.status !== 'granted') {
        console.log('Permissão para acessar a galeria não foi concedida');
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (camera) {
      const photoData = await camera.takePictureAsync(null);
      setPhoto(photoData);
      saveToCameraRoll(photoData);
    }
  };

  const saveToCameraRoll = async (photoData) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(photoData.uri);
      await MediaLibrary.saveToLibraryAsync(asset);
      console.log('Imagem salva na galeria');
    } catch (error) {
      console.log('Erro ao salvar a imagem na galeria:', error);
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY <= 0) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Camera
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
          ref={(ref) => setCamera(ref)}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraType}>
            <Ionicons
              name={cameraType === Camera.Constants.Type.back ? 'camera-reverse' : 'camera'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <View style={styles.buttonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleFlashMode}>
            <Ionicons
              name={flashMode === Camera.Constants.FlashMode.off ? 'flash-off' : 'flash'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
        {photo && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          </View>
        )}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}
