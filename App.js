import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';

// const modelJSON = require('./model.json');

const RESULT_MAPPING = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
  "W", "X", "Y", "Z"];

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [model, setModel] = useState(null);
  const [translation, setTranslation] = useState('');
  const [allTranslations, setAllTranslations] = useState('');

  useEffect(() => {
    // Request camera permission
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Load the model
    const loadModel = async () => {
      await tf.ready();
      try {
        const model = await tf.loadLayersModel('https://teachablemachine.withgoogle.com/models/3xj-Z7pQR/model.json');
        setModel(model);
        console.log("MODEL LOADED")
      } catch (error) {
        console.log('Error loading model:', error);
      }
    };
    loadModel();
  }, []);

  const handleCameraCapture = async () => {
    try {
      if (cameraRef) {
        setTranslation('')
        console.log("Image Captured")
        const photo = await cameraRef.takePictureAsync({ base64: true });
        console.log("Photo Saved")
        const imageTensor = await transformImageToTensor(photo.base64);
        console.log("Photo converted to tensor")
        const predictions = await makePredictions(model, imageTensor);
        const highestPrediction = predictions.indexOf(
          Math.max.apply(null, predictions),
        );
        // console.log(highestPrediction);
        // console.log(predictions[highestPrediction]);
        setTranslation(RESULT_MAPPING[highestPrediction]);
        setAllTranslations(prevTranslations => prevTranslations + ' ' + RESULT_MAPPING[highestPrediction]);
        imageTensor.dispose();
        // console.log(translation);
        // console.log('Predictions:', predictions);
      }
    } catch (error) {
      console.log(error)
    }
  };

  const transformImageToTensor = async (base64) => {
    const imgBuffer = tf.util.encodeString(base64, 'base64').buffer;
    console.log("Image converted to buffer");
    const raw = new Uint8Array(imgBuffer);// this is taking time
    console.log("Image converted to raw form");
    let imgTensor = decodeJpeg(raw);
    console.log("JPEG decoded");
    const scalar = tf.scalar(255);
    console.log("Scalar created");

    // Resize the image to match the expected input shape of the model
    imgTensor = tf.image.resizeBilinear(imgTensor, [224, 224]);
    console.log("Image tensor created");

    // Normalize the pixel values
    const tensorScaled = imgTensor.div(scalar);
    console.log("Image tensor scaled");

    // Reshape the tensor to match the expected input shape of the model
    const img = tf.reshape(tensorScaled, [1, 224, 224, 3]);
    console.log("Image reshaped");
    return img;
  };


  // const makePredictions = async (batch, model, imagesTensor) => {
  //   const predictionsData = model.predict(imagesTensor);
  //   let predictions = predictionsData.split(batch);
  //   return predictions;
  // };

  const makePredictions = async (model, imagesTensor) => {
    try {
      const predictionsData = await model.predict(imagesTensor);
      return predictionsData.dataSync();
    } catch (error) {
      console.log(error)
    }
  };
  const handleClearTranslations = () => {
    // Clear the combined translations
    setAllTranslations('');
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {model ? <Camera
        ref={(ref) => setCameraRef(ref)}
        style={styles.camera}
        type={Camera.Constants.Type.back}
      >
      </Camera> : <ActivityIndicator size="large" colors="#312651" />
      }

      <TouchableOpacity style={styles.buttonContainer} onPress={handleCameraCapture}>
        <Text style={styles.text}>
          Translate
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearButtonContainer} onPress={handleClearTranslations}>
        <Text style={styles.text}>
          Clear
        </Text>
      </TouchableOpacity>

      {/* {translation === '' && allTranslations !== '' ? <ActivityIndicator size="large" colors="#312651" /> : } */}

      <Text style={styles.translationText}>{translation}</Text>
      <Text style={styles.allTranslationsText}>{allTranslations}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 25,
  },
  clearButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 25,
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  translationText: {
    color: 'black',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
  },
  allTranslationsText: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});