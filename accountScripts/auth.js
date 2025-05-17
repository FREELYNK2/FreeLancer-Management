// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCsf_gbE_xyqRoilwzgdDtEdGIpEDydntU",
  authDomain: "freelynk-2758c.firebaseapp.com",
  projectId: "freelynk-2758c",
  storageBucket: "freelynk-2758c.appspot.com",
  messagingSenderId: "995824578892",
  appId: "1:995824578892:web:b5dc2dda5e160592681fe9",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage };

// Auth state listener
export function setupAuthListener(callback) {
  auth.onAuthStateChanged(callback);
}

// Logout function
export function setupLogout(buttonId, redirectUrl = "index.html") {
  document.getElementById(buttonId)?.addEventListener("click", () => {
    auth.signOut().then(() => (window.location.href = redirectUrl));
  });
}
