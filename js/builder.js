/* ============================================
   WebFlow AI — Drag & Drop Builder Engine (Fixed)
   ============================================ */

const Builder = {
  canvas: null,
  selectedId: null,
  undoManager: new UndoManager(50),
  dragData: null,
  activePageId: 'home',

  init() {
    this.canvas = document.getElementById('canvas');
    this.sidebar = document.querySelector('.sidebar-body');
    this.panelBody = document.querySelector('.panel-body');

    ThemeManager.init();
    PreviewManager.init();
    EffectsEngine.init();
    this.renderSidebar();
    this.setupCanvasDragDrop();
    this.setupKeyboard();
    this.setupToolbar();
    this.renderPanel();
    this.loadActivePage();
    this.setupDirectEditing();

    // Initialize pages if not already set
    if (!AppState.builder.pages || AppState.builder.pages.length === 0) {
      AppState.builder.pages = [{ id: 'home', name: 'Home', content: '' }];
    }

    // Search
    const search = document.querySelector('.sidebar-search');
    if (search) {
      search.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        this.sidebar.querySelectorAll('.component-item, .component-category, .page-item').forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }

    // Re-observe effects when canvas changes
    const mo = new MutationObserver(() => EffectsEngine.observeAll());
    mo.observe(this.canvas, { childList: true, subtree: true });

    // Listen for history changes to update undo/redo button states
    Utils.on('history:change', (state) => {
      const undoBtn = document.getElementById('btn-undo');
      const redoBtn = document.getElementById('btn-redo');
      if (undoBtn) undoBtn.style.opacity = state.canUndo ? '1' : '0.3';
      if (redoBtn) redoBtn.style.opacity = state.canRedo ? '1' : '0.3';
    });
  },

  /* ── Page Management ── */
  loadActivePage() {
    const pages = AppState.builder.pages || [{ id: 'home', name: 'Home', content: '' }];
    const page = pages.find(p => p.id === this.activePageId) || pages[0];
    if (page && page.content) {
      this.canvas.innerHTML = page.content;
      this.rebindCanvasComponents();
    } else {
      this.checkEmpty();
    }
  },

  saveCurrentPage() {
    if (!this.canvas) return;
    const pages = AppState.builder.pages || [{ id: 'home', name: 'Home', content: '' }];
    const idx = pages.findIndex(p => p.id === this.activePageId);
    if (idx !== -1) {
      pages[idx].content = this.canvas.innerHTML;
      AppState.builder.pages = pages;
      AppState.saveState();
    }
  },

  switchPage(pageId) {
    if (pageId === this.activePageId) return;
    this.saveCurrentPage();
    this.activePageId = pageId;
    this.loadActivePage();
    this.renderSidebar('pages');
    Utils.toast(`Switched to ${pageId}`, 'info');
    SoundManager.play('click');
  },

  /* ── Sidebar Rendering ── */
  renderSidebar(view = 'components') {
    this.sidebar = document.querySelector('.sidebar-body');
    if (!this.sidebar) return;

    if (view === 'pages') {
      this.renderPagesSidebar();
    } else {
      this.renderComponentsSidebar();
    }
  },

  renderComponentsSidebar() {
    const cats = ComponentRegistry.getByCategory();
    let html = '';
    Object.entries(cats).forEach(([cat, comps]) => {
      html += `<div class="component-category">
        <div class="component-category-title">${cat}</div>
        <div class="component-list">
          ${comps.map(c => `
            <div class="component-item" draggable="true" data-type="${c.id}">
              <div class="component-item-icon">${c.icon}</div>
              <div class="component-item-info">
                <div class="component-item-name">${c.name}</div>
                <div class="component-item-desc">Drag to add</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
    });
    this.sidebar.innerHTML = html;
    this.bindSidebarEvents();
  },

  renderPagesSidebar() {
    const pages = AppState.builder.pages || [{ id: 'home', name: 'Home' }];
    let html = `
      <div class="component-category">
        <div class="component-category-title">Site Pages</div>
        <div class="page-list" style="display:flex;flex-direction:column;gap:4px;padding:8px">
          ${pages.map(p => `
            <div class="page-item ${p.id === this.activePageId ? 'active' : ''}" data-page-id="${p.id}" 
              style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;background:${p.id === this.activePageId ? 'var(--accent-primary)' : 'var(--builder-surface-2)'};border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="display:flex">${p.id === 'home' ? Icons.get('home', 16) : Icons.get('about', 16)}</span>
                <span style="font-size:var(--text-sm);font-weight:500;color:${p.id === this.activePageId ? '#fff' : 'inherit'}">${p.name}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-add-page" style="width:calc(100% - 16px);margin:8px;display:flex;align-items:center;justify-content:center;gap:8px">
          ${Icons.get('plus', 14)} Add New Page
        </button>
      </div>`;
    this.sidebar.innerHTML = html;

    this.sidebar.querySelectorAll('.page-item').forEach(item => {
      item.addEventListener('click', () => this.switchPage(item.dataset.pageId));
    });

    const addBtn = this.sidebar.querySelector('#btn-add-page');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = prompt('Enter page name:');
        if (name) {
          const id = name.toLowerCase().replace(/\s+/g, '-');
          const pages = AppState.builder.pages || [];
          pages.push({ id, name, content: '' });
          AppState.builder.pages = pages;
          AppState.saveState();
          this.renderSidebar('pages');
          Utils.toast(`Page "${name}" created!`, 'success');
          SoundManager.play('success');
        }
      });
    }
  },

  bindSidebarEvents() {
    this.sidebar.querySelectorAll('.component-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.dragData = { type: item.dataset.type, source: 'sidebar' };
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', item.dataset.type);
        item.style.opacity = '0.5';
      });
      item.addEventListener('dragend', () => {
        item.style.opacity = '1';
        this.clearDropZones();
      });
      item.addEventListener('dblclick', () => {
        this.addComponent(item.dataset.type);
        SoundManager.play('drop');
      });
    });
  },

  /* ── Canvas Drag & Drop ── */
  setupCanvasDragDrop() {
    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.showDropZone(e);
    });
    this.canvas.addEventListener('dragleave', () => this.clearDropZones());
    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this.clearDropZones();
      if (this.dragData && this.dragData.source === 'sidebar') {
        this.addComponent(this.dragData.type, e);
        SoundManager.play('drop');
      }
      this.dragData = null;
    });
    this.canvas.addEventListener('click', (e) => {
      const comp = e.target.closest('.canvas-component');
      if (comp) {
        this.selectComponent(comp.dataset.id);
        SoundManager.play('click');
      } else {
        this.deselectAll();
      }
    });
  },

  showDropZone(e) {
    this.canvas.style.outline = '3px dashed var(--accent-primary)';
    this.canvas.style.outlineOffset = '-3px';
  },

  clearDropZones() {
    this.canvas.style.outline = 'none';
  },

  /* ── Direct Canvas Editing ── */
  setupDirectEditing() {
    this.canvas.addEventListener('focusin', (e) => {
      if (e.target.dataset.editable === 'text') {
        e.target.setAttribute('contenteditable', 'true');
      }
    });
    this.canvas.addEventListener('blur', (e) => {
      if (e.target.dataset.editable === 'text') {
        e.target.removeAttribute('contenteditable');
        this.saveSnapshot();
        this.saveCurrentPage();
      }
    }, true);
    this.canvas.addEventListener('keydown', (e) => {
      if (e.target.dataset.editable === 'text' && e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          e.target.blur();
        }
      }
    });
  },

  /* ── Component Management ── */
  addComponent(typeId, dropEvent) {
    const comp = ComponentRegistry.create(typeId);
    if (!comp) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-component';
    wrapper.dataset.id = comp.id;
    wrapper.dataset.type = comp.type;
    wrapper.dataset.componentName = comp.name;
    wrapper.innerHTML = comp.html + `
      <div class="component-actions">
        <button class="component-action-btn" data-action="duplicate" title="Duplicate">⧉</button>
        <button class="component-action-btn" data-action="moveup" title="Move Up">↑</button>
        <button class="component-action-btn" data-action="movedown" title="Move Down">↓</button>
        <button class="component-action-btn danger" data-action="delete" title="Delete">✕</button>
      </div>`;

    wrapper.querySelectorAll('.component-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleComponentAction(btn.dataset.action, comp.id);
      });
    });

    const empty = this.canvas.querySelector('.canvas-empty');
    if (empty) empty.remove();

    this.canvas.appendChild(wrapper);
    this.selectComponent(comp.id);
    this.saveSnapshot();
    this.saveCurrentPage();
  },

  handleComponentAction(action, id) {
    const el = this.canvas.querySelector(`[data-id="${id}"]`);
    if (!el) return;

    switch (action) {
      case 'delete':
        el.remove();
        this.deselectAll();
        SoundManager.play('delete');
        Utils.toast('Component removed', 'info');
        this.checkEmpty();
        break;
      case 'duplicate':
        const clone = el.cloneNode(true);
        const newId = Utils.uuid();
        clone.dataset.id = newId;
        clone.classList.remove('selected');
        el.after(clone);
        clone.querySelectorAll('.component-action-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleComponentAction(btn.dataset.action, newId);
          });
        });
        SoundManager.play('drop');
        Utils.toast('Component duplicated', 'success');
        break;
      case 'moveup':
        const prev = el.previousElementSibling;
        if (prev && prev.classList.contains('canvas-component')) {
          prev.before(el);
          SoundManager.play('click');
        }
        break;
      case 'movedown':
        const next = el.nextElementSibling;
        if (next && next.classList.contains('canvas-component')) {
          next.after(el);
          SoundManager.play('click');
        }
        break;
    }
    this.saveSnapshot();
    this.saveCurrentPage();
  },

  selectComponent(id) {
    this.deselectAll();
    const el = this.canvas.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.classList.add('selected');
      this.selectedId = id;
      this.renderPanel(el);
    }
  },

  deselectAll() {
    this.canvas.querySelectorAll('.canvas-component.selected').forEach(el => el.classList.remove('selected'));
    this.selectedId = null;
    this.renderPanel();
  },

  checkEmpty() {
    if (this.canvas.querySelectorAll('.canvas-component').length === 0) {
      this.canvas.innerHTML = `<div class="canvas-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
        <h3>Start Building</h3>
        <p>Drag components from the sidebar or double-click to add them to your website.</p>
      </div>`;
    }
  },

  /* ── Properties Panel ── */
  renderPanel(selectedEl) {
    if (!this.panelBody) return;

    if (!selectedEl) {
      // No component selected — show Theme + SEO tabs
      this.panelBody.innerHTML = `
        <div class="panel-tabs" style="margin: -16px -16px 16px -16px; border-bottom: 1px solid var(--builder-border)">
          <button class="panel-tab active" data-tab="site-theme">Theme</button>
          <button class="panel-tab" data-tab="site-seo">SEO</button>
        </div>
        <div id="tab-site-theme" class="tab-pane" style="display:block">
          <div class="panel-section">
            <div class="panel-section-title">Choose Theme</div>
            <div id="theme-selector-container"></div>
          </div>
        </div>
        <div id="tab-site-seo" class="tab-pane" style="display:none"></div>`;

      this._bindPanelTabs();

      // Render theme selector
      const themeContainer = this.panelBody.querySelector('#theme-selector-container');
      if (themeContainer) ThemeManager.renderSelector(themeContainer);

      // Render SEO panel
      const seoContainer = this.panelBody.querySelector('#tab-site-seo');
      if (seoContainer && typeof SEOManager !== 'undefined') SEOManager.renderPanel(seoContainer);
      return;
    }

    this.panelBody.innerHTML = `
      <div class="panel-tabs" style="margin: -16px -16px 16px -16px; border-bottom: 1px solid var(--builder-border)">
        <button class="panel-tab active" data-tab="content">Content</button>
        <button class="panel-tab" data-tab="media">Media</button>
        <button class="panel-tab" data-tab="effects">Effects</button>
        <button class="panel-tab" data-tab="style">Style</button>
        <button class="panel-tab" data-tab="sounds">Sounds</button>
        <button class="panel-tab" data-tab="comp-theme">Theme</button>
        <button class="panel-tab" data-tab="comp-seo">SEO</button>
      </div>
      <div id="tab-content" class="tab-pane active" style="display:block"></div>
      <div id="tab-media" class="tab-pane" style="display:none"></div>
      <div id="tab-effects" class="tab-pane" style="display:none"></div>
      <div id="tab-style" class="tab-pane" style="display:none"></div>
      <div id="tab-sounds" class="tab-pane" style="display:none"></div>
      <div id="tab-comp-theme" class="tab-pane" style="display:none">
        <div class="panel-section">
          <div class="panel-section-title">Choose Theme</div>
          <div id="theme-selector-container-comp"></div>
        </div>
      </div>
      <div id="tab-comp-seo" class="tab-pane" style="display:none"></div>`;

    this._bindPanelTabs();

    this.renderContentTab(this.panelBody.querySelector('#tab-content'), selectedEl);
    this.renderMediaTab(this.panelBody.querySelector('#tab-media'), selectedEl);
    EffectsEngine.renderPanel(this.panelBody.querySelector('#tab-effects'), selectedEl);
    this.renderStyleTab(this.panelBody.querySelector('#tab-style'), selectedEl);
    this.renderSoundTab(this.panelBody.querySelector('#tab-sounds'), selectedEl);

    // Theme selector inside component view
    const compThemeContainer = this.panelBody.querySelector('#theme-selector-container-comp');
    if (compThemeContainer) ThemeManager.renderSelector(compThemeContainer);

    // SEO panel inside component view
    const compSeoContainer = this.panelBody.querySelector('#tab-comp-seo');
    if (compSeoContainer && typeof SEOManager !== 'undefined') SEOManager.renderPanel(compSeoContainer);
  },

  _bindPanelTabs() {
    this.panelBody.querySelectorAll('.panel-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.panelBody.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
        this.panelBody.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        const pane = this.panelBody.querySelector(`#tab-${tab.dataset.tab}`);
        if (pane) pane.style.display = 'block';
        SoundManager.play('click');
      });
    });
  },

  /* ── Quick Access: Show Theme Panel ── */
  showThemePanel() {
    if (typeof PanelManager !== 'undefined') PanelManager.ensurePanelVisible();
    this.deselectAll();
    // After deselectAll, renderPanel is called with no args, showing Theme/SEO
    // Now activate the Theme tab
    setTimeout(() => {
      const themeTab = this.panelBody.querySelector('[data-tab="site-theme"]');
      if (themeTab) themeTab.click();
    }, 50);
  },

  /* ── Quick Access: Show SEO Panel ── */
  showSEOPanel() {
    if (typeof PanelManager !== 'undefined') PanelManager.ensurePanelVisible();
    this.deselectAll();
    setTimeout(() => {
      const seoTab = this.panelBody.querySelector('[data-tab="site-seo"]');
      if (seoTab) seoTab.click();
    }, 50);
  },

  renderContentTab(container, el) {
    const list = el.querySelector('[data-editable-list]');
    let html = '';

    if (list) {
      html += `<div class="panel-section">
        <div class="panel-section-title">Manage Items (${list.dataset.editableList})</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          <button class="btn btn-secondary btn-sm" id="btn-add-item" style="width:100%">+ Add New Item</button>
        </div>
        <div class="item-list" style="display:flex;flex-direction:column;gap:4px">
          ${Array.from(list.children).map((item, i) => `
            <div class="item-manager-row" style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:var(--builder-surface-2);border-radius:4px">
              <span style="font-size:11px;font-weight:600">Item #${i+1}</span>
              <div style="display:flex;gap:4px">
                <button class="btn-icon-tiny" data-item-action="delete" data-index="${i}">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
    }

    const editables = el.querySelectorAll('[data-editable="text"]');
    html += '<div class="panel-section"><div class="panel-section-title">Instant Text Edit</div><div style="display:flex;flex-direction:column;gap:8px">';
    
    editables.forEach((node, i) => {
      const text = node.textContent.trim();
      const tag = node.tagName.toLowerCase();
      html += `<div class="onboarding-form-group">
        <label class="label">${tag} text</label>
        <input class="input" data-edit-index="${i}" value="${text.replace(/"/g, '&quot;')}">
      </div>`;
    });
    html += '</div></div>';
    container.innerHTML = html;

    // Item Manager Events
    if (list) {
      const addItemBtn = container.querySelector('#btn-add-item');
      if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
          if (list.children.length > 0) {
            const clone = list.children[0].cloneNode(true);
            list.appendChild(clone);
            this.renderContentTab(container, el);
            this.saveSnapshot();
            SoundManager.play('drop');
          }
        });
      }
      container.querySelectorAll('[data-item-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (list.children.length > 1) {
            list.children[parseInt(btn.dataset.index)].remove();
            this.renderContentTab(container, el);
            this.saveSnapshot();
            SoundManager.play('delete');
          } else {
            Utils.toast('Must keep at least one item', 'error');
          }
        });
      });
    }

    // Text Input Events
    container.querySelectorAll('input[data-edit-index]').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.editIndex);
        if (editables[idx]) {
          editables[idx].textContent = input.value;
        }
      });
      input.addEventListener('change', () => {
        this.saveSnapshot();
        this.saveCurrentPage();
      });
    });
  },

  renderStyleTab(container, el) {
    const inner = el.querySelector('section, footer, nav') || el.children[0];
    if (!inner) return;
    let html = `<div class="panel-section">
      <div class="panel-section-title">Section Layout</div>
      <div class="onboarding-form-group">
        <label class="label">Vertical Spacing (Padding)</label>
        <input type="range" min="0" max="200" step="10" class="input-range" id="style-padding" value="${parseInt(getComputedStyle(inner).paddingTop) || 80}">
      </div>
      <div class="onboarding-form-group">
        <label class="label">Background Color</label>
        <input type="color" class="input" id="style-bg" style="height:40px;padding:4px;cursor:pointer" value="#ffffff">
      </div>
    </div>`;
    container.innerHTML = html;

    const padInput = container.querySelector('#style-padding');
    const bgInput = container.querySelector('#style-bg');

    if (padInput) {
      padInput.addEventListener('input', () => {
        inner.style.paddingTop = padInput.value + 'px';
        inner.style.paddingBottom = padInput.value + 'px';
      });
      padInput.addEventListener('change', () => this.saveSnapshot());
    }
    if (bgInput) {
      bgInput.addEventListener('input', () => {
        inner.style.background = bgInput.value;
      });
      bgInput.addEventListener('change', () => this.saveSnapshot());
    }
  },

  renderMediaTab(container, el) {
    const targets = el.querySelectorAll('.wf-media-target, img, video');
    let html = '<div class="panel-section"><div class="panel-section-title">Media Elements</div>';
    
    if (targets.length === 0) {
      html += '<p style="font-size:var(--text-xs);color:var(--builder-text-dim);padding:20px;text-align:center">No media elements found in this component.</p>';
    } else {
      targets.forEach((target, i) => {
        html += `<div class="onboarding-form-group">
          <label class="label">Element #${i+1} (${target.tagName})</label>
          <div class="media-upload-area" id="media-upload-${i}">
            <span class="upload-icon">📷</span>
            <span class="upload-text">Click to Upload Image/Video</span>
            <input type="file" style="display:none" accept="image/*,video/*">
          </div>
        </div>`;
      });
    }
    html += '</div>';
    container.innerHTML = html;

    targets.forEach((target, i) => {
      const area = container.querySelector(`#media-upload-${i}`);
      if (!area) return;
      const input = area.querySelector('input');
      area.addEventListener('click', () => input.click());
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target.result;
          if (file.type.startsWith('image/')) {
            if (target.tagName === 'IMG') target.src = result;
            else { target.style.backgroundImage = `url(${result})`; target.style.backgroundSize = 'cover'; target.style.backgroundPosition = 'center'; }
          } else if (file.type.startsWith('video/')) {
            target.innerHTML = `<video src="${result}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;z-index:0"></video>`;
          }
          this.saveSnapshot();
          SoundManager.play('success');
          Utils.toast('Media uploaded!', 'success');
        };
        reader.readAsDataURL(file);
      });
    });
  },

  renderSoundTab(container, el) {
    let html = '<div class="panel-section"><div class="panel-section-title">Interactive Audio</div><div class="sound-effects-panel">';
    html += `<div class="sound-effect-row"><div class="sound-effect-info"><span class="sound-effect-icon">🔊</span><span class="sound-effect-name">Hover Sound</span></div><button class="sound-effect-toggle ${el.dataset.soundHover ? 'active' : ''}" id="toggle-hover"></button></div>`;
    html += `<div class="sound-effect-row"><div class="sound-effect-info"><span class="sound-effect-icon">🖱️</span><span class="sound-effect-name">Click Sound</span></div><button class="sound-effect-toggle ${el.dataset.soundClick ? 'active' : ''}" id="toggle-click"></button></div>`;
    html += '</div></div>';
    container.innerHTML = html;

    const hoverToggle = container.querySelector('#toggle-hover');
    const clickToggle = container.querySelector('#toggle-click');
    
    if (hoverToggle) {
      hoverToggle.addEventListener('click', () => {
        hoverToggle.classList.toggle('active');
        el.dataset.soundHover = hoverToggle.classList.contains('active') ? 'hover' : '';
        SoundManager.play('click');
      });
    }
    if (clickToggle) {
      clickToggle.addEventListener('click', () => {
        clickToggle.classList.toggle('active');
        el.dataset.soundClick = clickToggle.classList.contains('active') ? 'success' : '';
        SoundManager.play('click');
      });
    }
  },

  autoGenerateTemplate() {
    this.addComponent('navbar');
    this.addComponent('hero');
    this.addComponent('features');
    this.addComponent('about');
    this.addComponent('pricing');
    this.addComponent('contact');
    this.addComponent('footer');
    this.deselectAll();
    this.saveCurrentPage();
    Utils.toast('Template generated!', 'success');
  },

  saveSnapshot() {
    this.undoManager.push(this.canvas.innerHTML);
  },

  undo() {
    const state = this.undoManager.undo();
    if (state !== null) { this.canvas.innerHTML = state; this.rebindCanvasComponents(); SoundManager.play('click'); }
  },

  redo() {
    const state = this.undoManager.redo();
    if (state !== null) { this.canvas.innerHTML = state; this.rebindCanvasComponents(); SoundManager.play('click'); }
  },

  rebindCanvasComponents() {
    this.canvas.querySelectorAll('.canvas-component').forEach(wrapper => {
      const id = wrapper.dataset.id;
      wrapper.querySelectorAll('.component-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); this.handleComponentAction(btn.dataset.action, id); });
      });
    });
    this.deselectAll();
  },

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); this.undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); this.redo(); }
      if (e.key === 'Delete' && this.selectedId) this.handleComponentAction('delete', this.selectedId);
      if (e.key === 'Escape') this.deselectAll();
    });
  },

  setupToolbar() {
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());
    document.getElementById('btn-preview')?.addEventListener('click', () => PreviewManager.openFullPreview());
    document.getElementById('btn-code')?.addEventListener('click', () => {
      this.saveCurrentPage();
      ExportManager.showCodeViewer();
    });
    document.getElementById('btn-export')?.addEventListener('click', () => {
      this.saveCurrentPage();
      ExportManager.downloadZip();
    });
    document.getElementById('btn-sound')?.addEventListener('click', () => {
      const enabled = SoundManager.toggle();
      document.getElementById('btn-sound').classList.toggle('muted', !enabled);
    });
    document.getElementById('btn-new')?.addEventListener('click', () => {
      if (confirm('Start over? This will clear your current design.')) { localStorage.clear(); location.reload(); }
    });

    // Quick-access Theme & SEO buttons (always visible in toolbar)
    document.getElementById('btn-theme-quick')?.addEventListener('click', () => {
      this.showThemePanel();
      SoundManager.play('click');
    });
    document.getElementById('btn-seo-quick')?.addEventListener('click', () => {
      this.showSEOPanel();
      SoundManager.play('click');
    });
  }
};
