import AppIcon from '@/app/common/components/ui/AppIcon';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';


export interface UploadedImage {
  id: string;
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number;
  height?: number;
}

interface ImageUploadProps {
  photos: UploadedImage[];
  onChange: (photos: UploadedImage[]) => void;
  maxPhotos?: number;
  imageSize?: number;
}


const ImageUpload: React.FC<ImageUploadProps> = ({
  photos,
  onChange,
  maxPhotos = 5,
  imageSize = 108,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
  const previewListRef = useRef<FlatList<UploadedImage>>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);


  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [cameraFacing, setCameraFacing] =
    useState<"front" | "back">("back");

  const cameraRef = useRef<CameraView>(null);

  const canAddMore = photos.length < maxPhotos;

  const handleImagePreview = (index: number) => {
  setSelectedImageIndex(index);
  setIsPreviewOpen(true);
};


  // ------------------------------------
  // Generate Unique ID
  // ------------------------------------

  const generateId = () => {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  };


  // ------------------------------------
  // Open Camera
  // ------------------------------------

  const handleTakePhoto = async () => {

    if (!canAddMore) {
      Alert.alert(
        "Maximum Photos",
        `You can upload up to ${maxPhotos} photos.`
      );

      return;
    }

    if (!cameraPermission?.granted) {

      const permission =
        await requestCameraPermission();

      if (!permission.granted) {

        Alert.alert(
          "Camera Permission",
          "Please allow camera access from your device settings."
        );

        return;
      }
    }

    setIsCameraOpen(true);
  };


  // ------------------------------------
  // Capture Photo
  // ------------------------------------

  const handleCapturePhoto = async () => {

    if (!cameraRef.current) return;

    try {

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });

      if (!photo?.uri) return;

      const newPhoto: UploadedImage = {
        id: generateId(),
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        fileName: null,
        mimeType: "image/jpeg",
      };

      onChange([...photos, newPhoto]);

      setIsCameraOpen(false);

    } catch (error) {

      console.error(
        "Camera capture error:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to capture photo."
      );
    }
  };


  // ------------------------------------
  // Open Gallery
  // ------------------------------------

  const handleChooseGallery = async () => {

    if (!canAddMore) {
      Alert.alert(
        "Maximum Photos",
        `You can upload up to ${maxPhotos} photos.`
      );

      return;
    }

    try {

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {

        Alert.alert(
          "Gallery Permission",
          "Please allow gallery access from your device settings."
        );

        return;
      }

      const remainingPhotos =
        maxPhotos - photos.length;

      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ["images"],

          allowsMultipleSelection: true,

          selectionLimit: remainingPhotos,

          quality: 0.8,

          orderedSelection: true,

        });

      if (result.canceled) return;

      const selectedPhotos: UploadedImage[] =
        result.assets.map((asset) => ({

          id: generateId(),

          uri: asset.uri,

          fileName: asset.fileName,

          mimeType: asset.mimeType,

          width: asset.width,

          height: asset.height,

        }));

      onChange([
        ...photos,
        ...selectedPhotos.slice(0, remainingPhotos),
      ]);

    } catch (error) {

      console.error(
        "Gallery selection error:",
        error
      );

      Alert.alert(
        "Gallery Error",
        "Unable to select images."
      );
    }
  };


  // ------------------------------------
  // Remove Photo
  // ------------------------------------

  const handleRemovePhoto = (id: string) => {

    const updatedPhotos =
      photos.filter((photo) => photo.id !== id);

    onChange(updatedPhotos);
  };


  // ------------------------------------
  // Add More
  // ------------------------------------

  const handleAddMore = () => {

    Alert.alert(
      "Add Photos",
      "Choose how you want to add photos.",
      [
        {
          text: "Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "Gallery",
          onPress: handleChooseGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };


  // ------------------------------------
  // Camera Modal
  // ------------------------------------


const renderCameraModal = () => {
  return (
    <Modal
      visible={isCameraOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsCameraOpen(false)}
    >
      <View className="flex-1 bg-black">

        {/* Camera Preview - NO CHILDREN */}

        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={cameraFacing}
        />

        {/* Header Overlay */}

        <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-5 pt-14">

          <Pressable
            onPress={() => setIsCameraOpen(false)}
            className="h-11 w-11 items-center justify-center rounded-full bg-black/40"
          >
            <AppIcon
              family="Feather"
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>

          <Text className="text-base font-semibold text-white">
            Take Photo
          </Text>

          <Pressable
            onPress={() => {
              setCameraFacing((current) =>
                current === "back" ? "front" : "back"
              );
            }}
            className="h-11 w-11 items-center justify-center rounded-full bg-black/40"
          >
            <AppIcon
              family="Feather"
              name="rotate-ccw"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>

        </View>

        {/* Bottom Capture Overlay */}

        <View className="absolute bottom-0 left-0 right-0 items-center pb-12">

          <Pressable
            onPress={handleCapturePhoto}
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20"
          >
            <View className="h-14 w-14 rounded-full bg-white" />
          </Pressable>

          <Text className="mt-4 text-sm text-white">
            Tap to capture
          </Text>

        </View>

      </View>
    </Modal>
  );
};


const renderImagePreviewModal = () => {
  return (
    <Modal
      visible={isPreviewOpen}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsPreviewOpen(false)}
    >
      <View className="flex-1 bg-black">

        {/* Header */}
        <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-between px-5 pt-14">

          {/* Close */}
          <Pressable
            onPress={() => setIsPreviewOpen(false)}
            className="h-11 w-11 items-center justify-center rounded-full bg-white/20"
          >
            <AppIcon
              family="Feather"
              name="x"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>

          {/* Counter */}
          <Text className="text-sm font-semibold text-white">
            {selectedImageIndex + 1} / {photos.length}
          </Text>

          <View className="h-11 w-11" />

        </View>

        {/* Image Preview */}
        <FlatList
          ref={previewListRef}
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={selectedImageIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );

            setSelectedImageIndex(index);
          }}
          renderItem={({ item }) => (
            <View
              className="items-center justify-center"
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
              }}
            >
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: SCREEN_WIDTH,
                  height: SCREEN_HEIGHT * 0.75,
                }}
                resizeMode="contain"
              />
            </View>
          )}
        />

        {/* Bottom Hint */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <Text className="text-xs text-white/70">
            Swipe left or right to view photos
          </Text>
        </View>

      </View>
    </Modal>
  );
};


  // ------------------------------------
  // UI
  // ------------------------------------

  return (
    <View className="w-full gap-2">

      {/* Upload Actions */}

      <View className="flex-row gap-3">

        {/* Take Photo */}

        <Pressable
          onPress={handleTakePhoto}
          className="p-4 flex-1 items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50 active:bg-blue-100"
        >

          <AppIcon family="Feather" name="camera" size={24} color="#2563EB" />

          <Text className="mt-2 text-sm font-semibold text-blue-600">
            Take Photo
          </Text>

        </Pressable>


        {/* Gallery */}

        <Pressable
          onPress={handleChooseGallery}
          className=" flex-1 items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50 active:bg-blue-100"
        >

          <AppIcon family="Feather" name="image" size={24} color="#2563EB" />

          <Text className="mt-2 text-sm font-semibold text-blue-600">
            Choose from Gallery
          </Text>

        </Pressable>

      </View>


      {/* Image Preview */}

      {photos.length > 0 && (

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 py-2"
        >

          {photos.map((photo,index) => (

            <View
             
              key={photo.id}
              style={{
                width: imageSize,
                height: imageSize,
              }}
              className="relative overflow-visible "
            >

              {/* Image */}
              <Pressable
                onPress={() => handleImagePreview(index)}
              >
                <Image
                  source={{ uri: photo.uri }}
                  className="h-full w-full rounded-2xl bg-gray-100"
                  resizeMode="cover"
                />
              </Pressable>


              {/* Remove Button */}

              <Pressable
                onPress={() => handleRemovePhoto(photo.id)}
                hitSlop={8}
                className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-800"
              >

                <AppIcon family="Feather" name="x" size={15} color="#FFFFFF" />

              </Pressable>

            </View>

          ))}


          {/* Add More */}

          {canAddMore && (

            <Pressable
              onPress={handleAddMore}
              style={{
                width: imageSize,
                height: imageSize,
              }}
              className="items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50 active:bg-blue-100"
            >

              <AppIcon family="Feather" name="plus" size={28} color="#2563EB" />

              <Text className="mt-1 text-xs font-semibold text-blue-600">
                Add More
              </Text>

              <Text className="mt-1 text-[10px] text-slate-500">
                {maxPhotos - photos.length} left
              </Text>

            </Pressable>

          )}

        </ScrollView>

      )}


      {/* Empty State */}

      {photos.length === 0 && (

        <Pressable
          onPress={handleAddMore}
          className="p-1 items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50 active:bg-blue-100"
        >
        
        <View className='flex-row items-center'>
            <AppIcon family="Feather" name="plus" size={16} color="#2563EB" />
            <Text className=" text-sm font-semibold text-blue-600">
                Add Photos
            </Text>
         </View>
          {/* <AppIcon family="Feather" name="plus" size={28} color="#2563EB" /> */}

        

          <Text className="mt-1 text-xs text-slate-500">
            Up to {maxPhotos} photos
          </Text>

        </Pressable>

      )}


      {/* Photo Counter */}

      <View className="flex-row items-center justify-between">

        <Text className="text-xs text-slate-500">
          {photos.length}/{maxPhotos} photos uploaded
        </Text>

        <Text className="text-xs text-slate-400">
          Optional
        </Text>

      </View>


      {/* Camera Modal */}

      {renderCameraModal()}

      {renderImagePreviewModal()}

    </View>
  );};
export default ImageUpload