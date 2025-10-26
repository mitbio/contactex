// editor.js

// --- MODIFIED: Import 'auth' from our config ---
import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Saves the Unlayer design JSON to our Firestore database
 * under the currently logged-in user.
 */
async function saveTemplateToFirebase(designJson) {
  // --- NEW: Get the user's ID ---
  const user = auth.currentUser;
  
  if (!user) {
    console.error("No user is logged in. Cannot save template.");
    alert("Error: You are not logged in. Redirecting to login.");
    window.location.href = 'login.html'; // Redirect if something is wrong
    return;
  }
  
  const uid = user.uid;
  
  try {
    // Sanitize the object
    const sanitizedDesign = JSON.parse(JSON.stringify(designJson));

    // --- NEW: This is the new, user-specific database path ---
    // It will be like: "users" -> [USER_ID] -> "user_templates"
    const templatesCollectionPath = `users/${uid}/user_templates`;

    const docRef = await addDoc(collection(db, templatesCollectionPath), {
      design: sanitizedDesign,
      name: "Untitled Template",
      createdAt: serverTimestamp()
    });
    
    console.log("Template saved with ID: ", docRef.id);
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

// --- (The rest of your editor.js file is identical) ---

window.addEventListener('DOMContentLoaded', () => {
  unlayer.init({
    id: 'editor-container',
    projectId: '280840',
    displayMode: 'email',
  });

  unlayer.addEventListener('editor:ready', () => {
    console.log('Unlayer editor is now ready!');
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
