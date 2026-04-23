/* ============================================
   WebFlow AI — App Initialization (Fixed)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Load persisted state
  AppState.loadState();
  
  // Init sound manager
  SoundManager.init();

  // Init Landing Page (will route to Onboarding/Builder based on auth)
  if (typeof Landing !== 'undefined') {
    Landing.init();
  } else {
    Onboarding.init();
  }

  // Init Panel Manager (resize, collapse, swap)
  PanelManager.init();

  // Sidebar tab switching
  document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      SoundManager.play('click');
      Builder.renderSidebar(tab.textContent.trim().toLowerCase());
    });
  });

  // Autosave every 30 seconds
  setInterval(() => {
    AppState.saveState();
  }, 30000);

  console.log('%c✦ WebFlow AI Loaded', 'color: #8257e5; font-size: 16px; font-weight: bold;');
});
