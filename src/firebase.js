import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANa0clizq4b5ZdWi68pNlAt7_KHtZwePs",
  authDomain: "mastimovies-dae90.firebaseapp.com",
  projectId: "mastimovies-dae90",
  storageBucket: "mastimovies-dae90.appspot.com",
  messagingSenderId: "1004326736163",
  appId: "1:1004326736163:web:1267948f18384c86ae3c96",
  measurementId: "G-RH1MSK7K5L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set auth persistence
setPersistence(auth, browserSessionPersistence)
  .catch((error) => console.error("Auth persistence error:", error));

export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      name,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    return userCredential;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: new Date().toISOString()
    });

    return userCredential;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export { auth, db, onAuthStateChanged };