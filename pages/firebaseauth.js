import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCsf_gbE_xyqRoilwzgdDtEdGIpEDydntU",
  authDomain: "freelynk-2758c.firebaseapp.com",
  projectId: "freelynk-2758c",
  storageBucket: "freelynk-2758c.appspot.com",
  messagingSenderId: "995824578892",
  appId: "1:995824578892:web:b5dc2dda5e160592681fe9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

const adminEmails = ["vhulendamashamba4@gmail.com","2333776@students.wits.ac.za","nsovo.ike03@gmail.com"];

// Sign-In Function
async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (adminEmails.includes(user.email)) {
      showAdminChoicePopup(user);
    } else {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        showPopup("Welcome back!", "success");
        setTimeout(() => (window.location.href = "Freelancing.html"), 1500);
      } else {
        showRoleSelectionPopup(user);
      }
    }
  } catch (error) {
    console.error(error);
    showPopup("Google Sign-In failed", "error");
  }
}

// Admin Dashboard or Website Popup
function showAdminChoicePopup(user) {
  const overlay = document.createElement("section");
  overlay.id = "adminOverlay";

  const popup = document.createElement("div");
  popup.className = "popup-container";

  const heading = document.createElement("h2");
  heading.textContent = "Continue to:";
  heading.className = "popup-heading";

  const dashboardBtn = document.createElement("button");
  dashboardBtn.textContent = "Dashboard";
  dashboardBtn.className = "popup-btn";
  dashboardBtn.onclick = () => {
    overlay.remove();
    showPopup("Redirecting to Admin Dashboard...", "success");
    setTimeout(() => (window.location.href = "admin.html"), 1500);
  };

  const websiteBtn = document.createElement("button");
  websiteBtn.textContent = "Website";
  websiteBtn.className = "popup-btn";
  websiteBtn.onclick = () => {
    overlay.remove();
    showPopup("Redirecting to Website...", "success");
    setTimeout(() => (window.location.href = "Freelancing.html"), 1500);
  };

  popup.appendChild(heading);
  popup.appendChild(dashboardBtn);
  popup.appendChild(websiteBtn);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

// Role selection popup for new users
function showRoleSelectionPopup(user) {
  const overlay = document.createElement("section");
  overlay.id = "roleOverlay";

  const popup = document.createElement("div");
  popup.className = "popup-container";

  const heading = document.createElement("h2");
  heading.textContent = "Sign in as:";
  heading.className = "popup-heading";

  const clientBtn = document.createElement("button");
  clientBtn.textContent = "Client";
  clientBtn.className = "popup-btn";
  clientBtn.onclick = () => saveUserRole(user, "client");

  const freelancerBtn = document.createElement("button");
  freelancerBtn.textContent = "Freelancer";
  freelancerBtn.className = "popup-btn";
  freelancerBtn.onclick = () => saveUserRole(user, "freelancer");

  popup.appendChild(heading);
  popup.appendChild(clientBtn);
  popup.appendChild(freelancerBtn);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

// Save user info to Firestore
async function saveUserRole(user, role) {
  try {
    await setDoc(doc(db, "users", user.uid), {
      fullName: user.displayName,
      email: user.email,
      role,
      createdAt: serverTimestamp()
    });

    document.getElementById("roleOverlay")?.remove();
    showPopup("Signed in as " + role + "!", "success");

    setTimeout(() => {
      window.location.href = "Freelancing.html";
    }, 1500);
  } catch (error) {
    console.error(error);
    showPopup("Failed to save role", "error");
  }
}

// Simple popup message
function showPopup(message, type = "success") {
  let popup = document.getElementById("popupMessageBox");
  if (!popup) {
    popup = document.createElement("section");
    popup.id = "popupMessageBox";
    document.body.appendChild(popup);
  }

  popup.className = type === "success" ? "success" : "error";
  popup.textContent = message;
  popup.style.display = "block";
  popup.style.opacity = "1";

  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => (popup.style.display = "none"), 300);
  }, 4000);
}

// Bind button event
document.getElementById("googleSignInBtn")?.addEventListener("click", handleGoogleSignIn);
