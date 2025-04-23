// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCsf_gbE_xyqRoilwzgdDtEdGIpEDydntU",
  authDomain: "freelynk-2758c.firebaseapp.com",
  projectId: "freelynk-2758c",
  storageBucket: "freelynk-2758c.firebasestorage.app",
  messagingSenderId: "995824578892",
  appId: "1:995824578892:web:b5dc2dda5e160592681fe9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// 🔔 Popup function
function showPopup(message, type = "success") {
  if (!message || typeof message !== "string") {
    console.warn("No message provided to showPopup");
    return;
  }

  let popup = document.getElementById("popupMessageBox");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "popupMessageBox";
    popup.style.position = "fixed";
    popup.style.top = "20px";
    popup.style.right = "20px";
    popup.style.zIndex = "9999";
    popup.style.padding = "16px 24px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    popup.style.fontFamily = "Montserrat, sans-serif";
    popup.style.fontSize = "16px";
    popup.style.transition = "opacity 0.3s ease";
    popup.style.color = "#fff";
    popup.style.maxWidth = "300px";
    popup.style.display = "none";
    popup.style.wordBreak = "break-word";
    document.body.appendChild(popup);
  }

  popup.innerText = message;
  popup.style.backgroundColor = type === "success" ? "#28a745" : "#dc3545";
  popup.style.opacity = 1;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.opacity = 0;
    setTimeout(() => (popup.style.display = "none"), 300);
  }, 4000);
}

// ✅ Email format validation
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// 📝 Handle Sign Up
function handleSignUp(role) {
  const fullName = document.getElementById("fName")?.value.trim();
  const email = document.getElementById("rEmail")?.value.trim();
  const password = document.getElementById("rPassword")?.value;

  if (!fullName || !email || !password) {
    showPopup("Please fill in all fields", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showPopup("Please enter a valid email address", "error");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const userData = {
        fullName,
        email,
        role
      };

      await setDoc(doc(db, "users", user.uid), userData);

      showPopup("Account Created Successfully!", "success");

      setTimeout(() => {
        window.location.href = "Login.html";
      }, 1500);
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        showPopup("Email already in use", "error");
      } else if (errorCode === "auth/weak-password") {
        showPopup("Password should be at least 6 characters", "error");
      } else {
        console.error(error);
        showPopup("An error occurred while creating account", "error");
      }
    });
}

// 🔐 Handle Sign In
async function handleSignIn() {
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    showPopup("Please enter both email and password", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showPopup("Invalid email format", "error");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      showPopup("Login successful!", "success");
      setTimeout(() => {
        window.location.href = "Freelancing.html";
      }, 1500);
    } else {
      showPopup("No account found. Redirecting to register...", "error");
      setTimeout(() => {
        window.location.href = "register.html";
      }, 2500);
    }
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      showPopup("No account found with this email", "error");
    } else if (error.code === "auth/wrong-password") {
      showPopup("Incorrect password", "error");
    } else {
      console.error(error);
      showPopup("Email Or Password Is Incorrect", "error");
    }
  }
}

// ✅ Button Listeners
document.getElementById("hireTalentBtn")?.addEventListener("click", () => handleSignUp("hirer"));
document.getElementById("findWorkBtn")?.addEventListener("click", () => handleSignUp("freelancer"));
document.getElementById("loginBtn")?.addEventListener("click", handleSignIn);
