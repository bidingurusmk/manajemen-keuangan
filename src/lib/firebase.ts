import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Credentials loaded directly from the system-generated configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGjcY4rguAosWgqyvo2nxzi4p9X2UV8os",
  authDomain: "gen-lang-client-0624521390.firebaseapp.com",
  projectId: "gen-lang-client-0624521390",
  storageBucket: "gen-lang-client-0624521390.firebasestorage.app",
  messagingSenderId: "724453703234",
  appId: "1:724453703234:web:2e52a2c1d451a5f238f7db"
};

const app = initializeApp(firebaseConfig);

// Use the specific firestore database ID provisioned for this applet
export const db = initializeFirestore(app, {}, "ai-studio-manajemenkeuanga-589f578d-2910-4636-a63d-4ab36c823de1");

// Validate connection to Firestore as required by firebase-integration skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Koneksi Firebase Firestore berhasil divalidasi.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase offline. Silakan periksa konfigurasi internet Anda.");
    } else {
      console.warn("Firebase test connection result (benign):", error);
    }
  }
}

testConnection();
