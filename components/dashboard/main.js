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

// --- 5. PRE-BUILT TEMPLATE LIBRARY DATA (MOVED HERE) ---
const LIBRARY_TEMPLATES = [
  {
    name: "Simple Cold Outreach",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1602058334812-Simple.png",
    design: {"counters":{"u_column":1,"u_row":2,"u_content_text":2,"u_content_button":1},"body":{"rows":[{"cells":[1],"values":{"backgroundColor":"#ffffff","columns":false,"padding":"0px","border":{}},"columns":[{"contents":[{"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"30px","textAlign":"left","lineHeight":"140%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Hi {{first_name}},</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">My name is {{your_name}} and I'm with {{your_company}}. I saw you're the {{title}} at {{company_name}}, and I wanted to reach out.</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">We help companies in your space do [ONE_LINE_VALUE_PROP].</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Are you free for a quick 15-minute chat next week to see if we can help you?</span></p>"}},{"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"type":"button","values":{"containerPadding":"10px","href_href":"https://your_calendar_link.com","href_target":"_blank","textAlign":"left","lineHeight":"120%","displayCondition":null,"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<span style=\"font-size: 14px; line-height: 16.8px;\">Book a Time</span>","buttonColors":{"color":"#FFFFFF","backgroundColor":"#3AAEE0","hoverColor":"#FFFFFF","hoverBackgroundColor":"#3AAEE0"},"size":{"width":"auto","height":"auto"},"padding":"10px 20px","border":{"borderWidth":"0px"},"borderRadius":"4px"}},{"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"20px","textAlign":"left","lineHeight":"140%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Best,</span></p>\n<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">{{your_name}}</span></p>"}}],"values":{}}}],"values":{"backgroundColor":"#e7e7e7","padding":"0px","contentWidth":"600px","fontFamily":{"label":"Cabin","value":"Cabin, sans-serif"},"linkStyle":"none","_meta":{"htmlID":"u_body","htmlClassNames":"u_body"}}}
  }, // Comma is correctly here
  {
    name: "Welcome Email",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1586221040432-Welcome.png",
    design: {"counters":{"u_column":2,"u_row":3,"u_content_text":3,"u_content_image":1,"u_content_button":1,"u_content_divider":1},"body":{"rows":[{"cells":[1],"values":{"backgroundColor":"#ffffff","columns":false,"padding":"0px","border":{}},"columns":[{"contents":[{"_meta":{"htmlID":"u_content_image_1","htmlClassNames":"u_content_image"},"type":"image","values":{"containerPadding":"30px 10px 10px","src_url":"https://cdn.tools.unlayer.com/img/default-logotype.png","src_width":170,"src_maxWidth":"100%","href_href":"","href_target":"_blank","alt_text":"Logo","textAlign":"center","border":{},"displayCondition":null,"_meta":{"htmlID":"u_content_image_1","htmlClassNames":"u_content_image"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true}},{"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"10px","textAlign":"center","lineHeight":"140%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 28px; line-height: 39.2px;\"><strong><span style=\"line-height: 39.2px; font-family: Lora, serif; font-size: 28px;\">Welcome, {{first_name}}!</span></strong></span></p>"}},{"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"10px 30px","textAlign":"center","lineHeight":"170%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\">We're so excited to have you on board. We're here to help you get started and make the most of your new account.</span></p>"}},{"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"type":"button","values":{"containerPadding":"10px","href_href":"https://your_app_url.com/login","href_target":"_blank","textAlign":"center","lineHeight":"120%","displayCondition":null,"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<span style=\"font-size: 14px; line-height: 16.8px;\">GET STARTED</span>","buttonColors":{"color":"#FFFFFF","backgroundColor":"#e03e2d","hoverColor":"#FFFFFF","hoverBackgroundColor":"#e03e2d"},"size":{"width":"auto","height":"auto"},"padding":"10px 20px","border":{"borderWidth":"0px"},"borderRadius":"4px"}},{"_meta":{"htmlID":"u_content_divider_1","htmlClassNames":"u_content_divider"},"type":"divider","values":{"containerPadding":"30px 10px","divider":{"width":"50%","borderWidth":"1px","borderStyle":"solid","borderColor":"#ced4d9","textAlign":"center"},"displayCondition":null,"_meta":{"htmlID":"u_content_divider_1","htmlClassNames":"u_content_divider"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true}},{"_meta":{"htmlID":"u_content_text_3","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"10px 30px 30px","textAlign":"center","lineHeight":"170%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_3","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\">If you have any questions, just reply to this email. We're always happy to help!</span></p>\n<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\"><br />The {{your_company}} Team</span></p>"}}],"values":{}}],"values":{"backgroundColor":"#f9f9f9","padding":"0px","contentWidth":"600px","fontFamily":{"label":"Lato","value":"Lato, sans-serif"},"linkStyle":"none","_meta":{"htmlID":"u_body","htmlClassNames":"u_body"}}}
  }
];

// --- 6. CORE APP FUNCTIONS ---

async function loadUserTemplates() {
  const grid = document.querySelector('#your-templates .template-grid');
  if (!grid) return;
  if (!currentUserId) {
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

      // --- IMPROVED DATE HANDLING ---
      let date = 'Just now';
      if (template.createdAt) {
        if (typeof template.createdAt.toDate === 'function') {
          // Firestore Timestamp object
          date = template.createdAt.toDate().toLocaleDateString();
        } else if (template.createdAt.seconds) {
          // Object with seconds/nanoseconds
          date = new Date(template.createdAt.seconds * 1000).toLocaleDateString();
        } else {
          // Fallback: try to convert whatever it is to string
          date = String(template.createdAt);
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
        console.log(`Loading saved template: ${templateId}`);
        safeSetStorage('contactx_template_to_load', JSON.stringify(template.design));
        window.location.href = 'editor.html';
      });

      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Error fetching templates: ", e);
    grid.innerHTML = `<p style="color: #ff8181;">Error: Could not load templates.</p>`;
  }
}

function loadLibraryTemplates() {
  const grid = document.querySelector('#library-templates .template-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // Use the globally defined LIBRARY_TEMPLATES
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
    
    card.addEventListener('click', () => {
      console.log(`Loading library template: ${template.name}`);
      safeSetStorage('contactx_template_to_load', JSON.stringify(template.design));
      window.location.href = 'editor.html';
    });

    grid.appendChild(card);
  });
}

function openSlideout(data) {
  // Ensure elements exist before animating
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
  // Ensure elements exist before animating
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
  if (userNameEl) userNameEl.textContent = user.displayName || 'New User';
  if (userEmailEl) userEmailEl.textContent = user.email;
  if (avatarEl && user.displayName) {
    avatarEl.textContent = user.displayName.charAt(0).toUpperCase();
  } else if (avatarEl && user.email) {
    avatarEl.textContent = user.email.charAt(0).toUpperCase();
  }
}

function handleInitialView() {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  const targetNavLink = document.querySelector(`.nav-link[data-view="${viewParam || 'dashboard'}"]`);

  if (targetNavLink) {
    // Check if it's already active to prevent re-clicking the dashboard on initial load
    if (!targetNavLink.classList.contains('active')) {
      targetNavLink.click();
    }
  } else {
    // Fallback to dashboard if view param is invalid
    document.querySelector('.nav-link[data-view="dashboard"]')?.click();
  }

  // Ensure sidebars are collapsed initially, but only if not deep linking
  if (!viewParam) {
    // Small delay to ensure elements are ready for GSAP
    setTimeout(() => {
        document.querySelectorAll('.projects-header').forEach(header => {
            const key = header.getAttribute('data-toggle');
            const list = document.getElementById('projects-' + key);
            const chevron = document.getElementById('chevron-' + key);
            if (list && chevron && !list.classList.contains('collapsed')) {
                 // Simulate a click only if it's not already collapsed
                 header.click();
            } else if (list && !list.classList.contains('collapsed')) {
                // Force collapse if state is inconsistent (JS loaded late)
                list.classList.add('collapsed');
                list.style.maxHeight = '0px';
                list.style.opacity = '0';
                if(chevron) gsap.to(chevron, { rotation: 0, duration: 0 }); // Reset chevron instantly
            }
        });
    }, 100); // 100ms delay might be enough
  }
}


// --- 7. MAIN AUTH CHECK ---

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
    currentUserId = user.uid;
    safeSetStorage('contactx_user_uid', user.uid);
    updateProfileUI(user);
    
    // Load library templates once user is confirmed logged in
    loadLibraryTemplates(); // Moved here
    
    handleInitialView(); // Handle view logic *after* auth confirmed

  } else {
    console.log("No user logged in, redirecting to login page.");
    safeRemoveStorage('contactx_user_uid');
    window.location.href = 'login.html';
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
      // Get natural height before animating
      const scrollHeight = list.scrollHeight;
      list.style.maxHeight = '0px'; // Ensure it starts from 0 if reopening quickly
      list.style.opacity = '0';
      gsap.to(list, { maxHeight: scrollHeight, opacity: 1, duration: 0.35, ease: "power2.out" }); // Use power2.out
    }
  });
});


// Main Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const viewId = link.getAttribute('data-view');
    if (!viewId) return;

    if (viewId === 'campaigns' && currentUserId) { // Ensure user is logged in
      loadUserTemplates();
    }

    // Don't re-animate if already active
    if (link.classList.contains('active')) return;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    const newView = document.getElementById(viewId + '-view');
    const currentView = document.querySelector('.main-view:not(.hidden)');

    // Ensure elements exist
    if (!newView) {
        console.error(`View with ID "${viewId}-view" not found.`);
        return;
    }

    if (currentView && currentView !== newView) { // Don't animate out if it's the same view somehow
      gsap.to(currentView, {
        opacity: 0, y: -10, duration: 0.2, ease: "power1.in",
        onComplete: () => {
          currentView.classList.add('hidden');
          // Reset styles immediately after hiding
          currentView.style.opacity = '';
          currentView.style.transform = '';
        }
      });
    }

    // Animate in the new view
    newView.classList.remove('hidden');
    // Ensure starting state is correct before animating in
    gsap.set(newView, { opacity: 0, y: 10 });
    gsap.to(newView,
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power1.out",
        delay: (currentView && currentView !== newView) ? 0.15 : 0 // Delay only if switching
      }
    );
  });
});

// Slideout Panel
if (closeBtn) closeBtn.addEventListener('click', closeSlideout);
if (appOverlay) appOverlay.addEventListener('click', closeSlideout);

document.querySelectorAll('.lead-row').forEach(row => {
  row.addEventListener('click', () => {
    openSlideout();
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
    try {
      await signOut(auth);
      safeRemoveStorage('contactx_user_uid');
      window.location.href = 'login.html';
    } catch (error) {
      console.error("Sign out error:", error);
    }
  });
}
