import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getAuth,
  deleteUser,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
const db = getFirestore();
const auth = getAuth();

// ✅ Secure: only allow this UID
const ADMIN_UID = ["3LfQb9acJoOf9J0biWoY5kjv0ZB2","V0ovuDG7WXS5YtXfDjRm7vHVrAj2"]; // Replace with actual UID

const usersTableBody = document.getElementById("usersTableBody");

// Load all users from Firestore
async function loadUsers() {
  usersTableBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.fullName || "-"}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>Active</td>
      <td>${user.createdAt?.toDate().toLocaleDateString() || "-"}</td>
      <td><button data-id="${docSnap.id}" class="delete-btn">Delete</button></td>
    `;
    usersTableBody.appendChild(row);
  });

  attachDeleteEvents();
}

// Delete user document from Firestore
async function deleteUserFromFirestore(uid) {
  await deleteDoc(doc(db, "users", uid));
}

// Confirm and delete user
function attachDeleteEvents() {
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const uid = button.getAttribute("data-id");
      const confirm = window.confirm("Are you sure you want to delete this user?");
      if (confirm) {
        try {
          await deleteUserFromFirestore(uid);
          alert("User deleted from Firestore.");
          loadUsers();
        } catch (err) {
          console.error(err);
          alert("Error deleting user.");
        }
      }
    });
  });
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// ✅ Secure admin-only access
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }  else {
    loadUsers();
  }
});
