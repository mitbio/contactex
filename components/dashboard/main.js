// main.js

// --- 1. IMPORTS ---
// Import our finished db and auth objects from the config
import { db, auth } from './firebase-config.js'; 

// Import only the *functions* we need from the SDK
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; 
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// --- 2. GLOBAL SELECTORS ---
const appOverlay = document.getElementById('app-overlay');
const slideoutPanel = document.getElementById('slideout-panel');
const closeBtn = document.getElementById('close-slideout');
const createTemplateBtn = document.getElementById('create-template-btn');
const logoutButton = document.getElementById('logout-button');
const userProfile = document.querySelector('.user-profile');
const userNameEl = document.querySelector('.user-name');
const userEmailEl = document.querySelector('.user-email');
const avatarEl = document.querySelector('.user-profile .avatar');


// --- 3. GLOBAL STATE ---
let currentUserId = null;


// --- 4. HELPER FUNCTIONS ---

// "Safe" storage functions to avoid errors in Guest Mode
function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("LocalStorage is not available in this environment.", e);
  }
}

function safeRemoveStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("LocalStorage is not available in this environment.", e);
  }
}

// --- 5. CORE APP FUNCTIONS ---

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

  grid.innerHTML = '';
  const templatesCollectionPath = `users/${currentUserId}/user_templates`;
  const q = query(collection(db, templatesCollectionPath), orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      grid.innerHTML = `<p style="color: var(--text-secondary);">No saved templates yet. Click "Create Template" to start!</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
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

/**
 * Opens the lead detail slideout panel.
 */
function openSlideout(data) {
  slideoutPanel.style.display = 'block';
  appOverlay.classList.remove('hidden');
  gsap.to(slideoutPanel, { right: 0, duration: 0.45, ease: "power2.out" });
  gsap.to(appOverlay, { opacity: 0.7, duration: 0.45, ease: "power2.out" });
  slideoutPanel.classList.add('open');
}

/**
 * Closes the lead detail slideout panel.
 */
function closeSlideout() {
  gsap.to(slideoutPanel, {
    right: -420, duration: 0.4, ease: "power2.in", 
    onComplete: () => {
      slideoutPanel.classList.remove('open');
      slideoutPanel.style.display = 'none';
    }
  });
  gsap.to(appOverlay, {
    opacity: 0, duration: 0.4, ease: "power2.in",
    onComplete: () => {
      appOverlay.classList.add('hidden');
    }
  });
}

/**
 * Updates the user profile UI with the user's data.
 */
function updateProfileUI(user) {
  if (userNameEl) userNameEl.textContent = user.displayName || 'New User';
  if (userEmailEl) userEmailEl.textContent = user.email;
  if (avatarEl && user.displayName) {
    avatarEl.textContent = user.displayName.charAt(0).toUpperCase();
  } else if (avatarEl && user.email) {
    avatarEl.textContent = user.email.charAt(0).toUpperCase();
  }
}

/**
 * Handles the initial page load logic (e.g., deep linking to a view)
 */
function handleInitialView() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'campaigns') {
    document.querySelector('.nav-link[data-view="campaigns"]').click();
  } else {
    // Default to collapsing sidebars
    document.querySelectorAll('.projects-header').forEach(header => header.click());
  }
}

// --- 6. MAIN AUTH CHECK (The "Brain" of the page) ---

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User IS logged in.
    console.log("User is logged in:", user.uid);
    currentUserId = user.uid;
    safeSetStorage('contactx_user_uid', user.uid);
    
    // Update the UI
    updateProfileUI(user);
    
    // Handle initial page view
    handleInitialView();

  } else {
    // User is NOT logged in. Redirect to login.
    console.log("No user logged in, redirecting to login page.");
    safeRemoveStorage('contactx_user_uid'); 
    window.location.href = 'login.html';
  }
});


// --- 7. ALL EVENT LISTENERS ---
// This is where all the "clicking" comes from.

// Sidebar Projects Collapse
document.querySelectorAll('.projects-header').forEach(header => {
  header.addEventListener('click', () => {
    const key = header.getAttribute('data-toggle');
    const list = document.getElementById('projects-' + key);
    const chevron = document.getElementById('chevron-' + key);
    if (!list || !chevron) return;
    
    const collapsed = list.classList.toggle('collapsed');
    gsap.to(chevron, { rotation: collapsed ? 0 : 90, duration: 0.3, transformOrigin: "50% 50%" });
    if (collapsed) {
      gsap.to(list, { maxHeight: 0, opacity: 0, duration: 0.35, ease: "power2.inOut" });
    } else {
      list.style.maxHeight = 'auto'; 
      gsap.fromTo(list, { maxHeight: 0, opacity: 0 }, { maxHeight: list.scrollHeight, opacity: 1, duration: 0.35, ease: "power2.inOut" });
    }
  });
});

// Main Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const viewId = link.getAttribute('data-view');
    if (!viewId) return;
    
    if (viewId === 'campaigns') {
      loadUserTemplates();
    }
    if (link.classList.contains('active')) return;
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const newView = document.getElementById(viewId + '-view');
    const currentView = document.querySelector('.main-view:not(.hidden)');
    
    if (currentView) {
      gsap.to(currentView, {
        opacity: 0, y: -10, duration: 0.2, ease: "power1.in",
        onComplete: () => {
          currentView.classList.add('hidden');
          currentView.style.y = 0;
        }
      });
    }
    
    if (newView) {
      newView.classList.remove('hidden');
      gsap.fromTo(newView, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power1.out", delay: currentView ? 0.15 : 0 }
      );
    }
  });
});

// Slideout Panel
if (closeBtn) closeBtn.addEventListener('click', closeSlideout);
if (appOverlay) appOverlay.addEventListener('click', closeSlideout);

document.querySelectorAll('.lead-row').forEach(row => {
  row.addEventListener('click', () => {
    openSlideout(); // We'll pass lead data here later
  });
});

window.addEventListener('keydown', e => {
  if (e.key === "Escape" && slideoutPanel.classList.contains('open')) {
    closeSlideout();
  }
});

// Template Tabs
document.querySelectorAll('.template-tab-btn').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabValue = tab.dataset.tab;
    document.querySelectorAll('.template-tab-btn').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.template-panel').forEach(panel => {
      panel.id === tabValue ? panel.classList.add('active') : panel.classList.remove('active');
    });
  });
});

// Create Template Button
if (createTemplateBtn) {
  createTemplateBtn.addEventListener('click', () => {
    window.location.href = 'editor.html';
  });
}

// Logout Button
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      safeRemoveStorage('contactx_user_uid');
      window.location.href = 'login.html';
    } catch (error) {
      console.error("Sign out error:", error);
    }
  });
}
