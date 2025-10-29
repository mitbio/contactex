 // main.js

// --- 1. IMPORTS ---
import { db, auth } from './firebase-config.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// --- 2. GLOBAL SELECTORS ---
// Ensure all these IDs exist in your index.html
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

// --- 5. PRE-BUILT TEMPLATE LIBRARY DATA ---
// Moved near the top to avoid potential definition order issues
const LIBRARY_TEMPLATES = [
  {
    name: "Simple Cold Outreach",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1602058334812-Simple.png",
    design: {
  "counters": {
    "u_column": 1,
    "u_row": 2,
    "u_content_text": 2,
    "u_content_button": 1
  },
  "body": {
    "rows": [
      {
        "cells": [
          1
        ],
        "values": {
          "backgroundColor": "#ffffff",
          "columns": false,
          "padding": "0px",
          "border": {}
        },
        "columns": [
          {
            "contents": [
              {
                "_meta": {
                  "htmlID": "u_content_text_1",
                  "htmlClassNames": "u_content_text"
                },
                "type": "text",
                "values": {
                  "containerPadding": "30px",
                  "textAlign": "left",
                  "lineHeight": "140%",
                  "linkStyle": "none",
                  "displayCondition": null,
                  "_meta": {
                    "htmlID": "u_content_text_1",
                    "htmlClassNames": "u_content_text"
                  },
                  "selectable": true,
                  "draggable": true,
                  "duplicatable": true,
                  "deletable": true,
                  "text": "<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Hi {{first_name}},</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">My name is {{your_name}} and I'm with {{your_company}}. I saw you're the {{title}} at {{company_name}}, and I wanted to reach out.</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">We help companies in your space do [ONE_LINE_VALUE_PROP].</span></p>\n<p style=\"font-size: 14px; line-height: 140%; text-align: left;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Are you free for a quick 15-minute chat next week to see if we can help you?</span></p>"
                }
              },
              {
                "_meta": {
                  "htmlID": "u_content_button_1",
                  "htmlClassNames": "u_content_button"
                },
                "type": "button",
                "values": {
                  "containerPadding": "10px",
                  "href_href": "https://your_calendar_link.com",
                  "href_target": "_blank",
                  "textAlign": "left",
                  "lineHeight": "120%",
                  "displayCondition": null,
                  "_meta": {
                    "htmlID": "u_content_button_1",
                    "htmlClassNames": "u_content_button"
                  },
                  "selectable": true,
                  "draggable": true,
                  "duplicatable": true,
                  "deletable": true,
                  "text": "<span style=\"font-size: 14px; line-height: 16.8px;\">Book a Time</span>",
                  "buttonColors": {
                    "color": "#FFFFFF",
                    "backgroundColor": "#3AAEE0",
                    "hoverColor": "#FFFFFF",
                    "hoverBackgroundColor": "#3AAEE0"
                  },
                  "size": {
                    "width": "auto",
                    "height": "auto"
                  },
                  "padding": "10px 20px",
                  "border": {
                    "borderWidth": "0px"
                  },
                  "borderRadius": "4px"
                }
              },
              {
                "_meta": {
                  "htmlID": "u_content_text_2",
                  "htmlClassNames": "u_content_text"
                },
                "type": "text",
                "values": {
                  "containerPadding": "20px",
                  "textAlign": "left",
                  "lineHeight": "140%",
                  "linkStyle": "none",
                  "displayCondition": null,
                  "_meta": {
                    "htmlID": "u_content_text_2",
                    "htmlClassNames": "u_content_text"
                  },
                  "selectable": true,
                  "draggable": true,
                  "duplicatable": true,
                  "deletable": true,
                  "text": "<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">Best,</span></p>\n<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 16px; line-height: 22.4px; font-family: Cabin, sans-serif;\">{{your_name}}</span></p>"
                }
              }
            ],
            "values": {}
          }
        ]
      }
    ],
    "values": {
      "backgroundColor": "#e7e7e7",
      "padding": "0px",
      "contentWidth": "600px",
      "fontFamily": {
        "label": "Cabin",
        "value": "Cabin, sans-serif"
      },
      "linkStyle": "none",
      "_meta": {
        "htmlID": "u_body",
        "htmlClassNames": "u_body"
      }
    }
  }
}
  },
  {
    name: "Welcome Email",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1586221040432-Welcome.png",
    design: {"counters": {
    "u_column": 2,
    "u_row": 3,
    "u_content_text": 3,
    "u_content_image": 1,
    "u_content_button": 1,
    "u_content_divider": 1
}, "body": {
    "rows": [{
                "cells": [1],
                "values": {
                    "backgroundColor": "#ffffff",
                    "columns": false,
                    "padding": "0px",
                    "border": {}
                },
                "columns": [{
                    "contents": [{
                        "_meta": {
                            "htmlID": "u_content_image_1",
                            "htmlClassNames": "u_content_image"
                        },
                        "type": "image",
                        "values": {
                            "containerPadding": "30px 10px 10px",
                            "src_url": "https://cdn.tools.unlayer.com/img/default-logotype.png",
                            "src_width": 170,
                            "src_maxWidth": "100%",
                            "href_href": "",
                            "href_target": "_blank",
                            "alt_text": "Logo",
                            "textAlign": "center",
                            "border": {},
                            "displayCondition": null,
                            "_meta": {
                                "htmlID": "u_content_image_1",
                                "htmlClassNames": "u_content_image"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true
                        }
                    }, {
                        "_meta": {
                            "htmlID": "u_content_text_1",
                            "htmlClassNames": "u_content_text"
                        },
                        "type": "text",
                        "values": {
                            "containerPadding": "10px",
                            "textAlign": "center",
                            "lineHeight": "140%",
                            "linkStyle": "none",
                            "displayCondition": null,
                            "_meta": {
                                "htmlID": "u_content_text_1",
                                "htmlClassNames": "u_content_text"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "text": "<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 28px; line-height: 39.2px;\"><strong><span style=\"line-height: 39.2px; font-family: Lora, serif; font-size: 28px;\">Welcome, {{first_name}}!</span></strong></span></p>"
                        }
                    }, {
                        "_meta": {
                            "htmlID": "u_content_text_2",
                            "htmlClassNames": "u_content_text"
                        },
                        "type": "text",
                        "values": {
                            "containerPadding": "10px 30px",
                            "textAlign": "center",
                            "lineHeight": "170%",
                            "linkStyle": "none",
                            "displayCondition": null,
                            "_meta": {
                                "htmlID": "u_content_text_2",
                                "htmlClassNames": "u_content_text"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "text": "<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\">We're so excited to have you on board. We're here to help you get started and make the most of your new account.</span></p>"
                        }
                    }, {
                        "_meta": {
                            "htmlID": "u_content_button_1",
                            "htmlClassNames": "u_content_button"
                        },
                        "type": "button",
                        "values": {
                            "containerPadding": "10px",
                            "href_href": "https://your_app_url.com/login",
                            "href_target": "_blank",
                            "textAlign": "center",
                            "lineHeight": "120%",
                            "displayCondition": null,
                            "_meta": {
                                "htmlID": "u_content_button_1",
                                "htmlClassNames": "u_content_button"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "text": "<span style=\"font-size: 14px; line-height: 16.8px;\">GET STARTED</span>",
                            "buttonColors": {
                                "color": "#FFFFFF",
                                "backgroundColor": "#e03e2d",
                                "hoverColor": "#FFFFFF",
                                "hoverBackgroundColor": "#e03e2d"
                            },
                            "size": {
                                "width": "auto",
                                "height": "auto"
                            },
                            "padding": "10px 20px",
                            "border": {
                                "borderWidth": "0px"
                            },
                            "borderRadius": "4px"
                        }
                    }, {
                        "_meta": {
                            "htmlID": "u_content_divider_1",
                            "htmlClassNames": "u_content_divider"
                        },
                        "type": "divider",
                        "values": {
                            "containerPadding": "30px 10px",
                            "divider": {
                                "width": "50%",
                                "borderWidth": "1px",
                                "borderStyle": "solid",
                                "borderColor": "#ced4d9",
                                "textAlign": "center"
                            },
                            "displayCondition": null,
                            "_meta": {
                                "htmlID": "u_content_divider_1",
                                "htmlClassNames": "u_content_divider"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true
                        }
                    }, {
                        "_meta": {
                            "htmlID": "u_content_text_3",
                            "htmlClassNames": "u_content_text"
                        },
                        "type": "text",
                        "values": {
                            "containerPadding": "10px 30px 30px",
                            "textAlign": "center",
                            "lineHeight": "170%",
                            "linkStyle": "none",
                            "displayCondition": null,
                            "_meta": {
                                "htmlID": "u_content_text_3",
                                "htmlClassNames": "u_content_text"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "text": "<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\">If you have any questions, just reply to this email. We're always happy to help!</span></p>\n<p style=\"font-size: 14px; line-height: 170%;\"><span style=\"font-size: 16px; line-height: 27.2px; font-family: Lato, sans-serif;\"><br />The {{your_company}} Team</span></p>"
                        }
                    }],
                    "values": {}
                }],
                "values": {
                    "backgroundColor": "#f9f9f9",
                    "padding": "0px",
                    "contentWidth": "600px",
                    "fontFamily": {
                        "label": "Lato",
                        "value": "Lato, sans-serif"
                    },
                    "linkStyle": "none",
                    "_meta": {
                        "htmlID": "u_body",
                        "htmlClassNames": "u_body"
                    }
                }
            }
  },
  {
    name: "Follow-Up Template",
    thumbnailUrl: "https://cdn.screenshots.unlayer.com/assets/1602058334812-Simple.png",
    design: {}
  }
];

// --- 6. CORE APP FUNCTIONS ---

async function loadUserTemplates() {
  const grid = document.querySelector('#your-templates .template-grid');
  // Check if grid element exists
  if (!grid) {
      console.error("User templates grid element not found.");
      return;
  }
  if (!currentUserId) {
    grid.innerHTML = `<p style="color: #ff8181;">Error: Not logged in.</p>`;
    return;
  }

  grid.innerHTML = '<p style="color: var(--text-secondary);">Loading templates...</p>'; // Loading indicator
  const templatesCollectionPath = `users/${currentUserId}/user_templates`;
  const q = query(collection(db, templatesCollectionPath), orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);
    grid.innerHTML = ''; // Clear loading indicator

    if (querySnapshot.empty) {
      grid.innerHTML = `<p style="color: var(--text-secondary);">No saved templates yet. Click "Create Template" to start!</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const template = doc.data();
      const templateId = doc.id;

      // Robust date handling
      let date = 'Date unknown';
      if (template.createdAt) {
        if (typeof template.createdAt.toDate === 'function') {
          date = template.createdAt.toDate().toLocaleDateString();
        } else if (template.createdAt.seconds) {
          date = new Date(template.createdAt.seconds * 1000).toLocaleDateString();
        } else {
          date = String(template.createdAt); // Fallback
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
        // Prevent click if template data is invalid
        if (!template.design) {
            console.error(`Template ${templateId} has invalid design data.`);
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

    card.addEventListener('click', () => {
       // Prevent click if template data is invalid
      if (!template.design) {
            console.error(`Library template "${template.name}" has invalid design data.`);
            alert("Error: Cannot load this library template, data is missing.");
            return;
        }
      console.log(`Loading library template: ${template.name}`);
      safeSetStorage('contactx_template_to_load', JSON.stringify(template.design));
      window.location.href = 'editor.html';
    });

    grid.appendChild(card);
  });
}

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
  if (userNameEl) userNameEl.textContent = user.displayName || user.email || 'User'; // Added fallback
  if (userEmailEl) userEmailEl.textContent = user.email || ''; // Handle missing email
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
      // Defer click slightly to ensure all elements are ready
      setTimeout(() => targetNavLink.click(), 0);
    }
  } else {
    // Fallback to dashboard
    setTimeout(() => document.querySelector('.nav-link[data-view="dashboard"]')?.click(), 0);
  }

  // Initial Sidebar Collapse Logic (slightly delayed)
  setTimeout(() => {
    document.querySelectorAll('.projects-header').forEach(header => {
        const key = header.getAttribute('data-toggle');
        const list = document.getElementById('projects-' + key);
        const chevron = document.getElementById('chevron-' + key);
        // Only collapse if it's currently expanded
        if (list && chevron && !list.classList.contains('collapsed')) {
             header.click(); // Simulate click to trigger animation
        }
    });
  }, 150); // Increased delay slightly
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
    // Use replace to prevent back button going to blank dashboard
    window.location.replace('login.html');
  }
});


// --- 8. EVENT LISTENERS ---
// Added checks to ensure elements exist before adding listeners

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
          // Reset styles immediately
          currentView.style.opacity = '';
          currentView.style.transform = '';
        }
      });
    }

    newView.classList.remove('hidden');
    // Ensure starting styles are set before animating
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
    // TODO: Pass actual lead data based on row.dataset.leadId or similar
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
    console.log("Logout button clicked"); // Debugging line
    try {
      await signOut(auth);
      safeRemoveStorage('contactx_user_uid');
      window.location.replace('login.html'); // Use replace
    } catch (error) {
      console.error("Sign out error:", error);
    }
  });
} else {
    console.warn("Logout button not found."); // Add warning if element is missing
}




