// main.js

// --- 1. IMPORTS ---
import { db, auth } from './firebase-config.js';
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

// --- 5. PRE-BUILT TEMPLATE LIBRARY DATA (NEW CLEAN VERSION) ---
// This is now simple, clean, and fast.
const LIBRARY_TEMPLATES = [
  {
    name: "Simple Cold Outreach",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1602058334812-Simple.png",
    // This is the new, important part:
    designPath: "templates/cold_outreach.json" 
  },
  {
    name: "Welcome Email",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1586221040432-Welcome.png",
    designPath: "templates/welcome_email.json"
  },
  {
    name: "Follow-Up Template",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1602058334812-Simple.png", // Using same thumbnail for now
    designPath: "templates/follow_up.json"
  }
];

// --- 6. CORE APP FUNCTIONS ---

async function loadUserTemplates() {
  const grid = document.querySelector('#your-templates .template-grid');
  if (!grid) {
      console.error("User templates grid element not found.");
      return;
  }
  if (!currentUserId) {
    grid.innerHTML = `<p style="color: #ff8181;">Error: Not logged in.</p>`;
    return;
  }

  grid.innerHTML = '<p style="color: var(--text-secondary);">Loading templates...</p>';
  const templatesCollectionPath = `users/${currentUserId}/user_templates`;
  const q = query(collection(db, templatesCollectionPath), orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);
    grid.innerHTML = ''; 

    if (querySnapshot.empty) {
      grid.innerHTML = `<p style="color: var(--text-secondary);">No saved templates yet. Click "Create Template" to start!</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const template = doc.data();
      const templateId = doc.id;

      let date = 'Date unknown';
      if (template.createdAt) {
        if (typeof template.createdAt.toDate === 'function') {
          date = template.createdAt.toDate().toLocaleDateString();
        } else if (template.createdAt.seconds) {
          date = new Date(template.createdAt.seconds * 1000).toLocaleDateString();
        }
      }

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
        if (!template.design) {
            alert("Error: Cannot load this template, data is missing.");
            return;
        }
        console.log(`Loading saved template: ${templateId}`);
        safeSetStorage('contactx_template_to_load', JSON.stringify(template.design));
        window.location.href = 'editor.html';
      });

      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Error fetching templates: ", e);
    grid.innerHTML = `<p style="color: #ff8181;">Error: Could not load templates. Check console.</p>`;
  }
}

// --- MODIFIED: loadLibraryTemplates now uses fetch() ---
function loadLibraryTemplates() {
  const grid = document.querySelector('#library-templates .template-grid');
  if (!grid) {
      console.error("Library templates grid element not found.");
      return;
  }
  grid.innerHTML = ''; 

  LIBRARY_TEMPLATES.forEach(template => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="card-preview" style="padding: 0; overflow: hidden;">
        <img src="${template.thumbnailUrl}" alt="${template.name}" style="width:100%; height:100%; object-fit: cover;"/>
      </div>
      <div class="card-footer">
        <span class="card-title">${template.name}</span>
        <span class="card-tag">Library</span>
      </div>
    `;

    // --- NEW CLICK LOGIC ---
    card.addEventListener('click', async () => {
      console.log(`Loading library template: ${template.name}`);
      
      try {
        // 1. Fetch the JSON file from the templates/ folder
        const response = await fetch(template.designPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        const designJson = await response.json();

        // 2. Save the fetched JSON to storage
        safeSetStorage('contactx_template_to_load', JSON.stringify(designJson));
        
        // 3. Go to the editor
        window.location.href = 'editor.html';

      } catch (e) {
        console.error(`Error loading template "${template.name}":`, e);
        alert(`Error: Could not load template. See console.`);
      }
    });

    grid.appendChild(card);
  });
}

// --- (All other functions from here down are unchanged) ---

function openSlideout(data) {
  if (slideoutPanel && appOverlay) {
      slideoutPanel.style.display = 'block';
      appOverlay.classList.remove('hidden');
      gsap.to(slideoutPanel, { right: 0, duration: 0.45, ease: "power2.out" });
      gsap.to(appOverlay, { opacity: 0.7, duration: 0.45, ease: "power2.out" });
      slideoutPanel.classList.add('open');
  } else {
      console.error("Slideout panel or overlay element not found");
  }
}


function closeSlideout() {
  if (slideoutPanel && appOverlay) {
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
  } else {
      console.error("Slideout panel or overlay element not found");
  }
}

function updateProfileUI(user) {
  if (userNameEl) userNameEl.textContent = user.displayName || user.email || 'User';
  if (userEmailEl) userEmailEl.textContent = user.email || '';
  if (avatarEl) {
      const initial = user.displayName?.charAt(0) || user.email?.charAt(0) || '?';
      avatarEl.textContent = initial.toUpperCase();
  }
}

function handleInitialView() {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  const targetNavLink = document.querySelector(`.nav-link[data-view="${viewParam || 'dashboard'}"]`);

  if (targetNavLink) {
    if (!targetNavLink.classList.contains('active')) {
      setTimeout(() => targetNavLink.click(), 0);
    }
  } else {
    setTimeout(() => document.querySelector('.nav-link[data-view="dashboard"]')?.click(), 0);
  }

  setTimeout(() => {
    document.querySelectorAll('.projects-header').forEach(header => {
        const key = header.getAttribute('data-toggle');
        const list = document.getElementById('projects-' + key);
        const chevron = document.getElementById('chevron-' + key);
        if (list && chevron && !list.classList.contains('collapsed')) {
             header.click();
        }
    });
  }, 150);
}


// --- 7. MAIN AUTH CHECK ---

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
    currentUserId = user.uid;
    safeSetStorage('contactx_user_uid', user.uid);
    updateProfileUI(user);
    loadLibraryTemplates(); // Load static templates once auth is confirmed
    handleInitialView();
  } else {
    console.log("No user logged in, redirecting to login page.");
    safeRemoveStorage('contactx_user_uid');
    window.location.replace('login.html');
  }
});


// --- 8. EVENT LISTENERS ---

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
      const scrollHeight = list.scrollHeight;
      gsap.fromTo(list, { maxHeight: 0, opacity: 0 }, { maxHeight: scrollHeight, opacity: 1, duration: 0.35, ease: "power2.out" });
    }
  });
});

// Main Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const viewId = link.getAttribute('data-view');
    if (!viewId) return;

    if (viewId === 'campaigns' && currentUserId) {
      loadUserTemplates();
    }

    if (link.classList.contains('active')) return;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    const newView = document.getElementById(viewId + '-view');
    const currentView = document.querySelector('.main-view:not(.hidden)');

    if (!newView) {
        console.error(`View with ID "${viewId}-view" not found.`);
        return;
    }

    if (currentView && currentView !== newView) {
      gsap.to(currentView, {
        opacity: 0, y: -10, duration: 0.2, ease: "power1.in",
        onComplete: () => {
          currentView.classList.add('hidden');
          currentView.style.opacity = '';
          currentView.style.transform = '';
        }
      });
    }

    newView.classList.remove('hidden');
    gsap.set(newView, { opacity: 0, y: 10 });
    gsap.to(newView,
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power1.out",
        delay: (currentView && currentView !== newView) ? 0.15 : 0
      }
    );
  });
});

// Slideout Panel
if (closeBtn) closeBtn.addEventListener('click', closeSlideout);
if (appOverlay) appOverlay.addEventListener('click', closeSlideout);

document.querySelectorAll('.lead-row').forEach(row => {
  row.addEventListener('click', () => {
    openSlideout({ name: row.querySelector('.lead-name')?.textContent || 'Lead' });
  });
});

window.addEventListener('keydown', e => {
  if (e.key === "Escape" && slideoutPanel && slideoutPanel.classList.contains('open')) {
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
    console.log("Logout button clicked");
    try {
      await signOut(auth);
      safeRemoveStorage('contactx_user_uid');
      window.location.replace('login.html');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  });
} else {
    console.warn("Logout button not found.");
}

