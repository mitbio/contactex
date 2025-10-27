// main.js

// Import our *finished* db and auth objects from the config
import { db, auth } from './firebase-config.js'; 

// Import only the *functions* we need from the SDK
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; 
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Global Selectors (Unchanged) ---
const appOverlay = document.getElementById('app-overlay');
// ... (all your other selectors)
const slideoutPanel = document.getElementById('slideout-panel');
const closeBtn = document.getElementById('close-slideout');

// --- NEW: Global variable for User ID ---
let currentUserId = null;


/**
 * Fetches templates from Firestore *for the logged-in user*.
 */
async function loadUserTemplates() {
  const grid = document.querySelector('#your-templates .template-grid');
  if (!grid) return;

  if (!currentUserId) {
    console.error("No user ID found. Cannot load templates.");
    grid.innerHTML = `<p style="color: #ff8181;">Error: Not logged in.</p>`;
    return;
  }

  // 1. Clear placeholders
  grid.innerHTML = '';

  // 2. --- NEW: Use the user-specific path ---
  const templatesCollectionPath = `users/${currentUserId}/user_templates`;
  const q = query(collection(db, templatesCollectionPath), orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);

    // 3. Check if empty
    if (querySnapshot.empty) {
      grid.innerHTML = `<p style="color: var(--text-secondary);">No saved templates yet. Click "Create Template" to start!</p>`;
      return;
    }

    // 4. Loop and create cards (Unchanged)
    querySnapshot.forEach((doc) => {
      // ... (all the card-creation HTML is the same)
      const template = doc.data();
      const templateId = doc.id;
      const date = template.createdAt ? new Date(template.createdAt.seconds * 1000).toLocaleDateString() : 'Just now';

      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.id = templateId;
      
      card.innerHTML = `
        <div class="card-preview">
          <span class="preview-text">${template.name || 'Untitled Template'}</span>
        </div>
        <div class="card-footer">
          <span class="card-title">${template.name || 'Untitled Template'}</span>
          <span class="card-date">Saved: ${date}</span>
        </div>
      `;
      
      card.addEventListener('click', () => {
        console.log(`Clicked template ${templateId}`);
      });

      grid.appendChild(card);
    });

  } catch (e) {
    console.error("Error fetching templates: ", e);
    grid.innerHTML = `<p style="color: #ff8181;">Error: Could not load templates.</p>`;
  }
}

// --- (Sidebar, Nav, Slideout, and Tab-switching code is all unchanged) ---
// ... (paste all your existing functions for sidebar, nav, slideout, etc. here) ...

/* (Make sure all these functions are present in your file)
  
  document.querySelectorAll('.projects-header').forEach(...)
  document.querySelectorAll('.nav-link').forEach(...)
  function openSlideout(data) { ... }
  function closeSlideout() { ... }
  closeBtn.addEventListener('click', closeSlideout);
  appOverlay.addEventListener('click', closeSlideout);
  document.querySelectorAll('.lead-row').forEach(...)
  window.addEventListener('keydown', ...)
  document.querySelectorAll('.template-tab-btn').forEach(...)
  createTemplateBtn.addEventListener('click', ...)
*/

// =========================================================
// --- NEW: AUTHENTICATION CHECK & LOGOUT ---
// =========================================================

// --- 1. Add the Sign Out Button to the Profile ---
const userProfile = document.querySelector('.user-profile');


// --- 2. Main Auth Check on Page Load ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User IS logged in.
    console.log("User is logged in:", user.uid);
    currentUserId = user.uid; // <-- Set our global UID
    
    // Save/update the UID in storage just in case
    localStorage.setItem('contactx_user_uid', user.uid);
    
    // --- Update the user profile UI ---
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    const avatar = document.querySelector('.user-profile .avatar');
    
    if (userName) userName.textContent = user.displayName || 'New User';
    if (userEmail) userEmail.textContent = user.email;
    if (avatar && user.displayName) {
      avatar.textContent = user.displayName.charAt(0).toUpperCase();
    } else if (avatar && user.email) {
      avatar.textContent = user.email.charAt(0).toUpperCase();
    }
    
    // --- Handle initial page view ---
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'campaigns') {
      document.querySelector('.nav-link[data-view="campaigns"]').click();
    } else {
      // Default to collapsing sidebars
      document.querySelectorAll('.projects-header').forEach(header => header.click());
    }

  } else {
    // User is NOT logged in. Redirect to login.
    console.log("No user logged in, redirecting to login page.");
    localStorage.removeItem('contactx_user_uid');
    window.location.href = 'login.html';
  }
});

// (Remove the old 'DOMContentLoaded' listener, as onAuthStateChanged handles our startup logic now)

// main.js

// --- (All your other code, including onAuthStateChanged, is above this) ---

// =========================================================
// --- NEW: LOGIC FOR SETTINGS PAGE ---
// =========================================================

const logoutButton = document.getElementById('logout-button');

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth); // 'auth' is already defined in onAuthStateChanged
      safeRemoveStorage('contactx_user_uid'); // Use our safe function
      window.location.href = 'login.html'; // Go to login
    } catch (error) {
      console.error("Sign out error:", error);
    }
  });
}

