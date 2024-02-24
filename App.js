// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Camera } from 'expo-camera';
// import * as tf from '@tensorflow/tfjs';
// import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
// import * as FileSystem from 'expo-file-system';

// // const modelJSON = require('./model.json');

// const RESULT_MAPPING = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
//   "W", "X", "Y", "Z"];

// export default function App() {
//   const [hasPermission, setHasPermission] = useState(null);
//   const [cameraRef, setCameraRef] = useState(null);
//   const [model, setModel] = useState(null);
//   const [translation, setTranslation] = useState('');
//   const [allTranslations, setAllTranslations] = useState('');

//   useEffect(() => {
//     // Request camera permission
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       setHasPermission(status === 'granted');
//     })();

//     // Load the model
//     const loadModel = async () => {
//       await tf.ready();
//       try {
//         const model = await tf.loadLayersModel('https://teachablemachine.withgoogle.com/models/rhC6ywXBN/model.json');
//         setModel(model);
//         console.log("MODEL LOADED")
//       } catch (error) {
//         console.log('Error loading model:', error);
//       }
//     };
//     loadModel();
//   }, []);

//   const handleCameraCapture = async () => {
//     try {
//       if (cameraRef) {
//         setTranslation('')
//         console.log(tf.memory())
//         console.log("Image Captured")
//         const photo = await cameraRef.takePictureAsync({ base64: true });
//         console.log("Photo Saved")
//         const imageTensor = await transformImageToTensor(photo.base64);
//         console.log("Photo converted to tensor")
//         const predictions = await makePredictions(model, imageTensor);
//         const highestPrediction = predictions.indexOf(
//           Math.max.apply(null, predictions),
//         );
//         // console.log(highestPrediction);
//         // console.log(predictions[highestPrediction]);
//         setTranslation(RESULT_MAPPING[highestPrediction]);
//         setAllTranslations(prevTranslations => prevTranslations + ' ' + RESULT_MAPPING[highestPrediction]);
//         imageTensor.dispose();
//         // console.log(translation);
//         // console.log('Predictions:', predictions);
//         console.log(tf.memory())
//       }
//     } catch (error) {
//       console.log(error)
//     }
//   };

//   const transformImageToTensor = async (base64) => {
//     const imgBuffer = tf.util.encodeString(base64, 'base64').buffer;
//     console.log("Image converted to buffer");
//     const raw = new Uint8Array(imgBuffer);// this is taking time
//     console.log("Image converted to raw form");
//     // Resize the image to match the expected input shape of the model
//     imgTensor = tf.image.resizeBilinear(decodeJpeg(raw), [224, 224]);
//     console.log("Image tensor created");
//     // Reshape the tensor to match the expected input shape of the model
//     const img = tf.reshape(imgTensor.div(tf.scalar(255)), [1, 224, 224, 3]);
//     console.log("Image reshaped");

//     imgTensor.dispose();

//     return img;
//   };


//   // const makePredictions = async (batch, model, imagesTensor) => {
//   //   const predictionsData = model.predict(imagesTensor);
//   //   let predictions = predictionsData.split(batch);
//   //   return predictions;
//   // };

//   const makePredictions = async (model, imagesTensor) => {
//     try {
//       const predictionsData = await model.predict(imagesTensor);
//       return predictionsData.dataSync();
//     } catch (error) {
//       console.log(error)
//     }
//   };
//   const handleClearTranslations = () => {
//     // Clear the combined translations
//     setAllTranslations('');
//   };

//   if (hasPermission === null) {
//     return <View />;
//   }
//   if (hasPermission === false) {
//     return <Text>No access to camera</Text>;
//   }

//   return (
//     <View style={styles.container}>
//       {model ? <Camera
//         ref={(ref) => setCameraRef(ref)}
//         style={styles.camera}
//         type={Camera.Constants.Type.back}
//       >
//       </Camera> : <ActivityIndicator size="large" colors="#312651" />
//       }

//       <TouchableOpacity style={styles.buttonContainer} onPress={handleCameraCapture}>
//         <Text style={styles.text}>
//           Translate
//         </Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.clearButtonContainer} onPress={handleClearTranslations}>
//         <Text style={styles.text}>
//           Clear
//         </Text>
//       </TouchableOpacity>

//       {/* {translation === '' && allTranslations !== '' ? <ActivityIndicator size="large" colors="#312651" /> : } */}

//       <Text style={styles.translationText}>{translation}</Text>
//       <Text style={styles.allTranslationsText}>{allTranslations}</Text>

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//   },
//   camera: {
//     flex: 1,
//   },
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 80,
//     left: 20,
//     backgroundColor: 'transparent',
//     flexDirection: 'row',
//     margin: 25,
//   },
//   clearButtonContainer: {
//     position: 'absolute',
//     bottom: 80,
//     right: 20,
//     backgroundColor: 'transparent',
//     flexDirection: 'row',
//     margin: 25,
//   },
//   text: {
//     color: 'white',
//     fontSize: 18,
//     textAlign: 'center',
//   },
//   translationText: {
//     color: 'black',
//     fontSize: 24,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   allTranslationsText: {
//     color: 'black',
//     fontSize: 18,
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });






import { Camera } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs'
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
// import * as mobilenet from '@tensorflow-models/mobilenet';

import { View, Text } from 'react-native';
import { setdiff1dAsync } from '@tensorflow/tfjs';
import { useWindowDimensions } from 'react-native';

const TensorCamera = cameraWithTensors(Camera);

const RESULT_MAPPING = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
  "W", "X", "Y", "Z"];

export default function App(props) {
  const [tfReady, setTfReady] = useState(false)
  const [model, setModel] = useState(false)
  const [displayText, setDisplayText] = useState("loading models")
  const [cameraType, setCameraType] = useState("back")
  const windowWidth = useWindowDimensions().width;
  const windowHeight = useWindowDimensions().height;

  useEffect(() => {
    let checkTf = async () => {
      console.log("loading models")
      await tf.ready()
      console.log("tf ready loading, model")
      // const model = await mobilenet.load()
      const model = await tf.loadLayersModel('https://teachablemachine.withgoogle.com/models/rhC6ywXBN/model.json');
      console.log("model loaded")
      setModel(model)
      setDisplayText("Translating...")
      setTfReady(true)
    }
    checkTf()
  }, [])

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const changeCameraView = () => {
    if (cameraType === 'back') {
      setType(Camera.Constants.Type.front)
      setCameraType("front")
    } else {
      setType(Camera.Constants.Type.back)
      setCameraType("back")
    }
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  let AUTORENDER = true
  async function handleCameraStream(images, updatePreview, gl) {
    const loop = async () => {
      if (!AUTORENDER) {
        updatePreview();
      }
      const imageTensor = images.next().value;
      const resizedImgTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
      try {
        const img = tf.reshape(resizedImgTensor.div(tf.scalar(255)), [1, 224, 224, 3]);
        const predictionsData = await model.predict(img);
        const predictions = predictionsData.dataSync();
        const highestPrediction = predictions.indexOf(
          Math.max.apply(null, predictions),
        );
        // console.log(predictions)
        // console.log(highestPrediction);
        // console.log(predictions[highestPrediction]);
        // console.log(RESULT_MAPPING[highestPrediction])
        predictions[highestPrediction] > 0.90 ? setDisplayText(RESULT_MAPPING[highestPrediction]) : setDisplayText("");
        ;
        // setAllTranslations(prevTranslations => prevTranslations + ' ' + RESULT_MAPPING[highestPrediction]);
        // console.log(translation);
        // console.log('Predictions:', predictions);
        tf.dispose([img]);
      } catch (error) {
        console.log(error);
      }

      tf.dispose([imageTensor, resizedImgTensor]);

      if (!AUTORENDER) {
        gl.endFrameEXP();
      }
      requestAnimationFrame(loop);
    };

    loop();
  }

  let textureDims;
  if (Platform.OS === 'ios') {
    textureDims = {
      height: 1920,
      width: 1080,
    };
  } else {
    textureDims = {
      height: 1200,
      width: 1600,
    };
  }

  return (
    <View style={styles.container}>
      <Text style={{ height: windowHeight * 0.1 }}>{displayText}</Text>

      {tfReady ? (<TensorCamera
        // Standard Camera props
        style={{
          zIndex: -10,
          width: windowWidth * 0.7,
          height: windowHeight * 0.7,
        }}
        type={type}
        // Tensor related props
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={224}
        resizeWidth={224}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={AUTORENDER}
      />) : <View />}
      <TouchableOpacity style={styles.cameraBtn} onPress={changeCameraView}><Text>Camera</Text></TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#eaeaea",
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

  },
  cameraBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red'
  }


})