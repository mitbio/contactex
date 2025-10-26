// editor.js

// Import our database connection from our new config file
import { db } from './firebase-config.js';
// Import the functions we need to write data
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/**
 * Saves the Unlayer design JSON to our Firestore database.
 * @param {object} designJson - The template JSON from Unlayer
 */
async function saveTemplateToFirebase(designJson) {
  try {

    const sanitizedDesign = JSON.parse(JSON.stringify(designJson));

    // Now we save the 'sanitizedDesign' object instead
    const docRef = await addDoc(collection(db, "user_templates"), {
      design: sanitizedDesign, // Use the sanitized object
      name: "Untitled Template",
      createdAt: serverTimestamp()
    });
    
    console.log("Template saved with ID: ", docRef.id);
    alert("Template saved successfully!");
    
    // After saving, go back to the dashboard
    window.location.href = 'index.html?view=campaigns';

  } catch (e) {
    console.error("Error adding document: ", e); // This is where your error appeared
    alert("Error: Could not save template. See console for details.");
    
    // Re-enable the button *if* an error happens
    const saveBtn = document.getElementById('save-template-btn');
    saveBtn.disabled = false;
    saveBtn.querySelector('span').textContent = 'Save Template';
  }
}

// Wait for the page to load
window.addEventListener('DOMContentLoaded', () => {

  unlayer.init({
    id: 'editor-container',
    projectId: '280840', // This is correct
    displayMode: 'email',
    // We leave 'theme' out, as it's a paid feature
  });

  unlayer.addEventListener('editor:ready', () => {
    console.log('Unlayer editor is now ready!');
    const saveBtn = document.getElementById('save-template-btn');

    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.querySelector('span').textContent = 'Saving...';

      unlayer.exportHtml(async (data) => {
        const designJson = data.design; // This is the JSON we want

        //
        // --- THIS IS THE CHANGE ---
        // Instead of alert(), we call our new Firebase function
        //
        await saveTemplateToFirebase(designJson);
        
        // Re-enable the button
        saveBtn.disabled = false;
        saveBtn.querySelector('span').textContent = 'Save Template';
      });
    });
  });
});
