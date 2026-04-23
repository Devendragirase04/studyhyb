import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function checkURLs() {
  const q = collection(db, 'pdfs');
  const snap = await getDocs(q);
  snap.forEach(doc => {
    console.log(doc.id, doc.data().url);
  });
}
checkURLs();
