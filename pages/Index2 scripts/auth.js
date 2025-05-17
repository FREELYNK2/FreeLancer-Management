import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsf_gbE_xyqRoilwzgdDtEdGIpEDydntU",
  authDomain: "freelynk-2758c.firebaseapp.com",
  projectId: "freelynk-2758c",
  storageBucket: "freelynk-2758c.appspot.com",
  messagingSenderId: "995824578892",
  appId: "1:995824578892:web:b5dc2dda5e160592681fe9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize auth state listener
const initAuthStateListener = (callback) => {
  onAuthStateChanged(auth, (user) => {
    if (callback) callback(user);
  });
};

// Get current authenticated user
const getCurrentUser = () => {
  return auth.currentUser;
};

// Login function
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

// Logout function
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export {
  initAuthStateListener,
  getCurrentUser,
  login,
  logout,
  auth, // Export auth instance if needed elsewhere
};
