const firebaseConfig = {
  apiKey: "AIzaSyBlcioHwHMz9oEPxv9mIML50nbVB3UvF6Q",
  authDomain: "friendsglorbochat.firebaseapp.com",
  projectId: "friendsglorbochat",
  storageBucket: "friendsglorbochat.firebasestorage.app",
  messagingSenderId: "680082912935",
  appId: "1:680082912935:web:85cad17a429bcc11848d82",
  measurementId: "G-5NXCSYDKFZ"
};

firebase.initializeApp(
    firebaseConfig
);

const db =
    firebase.firestore();

console.log(
    'Firebase connected'
);