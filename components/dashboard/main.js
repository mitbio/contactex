// --- Global Selectors ---
const appOverlay = document.getElementById('app-overlay');
const dashboardView = document.getElementById('dashboard-view');
const leadsView = document.getElementById('leads-view');
const slideoutPanel = document.getElementById('slideout-panel');
const closeBtn = document.getElementById('close-slideout');

// --- Sidebar Projects Collapse Animation (Unchanged) ---
document.querySelectorAll('.projects-header').forEach(header => {
  header.addEventListener('click', () => {
    const key = header.getAttribute('data-toggle');
    const list = document.getElementById('projects-' + key);
    const chevron = document.getElementById('chevron-' + key);
    const collapsed = list.classList.toggle('collapsed');
    // Animate chevron
    gsap.to(chevron, { rotation: collapsed ? 0 : 90, duration: 0.3, transformOrigin: "50% 50%" }); // Corrected rotation
    // Animate height
    if (collapsed) {
      gsap.to(list, { maxHeight: 0, opacity: 0, duration: 0.35, ease: "power2.inOut" });
    } else {
      // Set to auto to recalculate natural height
      list.style.maxHeight = 'auto'; 
      gsap.fromTo(list, { maxHeight: 0, opacity: 0 }, { maxHeight: list.scrollHeight, opacity: 1, duration: 0.35, ease: "power2.inOut" });
    }
  });
  // Initialize all as collapsed
  header.click();
});


// --- Main Navigation Tabs (MODIFIED for smoother animation) ---
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    
    // Check if already active
    if (link.classList.contains('active')) {
      return;
    }

    // Update active link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const viewId = link.getAttribute('data-view');
    const newView = document.getElementById(viewId + '-view');
    
    // Find the current view
    const currentView = document.querySelector('.main-view:not(.hidden)');

    if (currentView) {
      // Animate out the current view
      gsap.to(currentView, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: "power1.in",
        onComplete: () => {
          currentView.classList.add('hidden');
          currentView.style.y = 0; // Reset position
        }
      });
    }

    // Animate in the new view
    newView.classList.remove('hidden');
    gsap.fromTo(newView, 
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power1.out",
        delay: currentView ? 0.15 : 0 // Delay if switching
      }
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
  // (Optional: insert data into panel here)
  slideoutPanel.style.display = 'block';
  appOverlay.classList.remove('hidden');
  
  // Animate panel and overlay
  gsap.to(slideoutPanel, { right: 0, duration: 0.45, ease: "power2.out" });
  gsap.to(appOverlay, { opacity: 0.7, duration: 0.45, ease: "power2.out" });
  
  slideoutPanel.classList.add('open');
}

function closeSlideout() {
  // Animate panel and overlay out
  gsap.to(slideoutPanel, {
    right: -420, 
    duration: 0.4, 
    ease: "power2.in", 
    onComplete: () => {
      slideoutPanel.classList.remove('open');
      slideoutPanel.style.display = 'none'; // Use none instead of ''
    }
  });
  gsap.to(appOverlay, {
    opacity: 0,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => {
      appOverlay.classList.add('hidden');
    }
  });
}

// Event Listeners for slideout
closeBtn.addEventListener('click', closeSlideout);
appOverlay.addEventListener('click', closeSlideout); // NEW: Click overlay to close

// Open slideout when clicking a lead's name
document.querySelectorAll('.lead-row').forEach(row => {
  row.addEventListener('click', () => {
    // (Optional: fetch and populate lead data based on row.dataset.lead)
    openSlideout();
  });
});

// (Optional) Close slideout on ESC key
window.addEventListener('keydown', e => {
  if (e.key === "Escape" && slideoutPanel.classList.contains('open')) {
    closeSlideout();
  }
});

// --- Template Tab Switching ---
document.querySelectorAll('.template-tab-btn').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabValue = tab.dataset.tab;

    // Update tab button active state
    document.querySelectorAll('.template-tab-btn').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update panel active state
    document.querySelectorAll('.template-panel').forEach(panel => {
      if (panel.id === tabValue) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  });
});

// --- Navigate to "Create Template" page (for Stage 2) ---
// We will create 'editor.html' in the next stage.
const createTemplateBtn = document.getElementById('create-template-btn');
if (createTemplateBtn) {
  createTemplateBtn.addEventListener('click', () => {
    console.log("Navigating to template editor...");
    window.location.href = 'editor.html'; // We will enable this in Stage 2
   // alert("This will open the Unlayer.js editor (Stage 2)!");
  });
}