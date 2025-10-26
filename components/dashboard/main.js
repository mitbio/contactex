// main.js

// Import our database connection
import { db } from './firebase-config.js';
// Import the functions we need to read data
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


// --- Global Selectors ---
const appOverlay = document.getElementById('app-overlay');
const dashboardView = document.getElementById('dashboard-view');
const leadsView = document.getElementById('leads-view');
const slideoutPanel = document.getElementById('slideout-panel');
const closeBtn = document.getElementById('close-slideout');


// =========================================================
// --- NEW: STAGE 3 - LOAD TEMPLATES FROM FIREBASE ---
// =========================================================
/**
 * Fetches templates from Firestore and displays them in the gallery.
 */
async function loadUserTemplates() {
  const grid = document.querySelector('#your-templates .template-grid');
  if (!grid) return;

  // 1. Clear the static placeholder cards
  grid.innerHTML = '';

  // 2. Query Firestore for all documents in 'user_templates'
  const q = query(collection(db, "user_templates"), orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);

    // 3. Check if we found any templates
    if (querySnapshot.empty) {
      grid.innerHTML = `<p style="color: var(--text-secondary);">No saved templates yet. Click "Create Template" to start!</p>`;
      return;
    }

    // 4. Loop through each doc and create a card
    querySnapshot.forEach((doc) => {
      const template = doc.data();
      const templateId = doc.id;
      
      // Format the date (if it exists)
      const date = template.createdAt ? new Date(template.createdAt.seconds * 1000).toLocaleDateString() : 'Just now';

      // Create the new card element
      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.id = templateId; // Store the ID for later
      
      card.innerHTML = `
        <div class="card-preview">
          <span class="preview-text">${template.name || 'Untitled Template'}</span>
        </div>
        <div class="card-footer">
          <span class="card-title">${template.name || 'Untitled Template'}</span>
          <span class="card-date">Saved: ${date}</span>
        </div>
      `;
      
      // Add a click listener to the card (for Stage 5)
      card.addEventListener('click', () => {
        console.log(`Clicked template ${templateId}`);
        // In a future stage, this will load the template back into the editor
        // unlayer.loadDesign(template.design);
      });

      grid.appendChild(card);
    });

  } catch (e) {
    console.error("Error fetching templates: ", e);
    grid.innerHTML = `<p style="color: #ff8181;">Error: Could not load templates.</p>`;
  }
}

// =========================================================
// --- END OF NEW: STAGE 3 ---
// =========================================================


// --- Sidebar Projects Collapse Animation (Unchanged) ---
document.querySelectorAll('.projects-header').forEach(header => {
  header.addEventListener('click', () => {
    const key = header.getAttribute('data-toggle');
    const list = document.getElementById('projects-' + key);
    const chevron = document.getElementById('chevron-' + key);
    const collapsed = list.classList.toggle('collapsed');
    gsap.to(chevron, { rotation: collapsed ? 0 : 90, duration: 0.3, transformOrigin: "50% 50%" });
    if (collapsed) {
      gsap.to(list, { maxHeight: 0, opacity: 0, duration: 0.35, ease: "power2.inOut" });
    } else {
      list.style.maxHeight = 'auto'; 
      gsap.fromTo(list, { maxHeight: 0, opacity: 0 }, { maxHeight: list.scrollHeight, opacity: 1, duration: 0.35, ease: "power2.inOut" });
    }
  });
  // Initialize all as collapsed
  // document.querySelectorAll('.projects-list').forEach(list => {
  //   list.classList.add('collapsed');
  //   list.style.maxHeight = '0px';
  //   list.style.opacity = '0';
  // });
  // document.querySelectorAll('.chevron').forEach(c => c.style.transform = 'rotate(0deg)');
});


// --- Main Navigation Tabs (MODIFIED for smoother animation) ---
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const viewId = link.getAttribute('data-view');
    
    // --- NEW: Check if we are loading the campaigns view
    if (viewId === 'campaigns') {
      loadUserTemplates(); // Refresh the template list every time
    }
    // ---

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

    newView.classList.remove('hidden');
    gsap.fromTo(newView, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power1.out", delay: currentView ? 0.15 : 0 }
    );
  });
});

// --- Inbox Tabs (Unchanged) ---
document.querySelectorAll('.inbox-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.inbox-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// --- Slide-Out Panel Animation (MODIFIED with overlay) ---
function openSlideout(data) {
  slideoutPanel.style.display = 'block';
  appOverlay.classList.remove('hidden');
  gsap.to(slideoutPanel, { right: 0, duration: 0.45, ease: "power2.out" });
  gsap.to(appOverlay, { opacity: 0.7, duration: 0.45, ease: "power2.out" });
  slideoutPanel.classList.add('open');
}

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

closeBtn.addEventListener('click', closeSlideout);
appOverlay.addEventListener('click', closeSlideout);

document.querySelectorAll('.lead-row').forEach(row => {
  row.addEventListener('click', () => {
    openSlideout();
  });
});

window.addEventListener('keydown', e => {
  if (e.key === "Escape" && slideoutPanel.classList.contains('open')) {
    closeSlideout();
  }
});

// --- Template Tab Switching (Unchanged from Stage 1) ---
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

// --- Navigate to "Create Template" page (Unchanged from Stage 2) ---
const createTemplateBtn = document.getElementById('create-template-btn');
if (createTemplateBtn) {
  createTemplateBtn.addEventListener('click', () => {
    console.log("Navigating to template editor...");
    window.location.href = 'editor.html';
  });
}

// --- NEW: Handle opening the campaigns view from another page (e.g., editor.html)
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'campaigns') {
    // Virtually click the 'Campaigns' nav link
    document.querySelector('.nav-link[data-view="campaigns"]').click();
  } else {
    // Default to collapsing the sidebar projects
    document.querySelectorAll('.projects-header').forEach(header => header.click());
  }
});
