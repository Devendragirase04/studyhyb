// admin.js — Admin Panel Logic for STUDYHUB
import { db, auth } from './firebase-config.js';
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ⚠️ SET YOUR CLOUDINARY DETAILS HERE
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';

const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('admin-dashboard');

// ---- AUTH ----
onAuthStateChanged(auth, user => {
  if (user) {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    document.getElementById('admin-user-info').textContent = user.email;
    loadManagePDFs();
  } else {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
});

document.getElementById('google-login-btn')?.addEventListener('click', async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert('Login failed: ' + e.message);
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));

// ---- SIDEBAR NAV ----
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    document.getElementById('panel-' + link.dataset.panel).classList.add('active');
    if (link.dataset.panel === 'manage') loadManagePDFs();
  });
});

// ---- TOGGLE PRICE FIELD ----
window.togglePriceField = function(val) {
  const pg = document.getElementById('price-group');
  if (pg) pg.style.display = val === 'paid' ? 'flex' : 'none';
};

// ---- FILE DROP ZONE ----
const dropZone = document.getElementById('file-drop-zone');
const fileInput = document.getElementById('pdf-file');

dropZone?.addEventListener('click', () => fileInput.click());
fileInput?.addEventListener('change', () => {
  if (fileInput.files[0]) showSelectedFile(fileInput.files[0].name);
});

dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone?.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files[0]?.type === 'application/pdf') {
    fileInput.files = files;
    showSelectedFile(files[0].name);
  } else {
    alert('Please drop a PDF file.');
  }
});

function showSelectedFile(name) {
  document.getElementById('fdz-content').innerHTML = `
    <span class="fdz-icon">✅</span>
    <p><strong>${name}</strong></p>
    <p class="fdz-note">Click to change file</p>
  `;
}

// ---- UPLOAD TO CLOUDINARY ----
async function uploadToCloudinary(file) {
  if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    // Return placeholder URL if Cloudinary not configured
    return 'https://example.com/sample.pdf';
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('resource_type', 'raw');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
}

// ---- UPLOAD FORM SUBMIT ----
document.getElementById('upload-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('upload-submit-btn');
  const progress = document.getElementById('upload-progress');
  const result = document.getElementById('upload-result');
  const fill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  btn.disabled = true;
  btn.textContent = 'Uploading...';
  result.style.display = 'none';
  progress.style.display = 'flex';

  try {
    let pdfUrl = document.getElementById('pdf-url').value.trim();
    const file = fileInput.files[0];

    // Step 1: Upload file if provided
    if (file) {
      progressText.textContent = 'Uploading PDF to Cloudinary...';
      fill.style.width = '30%';
      pdfUrl = await uploadToCloudinary(file);
      fill.style.width = '70%';
    }

    if (!pdfUrl) throw new Error('Please upload a PDF file or paste a PDF URL.');

    // Step 2: Save to Firestore
    progressText.textContent = 'Saving metadata...';
    fill.style.width = '90%';

    const type = document.getElementById('pdf-type').value;
    const priceVal = document.getElementById('pdf-price').value;

    await addDoc(collection(db, 'pdfs'), {
      title: document.getElementById('pdf-title').value.trim(),
      category: document.getElementById('pdf-category').value,
      description: document.getElementById('pdf-description').value.trim(),
      type,
      price: type === 'paid' ? Number(priceVal) : 0,
      emoji: document.getElementById('pdf-emoji').value.trim() || '📄',
      url: pdfUrl,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });

    fill.style.width = '100%';
    progressText.textContent = 'Done!';

    result.className = 'upload-result success';
    result.textContent = '✅ PDF uploaded and saved successfully! It is now live in the library.';
    result.style.display = 'block';
    e.target.reset();
    document.getElementById('fdz-content').innerHTML = `<span class="fdz-icon">📁</span><p><strong>Click to upload</strong> or drag & drop</p><p class="fdz-note">PDF files only</p>`;
    document.getElementById('price-group').style.display = 'none';

  } catch (err) {
    result.className = 'upload-result error';
    result.textContent = '❌ Error: ' + err.message;
    result.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = '📤 Upload & Save PDF';
    setTimeout(() => { progress.style.display = 'none'; fill.style.width = '0%'; }, 2000);
  }
});

// ---- MANAGE: LOAD PDFs ----
async function loadManagePDFs() {
  const listEl = document.getElementById('admin-pdf-list');
  if (!listEl) return;
  listEl.innerHTML = '<div class="loading-pdfs">Loading PDFs...</div>';

  try {
    const q = query(collection(db, 'pdfs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.innerHTML = '<div class="loading-pdfs">No PDFs uploaded yet. Upload one from the Upload panel!</div>';
      return;
    }

    listEl.innerHTML = '';
    snap.forEach(docSnap => {
      const pdf = docSnap.data();
      const item = document.createElement('div');
      item.className = 'admin-pdf-item';
      item.innerHTML = `
        <span class="api-emoji">${pdf.emoji || '📄'}</span>
        <div class="api-info">
          <div class="api-title">${pdf.title}</div>
          <div class="api-meta">
            <span>${pdf.category}</span>
            ${pdf.type === 'paid' ? `<span>₹${pdf.price}</span>` : ''}
            <span>${pdf.date}</span>
          </div>
        </div>
        <span class="api-badge ${pdf.type}">${pdf.type}</span>
        <button class="delete-btn" onclick="deletePDF('${docSnap.id}', this)">🗑 Delete</button>
      `;
      listEl.appendChild(item);
    });
  } catch (err) {
    listEl.innerHTML = `<div class="loading-pdfs">Error: ${err.message}. Make sure Firebase is configured.</div>`;
  }
}

// ---- DELETE PDF ----
window.deletePDF = async function(id, btn) {
  if (!confirm('Delete this PDF? This cannot be undone.')) return;
  try {
    btn.textContent = 'Deleting...';
    btn.disabled = true;
    await deleteDoc(doc(db, 'pdfs', id));
    btn.closest('.admin-pdf-item').remove();
  } catch (err) {
    alert('Delete failed: ' + err.message);
    btn.textContent = '🗑 Delete';
    btn.disabled = false;
  }
};
