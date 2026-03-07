import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBEBhZjPSopndZGsVOQmMJkJuonuc9RtqI",
    authDomain: "warthi-ce145.firebaseapp.com",
    projectId: "warthi-ce145",
    appId: "1:328148162342:web:f05c39310fe07e691213e7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
