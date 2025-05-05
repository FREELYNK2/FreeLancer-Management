// Firebase configuration file
// Create this as firebase-config.js in your project directory

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCsf_gbE_xyqRoilwzgdDtEdGIpEDydntU",
    authDomain: "freelynk-2758c.firebaseapp.com",
    projectId: "freelynk-2758c",
    storageBucket: "freelynk-2758c.appspot.com",
    messagingSenderId: "995824578892",
    appId: "1:995824578892:web:b5dc2dda5e160592681fe9"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firestore
  const db = firebase.firestore();
  
  // Initialize Firebase Storage
  const storage = firebase.storage();
  
  // Export the database and storage for use in other files
  export { db, storage };