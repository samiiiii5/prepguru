import { initializeApp } from '@react-native-firebase/app';
import { getDatabase } from '@react-native-firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtwnvt80sM4JLPWUKtVtl-dT22jB1sAWk",
  authDomain: "prep-6cd65.firebaseapp.com",
  projectId: "prep-6cd65",
  storageBucket: "prep-6cd65.appspot.com",
  messagingSenderId: "1007501551030",
  appId: "1:1007501551030:android:e16bbdbc44306b1d7d8d17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Database
const database = getDatabase(app);

export { app, database };
