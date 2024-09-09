import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const StartFireBase = () => {
  const dada = {
    apiKey: "AIzaSyA2mTxwMKCvXAsxaHDawDhlf-_4oFBPdZs",
    authDomain: "fisica-calor-especifico-2024.firebaseapp.com",
    databaseURL: "https://fisica-calor-especifico-2024-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fisica-calor-especifico-2024",
    storageBucket: "fisica-calor-especifico-2024.appspot.com",
    messagingSenderId: "363932050024",
    appId: "1:363932050024:web:2fa08675d0508b0f4d91dd"
  };

  const firebaseApp = initializeApp(dada);

  return getDatabase(firebaseApp);
};

// export const StartFireBase = () => {
//   const firebaseApp = initializeApp({
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     projectId: process.env.PROJECT_ID,
//   });

//   return getDatabase(firebaseApp)
// };
