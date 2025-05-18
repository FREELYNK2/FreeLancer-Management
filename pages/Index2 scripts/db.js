import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// import { sendApplicationEmail } from "./notifications.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsf_gbE_xyqRoilwzgdDtEdGIpEDydntU",
  authDomain: "freelynk-2758c.firebaseapp.com",
  projectId: "freelynk-2758c",
  storageBucket: "freelynk-2758c.appspot.com",
  messagingSenderId: "995824578892",
  appId: "1:995824578892:web:b5dc2dda5e160592681fe9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Collections
const freelancersCol = collection(db, "freelancers");
const jobsCol = collection(db, "jobs");
const applicationsCol = collection(db, "applications");

// Freelancer Operations
const saveFreelancerProfile = async (formData, photoFile) => {
  let photoURL = "";

  if (photoFile) {
    const fileRef = ref(
      storage,
      `profile_photos/${Date.now()}_${photoFile.name}`
    );
    await uploadBytes(fileRef, photoFile);
    photoURL = await getDownloadURL(fileRef);
  }

  const profileData = {
    name: formData.name,
    title: formData.title,
    skills: formData.skills.split(",").map((skill) => skill.trim()),
    rate: `R${formData.rate}/hr`,
    bio: formData.bio,
    location: formData.location,
    experience: `${formData.experience} years`,
    photo: photoURL,
    email: auth.currentUser.email,
    userId: auth.currentUser?.uid,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(freelancersCol, profileData);
  return { id: docRef.id, ...profileData };
};

const loadFreelancers = async () => {
  const snapshot = await getDocs(freelancersCol);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Job Operations
const postNewJob = async (formData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const jobData = {
    title: formData.title,
    description: formData.description,
    skills: formData.skills.split(",").map((skill) => skill.trim()),
    budget: `ZAR ${formData.budget}`,
    duration: `${formData.duration} days`,
    userId: user.uid, // <- THIS IS CRUCIAL
    userEmail: user.email,
    postedAt: new Date().toLocaleDateString(),
    createdAt: new Date().toISOString(),
    status: "open",
  };

  const docRef = await addDoc(jobsCol, jobData);
  return { id: docRef.id, ...jobData };
};

const loadJobs = async () => {
  const snapshot = await getDocs(jobsCol);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Application Operations
const submitApplication = async (jobId) => {
  const user = auth.currentUser;
  const jobRef = doc(db, "jobs", jobId);
  const jobSnap = await getDoc(jobRef);

  if (!jobSnap.exists()) throw new Error("Job doesn't exist");
  if (jobSnap.data().status !== "open") throw new Error("Job closed");
  if (!jobSnap.data().userId) throw new Error("Job owner not found");

  const appData = {
    freelancerId: user.uid,
    freelancerEmail: user.email,
    jobId,
    jobTitle: jobSnap.data().title,
    clientId: jobSnap.data().userId, // Now guaranteed to exist
    status: "pending",
    appliedAt: new Date().toISOString(),
  };

  const appRef = await addDoc(applicationsCol, appData);
  return appRef;
};

// Add new milestone
const addMilestone = async (jobId, milestoneData) => {
  await addDoc(collection(db, "jobs", jobId, "milestones"), milestoneData);
};

// Fetch milestones
const loadMilestones = async (jobId, modalElement) => {
  const query = await getDocs(collection(db, "jobs", jobId, "milestones"));
  const list = modalElement.querySelector("#milestonesList");
  list.innerHTML = query.docs
    .map(
      (doc) => `
    <li>
      <strong>${doc.data().name}</strong>
      <p>Due: ${doc.data().dueDate}</p>
      <p>Amount: ZAR ${doc.data().amount}</p>
      <p>Status: ${doc.data().status}</p>
    </li>
  `
    )
    .join("");
};

// Single export at the end (no duplicate exports)
export {
  saveFreelancerProfile,
  loadFreelancers,
  postNewJob,
  loadJobs,
  submitApplication,
  db,
};
