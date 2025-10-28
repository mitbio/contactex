// main.js

// --- (Imports are unchanged) ---
import { db, auth } from './firebase-config.js'; 
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; 
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- (Global Selectors are unchanged) ---
const appOverlay = document.getElementById('app-overlay');
// ... (all other selectors)
const logoutButton = document.getElementById('logout-button');
const avatarEl = document.querySelector('.user-profile .avatar');

// --- (Global State is unchanged) ---
let currentUserId = null;

// --- (Helper Functions are unchanged) ---
function safeSetStorage(key, value) { /* ... */ }
function safeRemoveStorage(key) { /* ... */ }
// ... (Make sure your safe storage functions are here)

// --- (open/closeSlideout functions are unchanged) ---
function openSlideout(data) { /* ... */ }
function closeSlideout() { /* ... */ }

// --- (updateProfileUI is unchanged) ---
function updateProfileUI(user) { /* ... */ }

// --- (handleInitialView is unchanged) ---
function handleInitialView() { /* ... */ }


// =========================================================
// --- CORE APP FUNCTIONS (MODIFIED) ---
// =========================================================

/**
 * Fetches templates from Firestore *for the logged-in user*.
 */
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
      
      // --- MODIFIED: Added click listener ---
      card.addEventListener('click', () => {
        console.log(`Loading saved template: ${templateId}`);
        // 1. Save the design to localStorage
        safeSetStorage('contactx_template_to_load', JSON.stringify(template.design));
        // 2. Go to the editor
        window.location.href = 'editor.html';
      });

      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Error fetching templates: ", e);
    grid.innerHTML = `<p style="color: #ff8181;">Error: Could not load templates.</p>`;
  }
}

/**
 * --- NEW: Loads hard-coded templates into the Library tab ---
 */
function loadLibraryTemplates() {
  const grid = document.querySelector('#library-templates .template-grid');
  if (!grid) return;

  // Clear any static placeholders
  grid.innerHTML = '';

  // Get our library (defined at the bottom of this file)
  LIBRARY_TEMPLATES.forEach(template => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class.card-preview" style="padding: 0; overflow: hidden;">
        <img src="${template.thumbnailUrl}" alt="${template.name}" style="width:100%; height:100%; object-fit: cover;"/>
      </div>
      <div class.card-footer">
        <span class="card-title">${template.name}</span>
        <span class="card-tag">Library</span>
      </div>
    `;
    
    // Add click listener
    card.addEventListener('click', () => {
      console.log(`Loading library template: ${template.name}`);
      // 1. Save the design to localStorage
      // We pass the *entire* template object as it contains the design
      safeSetStorage('contactx_template_to_load', JSON.stringify(template.design));
      // 2. Go to the editor
      window.location.href = 'editor.html';
    });

    grid.appendChild(card);
  });
}


// =========================================================
// --- MAIN AUTH CHECK (MODIFIED) ---
// =========================================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
    currentUserId = user.uid;
    safeSetStorage('contactx_user_uid', user.uid);
    updateProfileUI(user);
    handleInitialView();
    
    // --- NEW: Load library templates once on startup ---
    loadLibraryTemplates();

  } else {
    console.log("No user logged in, redirecting to login page.");
    safeRemoveStorage('contactx_user_uid'); 
    window.location.href = 'login.html';
  }
});


// =========================================================
// --- ALL EVENT LISTENERS ---
// =========================================================

// --- (Sidebar Projects, Slideout, Keydown, Create Button, Logout Button... all stay the same) ---
// ... (paste all your existing event listeners here) ...

// Main Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const viewId = link.getAttribute('data-view');
    if (!viewId) return;
    
    // MODIFIED: We now *also* load templates when this view is clicked
    if (viewId === 'campaigns') {
      loadUserTemplates();
      // We don't need to reload the library, it's static.
    }
    // ... (rest of the nav code is the same)
    if (link.classList.contains('active')) return;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const newView = document.getElementById(viewId + '-view');
    const currentView = document.querySelector('.main-view:not(.hidden)');
    if (currentView) {
      gsap.to(currentView, { /* ... */ });
    }
    if (newView) {
      newView.classList.remove('hidden');
      gsap.fromTo(newView, { /* ... */ });
    }
  });
});

// --- (Ensure all other listeners are present: slideout, keydown, etc.) ---


// =========================================================
// --- NEW: PRE-BUILT TEMPLATE LIBRARY DATA ---
// =========================================================
// I've created two basic templates for you.
// I got the thumbnail URLs from Unlayer's own examples.

const LIBRARY_TEMPLATES = [
  {
    name: "Simple Cold Outreach",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1602058334812-Simple.png",
    design: {"counters":{"u_column":1,"u_row":2,"u_content_text":2,"u_content_button":1},"body":{"rows":[{"cells":[1],"values":{"backgroundColor":"#ffffff","columns":false,"padding":"0px","border":{}},"columns":[{"contents":[{"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"30px","textAlign":"left","lineHeight":"140%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Hi {{first_name}},</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">My name is {{your_name}} and I'm with {{your_company}}. I saw you're the {{title}} at {{company_name}}, and I wanted to reach out.</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">We help companies in your space do [ONE_LINE_VALUE_PROP].</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Are you free for a quick 15-minute chat next week to see if we can help you?</span></p>"}},{"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"type":"button","values":{"containerPadding":"10px","href_href":"https://your_calendar_link.com","href_target":"_blank","textAlign":"left","lineHeight":"120%","displayCondition":null,"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<span style=\"font-size: 14px; line-height: 16.8px;\">Book a Time</span>","buttonColors":{"color":"#FFFFFF","backgroundColor":"#3AAEE0","hoverColor":"#FFFFFF","hoverBackgroundColor":"#3AAEE0"},"size":{"width":"auto","height":"auto"},"padding":"10px 20px","border":{"borderWidth":"0px"},"borderRadius":"4px"}},{"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"20px","textAlign":"left","lineHeight":"140%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Best,</span></p>\n<p style=\"font-size: 14px; line-height: 140%;\"><span style=\\\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\\\">{{your_name}}</span></p>"}}],"values":{}}}],"values":{"backgroundColor":"#e7e7e7","padding":"0px","contentWidth":"600px","fontFamily":{"label":"Cabin","value":"Cabin, sans-serif"},"linkStyle":"none","_meta":{"htmlID":"u_body","htmlClassNames":"u_body"}}}
  },
  {
    name: "Welcome Email",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1586221040432-Welcome.png",
    design: {"counters":{"u_column":2,"u_row":3,"u_content_text":3,"u_content_image":1,"u_content_button":1,"u_content_divider":1},"body":{"rows":[{"cells":[1],"values":{"backgroundColor":"#ffffff","columns":false,"padding":"0px","border":{}},"columns":[{"contents":[{"_meta":{"htmlID":"u_content_image_1","htmlClassNames":"u_content_image"},"type":"image","values":{"containerPadding":"30px 10px 10px","src_url":"https://cdn.tools.unlayer.com/img/default-logotype.png","src_width":170,"src_maxWidth":"100%","href_href":"","href_target":"_blank","alt_text":"Logo","textAlign":"center","border":{},"displayCondition":null,"_meta":{"htmlID":"u_content_image_1","htmlClassNames":"u_content_image"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true}},{"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"10px","textAlign":"center","lineHeight":"140%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_1","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 28px; line-height: 39.2px;\"><strong><span style=\"line-height: 39.2px; font-family: Lora, serif; font-size: 28px;\">Welcome, {{first_name}}!</span></strong></span></p>"}},{"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"10px 30px","textAlign":"center","lineHeight":"170%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_2","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\">We're so excited to have you on board. We're here to help you get started and make the most of your new account.</span></p>"}},{"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"type":"button","values":{"containerPadding":"10px","href_href":"https://your_app_url.com/login","href_target":"_blank","textAlign":"center","lineHeight":"120%","displayCondition":null,"_meta":{"htmlID":"u_content_button_1","htmlClassNames":"u_content_button"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<span style=\"font-size: 14px; line-height: 16.8px;\">GET STARTED</span>","buttonColors":{"color":"#FFFFFF","backgroundColor":"#e03e2d","hoverColor":"#FFFFFF","hoverBackgroundColor":"#e03e2d"},"size":{"width":"auto","height":"auto"},"padding":"10px 20px","border":{"borderWidth":"0px"},"borderRadius":"4px"}},{"_meta":{"htmlID":"u_content_divider_1","htmlClassNames":"u_content_divider"},"type":"divider","values":{"containerPadding":"30px 10px","divider":{"width":"50%","borderWidth":"1px","borderStyle":"solid","borderColor":"#ced4d9","textAlign":"center"},"displayCondition":null,"_meta":{"htmlID":"u_content_divider_1","htmlClassNames":"u_content_divider"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true}},{"_meta":{"htmlID":"u_content_text_3","htmlClassNames":"u_content_text"},"type":"text","values":{"containerPadding":"10px 30px 30px","textAlign":"center","lineHeight":"170%","linkStyle":"none","displayCondition":null,"_meta":{"htmlID":"u_content_text_3","htmlClassNames":"u_content_text"},"selectable":true,"draggable":true,"duplicatable":true,"deletable":true,"text":"<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\">If you have any questions, just reply to this email. We're always happy to help!</span></p>\n<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\"><br />The {{your_company}} Team</span></p>"}}],"values":{}}],"values":{"backgroundColor":"#f9f9f9","padding":"0px","contentWidth":"600px","fontFamily":{"label":"Lato","value":"Lato, sans-serif"},"linkStyle":"none","_meta":{"htmlID":"u_body","htmlClassNames":"u_body"}}}
  }
];
