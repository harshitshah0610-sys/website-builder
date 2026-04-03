/* ============================================
   WebFlow AI — Panel Management System
   Swap, Resize, Minimize, Maximize
   ============================================ */

const PanelManager = {
  sidebar: null,
  panel: null,
  canvas: null,
  builderContent: null,
  minSidebarWidth: 200,
  maxSidebarWidth: 500,
  minPanelWidth: 240,
  maxPanelWidth: 600,

  // State
  sidebarCollapsed: false,
  panelCollapsed: false,
  sidebarMaximized: false,
  panelMaximized: false,
  swapped: false,
  sidebarWidth: null,
  panelWidth: null,

  init() {
    this.sidebar = document.getElementById('sidebar-panel') || document.querySelector('.sidebar');
    this.panel = document.getElementById('properties-panel') || document.querySelector('.properties-panel');
    this.canvas = document.querySelector('.canvas-wrapper');
    this.builderContent = document.querySelector('.builder-content');
    if (!this.sidebar || !this.panel || !this.builderContent) return;

    this.createResizeHandles();
    this.bindControlButtons();
    this.loadState();
    this.updateButtonStates();
  },

  /* ── Resize Handles ── */
  createResizeHandles() {
    // Remove any existing handles
    this.sidebar.querySelectorAll('.resize-handle').forEach(h => h.remove());
    this.panel.querySelectorAll('.resize-handle').forEach(h => h.remove());

    // Sidebar resize handle (right edge)
    const sidebarHandle = document.createElement('div');
    sidebarHandle.className = 'resize-handle resize-handle-sidebar';
    sidebarHandle.dataset.target = 'sidebar';
    this.sidebar.appendChild(sidebarHandle);

    // Panel resize handle (left edge)
    const panelHandle = document.createElement('div');
    panelHandle.className = 'resize-handle resize-handle-panel';
    panelHandle.dataset.target = 'panel';
    this.panel.appendChild(panelHandle);

    let activeHandle = null;
    let startX = 0;
    let startWidth = 0;

    const onMouseDown = (e) => {
      if (!e.target.classList.contains('resize-handle')) return;
      activeHandle = e.target.dataset.target;
      startX = e.clientX;
      startWidth = activeHandle === 'sidebar'
        ? this.sidebar.offsetWidth
        : this.panel.offsetWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.body.classList.add('resizing');
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!activeHandle) return;
      const dx = e.clientX - startX;

      if (activeHandle === 'sidebar') {
        const direction = this.swapped ? -1 : 1;
        const newWidth = Math.max(this.minSidebarWidth, Math.min(this.maxSidebarWidth, startWidth + dx * direction));
        this.sidebar.style.width = newWidth + 'px';
        this.sidebarWidth = newWidth;
      } else {
        const direction = this.swapped ? 1 : -1;
        const newWidth = Math.max(this.minPanelWidth, Math.min(this.maxPanelWidth, startWidth + dx * direction));
        this.panel.style.width = newWidth + 'px';
        this.panelWidth = newWidth;
      }
    };

    const onMouseUp = () => {
      if (activeHandle) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.classList.remove('resizing');
        this.saveState();
        activeHandle = null;
      }
    };

    sidebarHandle.addEventListener('mousedown', onMouseDown);
    panelHandle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  },

  /* ── Control Buttons (Swap, Min, Max) ── */
  bindControlButtons() {
    // Sidebar controls
    this.sidebar.querySelectorAll('.panel-ctrl-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'swap') this.swapPanels();
        else if (action === 'minimize') this.toggleSidebar();
        else if (action === 'maximize') this.toggleSidebarMaximize();
        SoundManager.play('click');
      });
    });

    // Properties panel controls
    this.panel.querySelectorAll('.panel-ctrl-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'swap') this.swapPanels();
        else if (action === 'minimize') this.togglePanel();
        else if (action === 'maximize') this.togglePanelMaximize();
        SoundManager.play('click');
      });
    });
  },

  /* ── Swap Panels ── */
  swapPanels() {
    this.swapped = !this.swapped;
    this.builderContent.classList.toggle('swapped', this.swapped);

    if (this.swapped) {
      // Move sidebar to end, panel to start
      this.builderContent.insertBefore(this.panel, this.builderContent.firstChild);
      this.builderContent.appendChild(this.sidebar);
      this.sidebar.classList.add('swapped-right');
      this.panel.classList.add('swapped-left');
    } else {
      // Restore original order
      this.builderContent.insertBefore(this.sidebar, this.builderContent.firstChild);
      this.builderContent.appendChild(this.panel);
      this.sidebar.classList.remove('swapped-right');
      this.panel.classList.remove('swapped-left');
    }

    // Recreate resize handles for correct direction
    this.createResizeHandles();
    this.bindControlButtons();
    this.updateButtonStates();
    this.saveState();
    Utils.toast(this.swapped ? 'Panels swapped' : 'Panels restored', 'info');
  },

  /* ── Minimize/Collapse ── */
  toggleSidebar() {
    if (this.sidebarMaximized) this.toggleSidebarMaximize();
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    this.updateButtonStates();
    this.saveState();
    Utils.toast(this.sidebarCollapsed ? 'Sidebar minimized' : 'Sidebar restored', 'info');
  },

  togglePanel() {
    if (this.panelMaximized) this.togglePanelMaximize();
    this.panelCollapsed = !this.panelCollapsed;
    this.panel.classList.toggle('collapsed', this.panelCollapsed);
    this.updateButtonStates();
    this.saveState();
    Utils.toast(this.panelCollapsed ? 'Properties minimized' : 'Properties restored', 'info');
  },

  /* ── Maximize ── */
  toggleSidebarMaximize() {
    if (this.sidebarCollapsed) this.toggleSidebar();
    this.sidebarMaximized = !this.sidebarMaximized;
    this.sidebar.classList.toggle('maximized', this.sidebarMaximized);
    // If maximizing, collapse the other panel
    if (this.sidebarMaximized && !this.panelCollapsed) {
      this.panelCollapsed = true;
      this.panel.classList.add('collapsed');
    } else if (!this.sidebarMaximized && this.panelCollapsed) {
      this.panelCollapsed = false;
      this.panel.classList.remove('collapsed');
    }
    this.updateButtonStates();
    this.saveState();
    Utils.toast(this.sidebarMaximized ? 'Sidebar maximized' : 'Sidebar normal', 'info');
  },

  togglePanelMaximize() {
    if (this.panelCollapsed) this.togglePanel();
    this.panelMaximized = !this.panelMaximized;
    this.panel.classList.toggle('maximized', this.panelMaximized);
    // If maximizing, collapse the other panel
    if (this.panelMaximized && !this.sidebarCollapsed) {
      this.sidebarCollapsed = true;
      this.sidebar.classList.add('collapsed');
    } else if (!this.panelMaximized && this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
      this.sidebar.classList.remove('collapsed');
    }
    this.updateButtonStates();
    this.saveState();
    Utils.toast(this.panelMaximized ? 'Properties maximized' : 'Properties normal', 'info');
  },

  /* ── Restore panel from collapsed (used by toolbar buttons) ── */
  ensurePanelVisible() {
    if (this.panelCollapsed) {
      this.panelCollapsed = false;
      this.panel.classList.remove('collapsed');
      this.updateButtonStates();
      this.saveState();
    }
    if (this.panelMaximized) {
      this.panelMaximized = false;
      this.panel.classList.remove('maximized');
      if (this.sidebarCollapsed) {
        this.sidebarCollapsed = false;
        this.sidebar.classList.remove('collapsed');
      }
      this.updateButtonStates();
      this.saveState();
    }
  },

  /* ── Update Visual States ── */
  updateButtonStates() {
    // Update minimize buttons to show restore icon when collapsed
    const sidebarMinBtn = this.sidebar.querySelector('[data-action="minimize"]');
    const panelMinBtn = this.panel.querySelector('[data-action="minimize"]');
    const sidebarMaxBtn = this.sidebar.querySelector('[data-action="maximize"]');
    const panelMaxBtn = this.panel.querySelector('[data-action="maximize"]');

    if (sidebarMinBtn) {
      sidebarMinBtn.classList.toggle('active', this.sidebarCollapsed);
      sidebarMinBtn.dataset.tooltip = this.sidebarCollapsed ? 'Restore' : 'Minimize';
    }
    if (panelMinBtn) {
      panelMinBtn.classList.toggle('active', this.panelCollapsed);
      panelMinBtn.dataset.tooltip = this.panelCollapsed ? 'Restore' : 'Minimize';
    }
    if (sidebarMaxBtn) {
      sidebarMaxBtn.classList.toggle('active', this.sidebarMaximized);
      sidebarMaxBtn.dataset.tooltip = this.sidebarMaximized ? 'Restore' : 'Maximize';
    }
    if (panelMaxBtn) {
      panelMaxBtn.classList.toggle('active', this.panelMaximized);
      panelMaxBtn.dataset.tooltip = this.panelMaximized ? 'Restore' : 'Maximize';
    }
  },

  /* ── Persistence ── */
  saveState() {
    Utils.save('panel_state_v2', {
      sidebarWidth: this.sidebarWidth,
      panelWidth: this.panelWidth,
      sidebarCollapsed: this.sidebarCollapsed,
      panelCollapsed: this.panelCollapsed,
      sidebarMaximized: this.sidebarMaximized,
      panelMaximized: this.panelMaximized,
      swapped: this.swapped,
    });
  },

  loadState() {
    const state = Utils.load('panel_state_v2', null);
    if (!state) return;

    if (state.sidebarWidth) {
      this.sidebar.style.width = state.sidebarWidth + 'px';
      this.sidebarWidth = state.sidebarWidth;
    }
    if (state.panelWidth) {
      this.panel.style.width = state.panelWidth + 'px';
      this.panelWidth = state.panelWidth;
    }
    if (state.swapped) {
      this.swapPanels();
    }
    if (state.sidebarCollapsed) {
      this.sidebarCollapsed = false; // toggleSidebar will flip it
      this.toggleSidebar();
    }
    if (state.panelCollapsed) {
      this.panelCollapsed = false;
      this.togglePanel();
    }
    if (state.sidebarMaximized) {
      this.sidebarMaximized = false;
      this.toggleSidebarMaximize();
    }
    if (state.panelMaximized) {
      this.panelMaximized = false;
      this.togglePanelMaximize();
    }
  }
};
