// Wait for the page to load
window.addEventListener('DOMContentLoaded', () => {

  // --- Initialize Unlayer Editor ---
  unlayer.init({
    id: 'editor-container',
    projectId: '280840', // This is correct
    displayMode: 'email',
    theme: 'dark',
  });

  // --- Wait for the editor to be 100% ready ---
  unlayer.addEventListener('editor:ready', () => {
    console.log('Unlayer editor is now ready!');

    // Get the save button
    const saveBtn = document.getElementById('save-template-btn');

    // --- Save Button Logic (Moved inside the 'ready' event) ---
    saveBtn.addEventListener('click', () => {
      // Disable the button to prevent double-clicks
      saveBtn.disabled = true;
      saveBtn.querySelector('span').textContent = 'Saving...';

      // ======================================================
      //
      // HERE IS THE FIX:
      // We are changing 'exportJson' to 'exportHtml'.
      // The 'data' object will contain BOTH html and json (as 'design').
      //
      // ======================================================
      unlayer.exportHtml((data) => {
        const designJson = data.design; // This is the JSON we want
        const html = data.html;       // This is the exported HTML

        // 'data' is the full object
        console.log('Template Data (HTML and JSON):', data);
        console.log('Template JSON:', designJson);
        
        // This is our hook for Stage 3 (Saving to Firebase)
        alert('Template saved! Check the console for the JSON output.');

        // In Stage 3, we will replace the alert with:
        // await saveTemplateToFirebase(designJson);
        
        // Re-enable the button
        saveBtn.disabled = false;
        saveBtn.querySelector('span').textContent = 'Save Template';
      });
    });
  });

});
