// library.js — PDF Library logic for STUDYHUB
import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const WA_NUMBER = '919130204873';
let allPDFs = [];

// ---- DEMO DATA (shown until Firebase is configured) ----
const DEMO_PDFS = [
  { id: '1', title: 'Data Structures & Algorithms Notes', category: 'engineering', type: 'free', description: 'Complete DSA notes covering arrays, linked lists, trees, graphs and sorting algorithms.', emoji: '📘', date: '2024-01-15' },
  { id: '2', title: 'Machine Learning Research Paper Collection', category: 'research', type: 'paid', price: 299, description: 'Curated collection of 20+ ML research papers from top conferences.', emoji: '🔬', date: '2024-02-10' },
  { id: '3', title: 'MBA Finance Study Material', category: 'mba', type: 'free', description: 'Complete MBA Finance semester notes including FM, investment analysis.', emoji: '📗', date: '2024-01-28' },
  { id: '4', title: 'Final Year Project Report Template', category: 'engineering', type: 'paid', price: 149, description: 'Ready-to-use final year project report template in standard format.', emoji: '📄', date: '2024-03-05' },
  { id: '5', title: 'Operating Systems Handwritten Notes', category: 'notes', type: 'free', description: 'Clear handwritten OS notes covering processes, memory, file systems.', emoji: '📝', date: '2024-02-20' },
  { id: '6', title: 'DBMS Complete Question Bank', category: 'engineering', type: 'free', description: 'Previous year questions and answers for DBMS university exams.', emoji: '🗄️', date: '2024-03-12' },
  { id: '7', title: 'AI & Deep Learning Paper Bundle', category: 'research', type: 'paid', price: 399, description: 'Exclusive bundle of 30+ AI/DL papers including transformer architectures.', emoji: '🤖', date: '2024-03-18' },
  { id: '8', title: 'Marketing Management MBA Notes', category: 'mba', type: 'free', description: 'Detailed MBA Marketing Management notes with case studies.', emoji: '📊', date: '2024-03-22' },
];

// ---- RENDER ----
function renderPDFs(pdfs) {
  const grid = document.getElementById('pdf-grid');
  const empty = document.getElementById('empty-state');
  if (!grid) return;

  grid.innerHTML = '';
  if (pdfs.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  pdfs.forEach(pdf => {
    const isPaid = pdf.type === 'paid';
    const card = document.createElement('div');
    card.className = 'pdf-card';
    card.innerHTML = `
      <div class="pdf-card-thumb ${isPaid ? 'paid-thumb' : 'free-thumb'}">
        <span class="pdf-type-badge ${isPaid ? 'paid' : 'free'}">${isPaid ? 'Premium' : 'Free'}</span>
        <span style="font-size:3rem">${pdf.emoji || '📄'}</span>
        ${isPaid ? `<div class="thumb-lock"><span class="lock-icon">🔒</span><span class="lock-price">₹${pdf.price}</span></div>` : ''}
      </div>
      <div class="pdf-card-body">
        <span class="pdf-card-category">${pdf.category}</span>
        <h3 class="pdf-card-title">${pdf.title}</h3>
        <p class="pdf-card-desc">${pdf.description}</p>
      </div>
      <div class="pdf-card-footer">
        <span class="pdf-card-date">${formatDate(pdf.date)}</span>
        <button class="pdf-view-btn ${isPaid ? 'paid-btn' : 'free-btn'}" 
          onclick="${isPaid ? `openPaymentModal('${pdf.id}','${escQ(pdf.title)}',${pdf.price})` : `openViewer('${escQ(pdf.url || '')}','${escQ(pdf.title)}')`}">
          ${isPaid ? '🔓 Unlock' : '👁 View'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function escQ(s) { return (s || '').replace(/'/g, "\\'"); }

// ---- LOAD FROM FIREBASE or DEMO ----
async function loadPDFs() {
  try {
    const q = query(collection(db, 'pdfs'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('empty');
    allPDFs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('admin-notice').style.display = 'block';
  } catch {
    // Firebase not configured yet — use demo data
    allPDFs = DEMO_PDFS;
  }
  renderPDFs(allPDFs);
}

// ---- SEARCH & FILTER ----
const searchInput = document.getElementById('pdf-search');
if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    applyFilters();
  });
});

function applyFilters() {
  const search = (searchInput?.value || '').toLowerCase();
  const activeFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
  const filtered = allPDFs.filter(pdf => {
    const matchSearch = pdf.title.toLowerCase().includes(search) || pdf.category.toLowerCase().includes(search);
    const matchFilter = activeFilter === 'all' || pdf.type === activeFilter || pdf.category === activeFilter;
    return matchSearch && matchFilter;
  });
  renderPDFs(filtered);
}

// ---- PAYMENT MODAL ----
window.openPaymentModal = function(id, title, price) {
  const modal = document.getElementById('payment-modal');
  document.getElementById('modal-title').textContent = `Unlock: ${title}`;
  document.getElementById('modal-subtitle').textContent = 'Pay via UPI to get instant access to this PDF.';
  document.getElementById('modal-price').textContent = `₹${price}`;
  const msg = encodeURIComponent(`Hi STUDYHUB! I have paid ₹${price} for the PDF: "${title}". Here is my payment screenshot.`);
  document.getElementById('modal-wa-btn').href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
};

document.getElementById('modal-close')?.addEventListener('click', () => {
  document.getElementById('payment-modal').classList.remove('open');
});

document.getElementById('payment-modal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('payment-modal')) {
    document.getElementById('payment-modal').classList.remove('open');
  }
});

// ---- PDF VIEWER ----
window.openViewer = function(url, title) {
  if (!url) {
    alert('PDF URL not configured. Please add it from the Admin Panel.');
    return;
  }
  const modal = document.getElementById('viewer-modal');
  document.getElementById('viewer-title').textContent = title;
  
  // Ensure HTTPS to prevent mixed-content blocks
  if (url.startsWith('http://')) url = url.replace('http://', 'https://');

  // Format Google Drive links for embedding
  let embedUrl = url;
  if (url.includes('drive.google.com')) {
    embedUrl = url.replace('/view', '/preview').replace('/edit', '/preview');
  }

  // Display PDF directly in the iframe
  document.getElementById('pdf-iframe').src = embedUrl;

  // Set "Open in New Tab" URL
  const newTabBtn = document.getElementById('viewer-newtab-btn');
  if (newTabBtn) newTabBtn.href = url;

  // Set download button URL
  const dlBtn = document.getElementById('viewer-download-btn');
  if (dlBtn) {
    let dlUrl = url;
    // Force download for Cloudinary URLs by adding fl_attachment
    if (url.includes('res.cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        dlUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
      }
    }
    dlBtn.href = dlUrl;
    dlBtn.setAttribute('download', title + '.pdf');
  }

  modal.classList.add('open');
};

document.getElementById('viewer-close')?.addEventListener('click', () => {
  document.getElementById('viewer-modal').classList.remove('open');
  document.getElementById('pdf-iframe').src = '';
});

// ---- COPY UPI ----
window.copyUPI = function() {
  const upi = document.getElementById('upi-id-text').textContent;
  navigator.clipboard.writeText(upi).then(() => {
    const btn = document.getElementById('copy-upi-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy', 2000);
  });
};

// ---- INIT ----
loadPDFs();
