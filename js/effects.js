/* ============================================
   WebFlow AI — Premium Visual Effects Engine
   ============================================ */

const EffectsEngine = {
  categories: {
    'Glass & Liquid': {
      icon: Icons.get('glass'),
      effects: [
        { id: 'fx-glass', name: 'Glassmorphism', desc: 'Frosted blur' },
        { id: 'fx-liquid-glass', name: 'Liquid Glass', desc: 'Distorted surface' },
      ]
    },
    'Premium 3D': {
      icon: Icons.get('3d'),
      effects: [
        { id: 'fx-3d-tilt', name: 'Mouse Perspective', desc: 'Dynamic 3D' },
        { id: 'fx-3d-depth', name: 'Layered Depth', desc: 'Floating elements' },
      ]
    },
    'Animations': {
      icon: Icons.get('scroll'),
      effects: [
        { id: 'fx-fade-in', name: 'Fade In', desc: 'Fade on scroll' },
        { id: 'fx-slide-up', name: 'Slide Up', desc: 'Slide on scroll' },
      ]
    },
    'Glow & Style': {
      icon: Icons.get('glow'),
      effects: [
        { id: 'fx-neon-glow', name: 'Neon Text', desc: 'Vibrant glow' },
        { id: 'fx-gradient-bg', name: 'Animated Gradient', desc: 'Moving background' },
      ]
    }
  },

  observer: null,
  scrollClasses: ['fx-fade-in', 'fx-slide-up', 'fx-scale-in'],

  init() {
    this.setupIntersectionObserver();
    this.setupMousePerspective();
    this.observeAll();
  },

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
  },

  setupMousePerspective() {
    document.addEventListener('mousemove', (e) => {
      const targets = document.querySelectorAll('.fx-3d-tilt');
      targets.forEach(el => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate tilt
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const tiltX = (y - centerY) / 10;
          const tiltY = (centerX - x) / 10;
          
          el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
          
          // Child depth layers
          const layers = el.querySelectorAll('.fx-depth-layer');
          layers.forEach((layer, i) => {
            const depth = (i + 1) * 20;
            layer.style.transform = `translateZ(${depth}px)`;
          });
        } else {
          el.style.transform = '';
          const layers = el.querySelectorAll('.fx-depth-layer');
          layers.forEach(layer => layer.style.transform = '');
        }
      });
    });
  },

  observeAll() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    this.scrollClasses.forEach(cls => {
      canvas.querySelectorAll('.' + cls).forEach(el => {
        el.classList.remove('visible');
        this.observer.observe(el);
      });
    });
  },

  applyEffect(el, fxId) {
    if (!el) return;
    el.classList.add(fxId);
    if (this.scrollClasses.includes(fxId)) this.observer.observe(el);
  },

  removeEffect(el, fxId) {
    if (!el) return;
    el.classList.remove(fxId, 'visible');
  },

  renderPanel(container, el) {
    if (!el) { container.innerHTML = '<div class="panel-empty"><p>Select a component</p></div>'; return; }
    
    let html = '';
    Object.entries(this.categories).forEach(([cat, data]) => {
      html += `<div class="effects-category">
        <div class="effects-category-title">
          <span class="effects-category-icon">${data.icon}</span>
          ${cat}
        </div>
        <div class="effects-list">`;
      data.effects.forEach(fx => {
        const active = el.classList.contains(fx.id);
        html += `<label class="fx-option ${active ? 'active' : ''}">
          <input type="checkbox" data-fx="${fx.id}" ${active ? 'checked' : ''}>
          <span>${fx.name}</span>
        </label>`;
      });
      html += '</div></div>';
    });
    container.innerHTML = html;

    container.querySelectorAll('input[data-fx]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) this.applyEffect(el, cb.dataset.fx);
        else this.removeEffect(el, cb.dataset.fx);
        SoundManager.play('click');
        this.renderPanel(container, el);
      });
    });
  }
};
