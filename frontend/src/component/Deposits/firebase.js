import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBtLAFhDJENgmrhBKWimZH8s48Ag2BOlCQ",
  authDomain: "foilar-schedular.firebaseapp.com",
  projectId: "foilar-schedular",
  storageBucket: "foilar-schedular.firebasestorage.app",
  messagingSenderId: "434284017953",
  appId: "1:434284017953:android:34a010e79d694ba511e660"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };