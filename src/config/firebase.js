// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJf4tT2hM4Z1MmfpcGD_q47KM0PEi33i8",
  authDomain: "chat-app-gs-d90d8.firebaseapp.com",
  projectId: "chat-app-gs-d90d8",
  storageBucket: "chat-app-gs-d90d8.appspot.com",
  messagingSenderId: "1065093110491",
  appId: "1:1065093110491:web:732089dd9a249068440afe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const signup = async (username, email, password) => {
  try {

    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, I am using ChatApp",
      lastSeen: Date.now()
    })

    await setDoc(doc(db, "chats", user.uid), {
      chatData: []
    })
  }
  catch (error) {
    console.error(error);

    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  }
  catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const logout = async () => {
  try {
    await signOut(auth);
  }
  catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return null;
  }
  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email sent")
    }
    else {
      toast.error("Email doesnt exist")
    }

  } catch (error) {
    console.error(error);
    toast.error(error.message)
  }
}

export { signup, login, logout, auth, db, resetPass }