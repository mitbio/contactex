// editor.js

import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- NEW: Safe storage helper functions ---
function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("LocalStorage is not available in this environment.", e);
  }
}

function safeGetStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("LocalStorage is not available in this environment.", e);
    return null;
  }
}

function safeRemoveStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("LocalStorage is not available in this environment.", e);
  }
}

/**
 * Saves the Unlayer design JSON to our Firestore database
 */
async function saveTemplateToFirebase(designJson) {
  const user = auth.currentUser;
  
  if (!user) {
    alert("Error: You are not logged in. Redirecting to login.");
    window.location.href = 'login.html';
    return;
  }
  
  const uid = user.uid;
  
  try {
    const sanitizedDesign = JSON.parse(JSON.stringify(designJson));
    const templatesCollectionPath = `users/${uid}/user_templates`;

    const docRef = await addDoc(collection(db, templatesCollectionPath), {
      design: sanitizedDesign,
      name: "Untitled Template",
      createdAt: serverTimestamp()
    });
    
    alert("Template saved successfully!");
    window.location.href = 'index.html?view=campaigns';

  } catch (e) {
    console.error("Error adding document: ", e);
    alert("Error: Could not save template. See console for details.");
    
    // Re-enable button on error
    const saveBtn = document.getElementById('save-template-btn');
    saveBtn.disabled = false;
    saveBtn.querySelector('span').textContent = 'Save Template';
  }
}

// --- MODIFIED: Main startup logic ---
window.addEventListener('DOMContentLoaded', () => {
  
  // --- NEW: Check if a template is being passed in ---
  let templateToLoad = null;
  const templateJsonString = safeGetStorage('contactx_template_to_load');
  
  if (templateJsonString) {
    try {
      templateToLoad = JSON.parse(templateJsonString);
      // Clean up immediately so we don't load it again
      safeRemoveStorage('contactx_template_to_load');
    } catch (e) {
      console.error("Failed to parse template to load:", e);
      safeRemoveStorage('contactx_template_to_load');
    }
  }

  // --- Initialize Unlayer ---
  unlayer.init({
    id: 'editor-container',
    projectId: '280840',
    displayMode: 'email',
  });

  // --- Wait for editor to be ready ---
  unlayer.addEventListener('editor:ready', () => {
    console.log('Unlayer editor is now ready!');
    
    // --- NEW: Load the design if it exists ---
    if (templateToLoad) {
      console.log("Loading saved design into editor...");
      unlayer.loadDesign(templateToLoad);
    } else {
      console.log("Starting with a blank canvas.");
    }
    
    // --- (Save button logic is unchanged) ---
    const saveBtn = document.getElementById('save-template-btn');
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.querySelector('span').textContent = 'Saving...';

      unlayer.exportHtml(async (data) => {
        const designJson = data.design;
        await saveTemplateToFirebase(designJson);
        
        saveBtn.disabled = false;
        saveBtn.querySelector('span').textContent = 'Save Template';
      });
    });
  });
});
