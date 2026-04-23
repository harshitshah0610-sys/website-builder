/* ============================================
   WebFlow AI — Utilities & State Management
   ============================================ */

const Utils = {
  // UUID generator
  uuid() {
    return 'wf-' + Math.random().toString(36).substr(2, 9);
  },

  // Debounce
  debounce(fn, ms = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  // Throttle
  throttle(fn, ms = 100) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(...args); }
    };
  },

  // Deep clone
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Save/Load from localStorage
  save(key, data) {
    try { localStorage.setItem('webflow_' + key, JSON.stringify(data)); } catch(e) {}
  },

  load(key, fallback = null) {
    try {
      const d = localStorage.getItem('webflow_' + key);
      return d ? JSON.parse(d) : fallback;
    } catch(e) { return fallback; }
  },

  // Simple event bus
  _events: {},
  on(event, fn) {
    (this._events[event] = this._events[event] || []).push(fn);
  },
  off(event, fn) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(f => f !== fn);
  },
  emit(event, ...args) {
    (this._events[event] || []).forEach(fn => fn(...args));
  },

  // Toast notifications
  toast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

/* ── Undo/Redo History ── */
class UndoManager {
  constructor(maxSteps = 50) {
    this.history = [];
    this.pointer = -1;
    this.maxSteps = maxSteps;
  }

  push(state) {
    // Remove any future states
    this.history = this.history.slice(0, this.pointer + 1);
    this.history.push(Utils.clone(state));
    if (this.history.length > this.maxSteps) {
      this.history.shift();
    } else {
      this.pointer++;
    }
    Utils.emit('history:change', { canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  undo() {
    if (!this.canUndo()) return null;
    this.pointer--;
    Utils.emit('history:change', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    return Utils.clone(this.history[this.pointer]);
  }

  redo() {
    if (!this.canRedo()) return null;
    this.pointer++;
    Utils.emit('history:change', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    return Utils.clone(this.history[this.pointer]);
  }

  canUndo() { return this.pointer > 0; }
  canRedo() { return this.pointer < this.history.length - 1; }
  current() { return this.pointer >= 0 ? Utils.clone(this.history[this.pointer]) : null; }
}

/* ── App State ── */
const AppState = {
  // Onboarding data
  onboarding: {
    businessName: '',
    businessType: '',
    industry: '',
    tagline: '',
    description: '',
    logo: null,
    colors: { primary: '#6c5ce7', secondary: '#a29bfe', accent: '#00cec9' },
    email: '',
    phone: '',
    address: '',
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
    theme: 'minimalist',
    effects: [],
    compliance: { privacyPolicy: true, terms: true, cookies: true, gdpr: false, ccpa: false }
  },

  // Builder state
  builder: {
    pages: [],
    components: [],
    selectedId: null,
    deviceMode: 'desktop', // desktop | tablet | mobile
    zoom: 100,
    theme: 'minimalist',
    soundEnabled: false
  },

  // Save full state
  saveState() {
    Utils.save('onboarding', this.onboarding);
    Utils.save('builder', this.builder);
  },

  // Load saved state
  loadState() {
    const ob = Utils.load('onboarding');
    const bu = Utils.load('builder');
    if (ob) Object.assign(this.onboarding, ob);
    if (bu) Object.assign(this.builder, bu);
  }
};
