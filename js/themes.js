/* ============================================
   WebFlow AI — Theme Switching & Customization
   ============================================ */

const ThemeManager = {
  currentTheme: 'minimalist',
  themes: [
    { id: 'minimalist', name: 'Modern Minimalist' },
    { id: 'corporate', name: 'Corporate Pro' },
    { id: 'creative', name: 'Creative Portfolio' },
    { id: 'vibrant', name: 'Vibrant & Bold' },
    { id: 'luxury', name: 'Elegant Luxury' },
    { id: 'tech', name: 'Tech / SaaS' },
    { id: 'eco', name: 'Eco / Sustainable' },
    { id: 'dark', name: 'Dark Mode' },
    { id: 'retro', name: 'Retro / Vintage' },
    { id: 'playful', name: 'Playful / Startup' },
    { id: 'ind-heritage', name: 'Heritage Silk' },
    { id: 'ind-ayurveda', name: 'Ayurveda Wellness' },
    { id: 'ind-masala', name: 'Masala Bites' },
    { id: 'ind-tech', name: 'Tech Bengaluru' },
    { id: 'ind-jewellery', name: 'Bridal Jewellery' },
    { id: 'ind-clothes', name: 'Ethnic Boutique' },
    { id: 'ind-construction', name: 'Infra Builders' },
    { id: 'ind-dhaba', name: 'Indian Dhaba' },
    { id: 'ind-cafe', name: 'Cafe / Chai Shop' },
    { id: 'ind-finedining', name: 'Fine Dining' },
    { id: 'ind-localshop', name: 'Local Kirana Shop' },
    { id: 'ind-coaching', name: 'Coaching Classes' },
    { id: 'ind-school', name: 'Local School' },
    { id: 'ind-realestate', name: 'Real Estate / Properties' },
    { id: 'ind-gym', name: 'Fitness / Gym' },
    { id: 'ind-freelancer', name: 'Freelancer / Portfolio' }
  ],

  init() {
    this.currentTheme = AppState.builder.theme || 'minimalist';
    this.apply(this.currentTheme, false);
    if (AppState.builder.customColors) {
      const canvas = document.getElementById('canvas');
      Object.entries(AppState.builder.customColors).forEach(([key, val]) => {
        if (canvas) canvas.style.setProperty(key, val);
      });
    }
  },

  apply(themeId, resetCustomColors = true) {
    this.currentTheme = themeId;
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.setAttribute('data-theme', themeId);
      if (resetCustomColors) {
        canvas.style.removeProperty('--site-primary');
        canvas.style.removeProperty('--site-accent');
      }
    }
    AppState.builder.theme = themeId;
    if (resetCustomColors) AppState.builder.customColors = {};
    AppState.saveState();
    Utils.emit('theme:change', themeId);
  },

  setCustomColor(varName, color) {
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.style.setProperty(varName, color);
    AppState.builder.customColors = AppState.builder.customColors || {};
    AppState.builder.customColors[varName] = color;
    AppState.saveState();
  },

  renderSelector(container) {
    const colors = {
      minimalist: ['#fff','#f8f9fa','#2d3436','#0984e3'],
      corporate: ['#fff','#f5f6f8','#2c3e50','#2980b9'],
      creative: ['#fafafa','#fff','#111','#e84393'],
      vibrant: ['#fff','#fff5f7','#6c5ce7','#fd79a8'],
      luxury: ['#fdfcfa','#f7f4ef','#8b6914','#c9a84c'],
      tech: ['#f0f4ff','#fff','#0967d2','#2bb0ed'],
      eco: ['#f7faf5','#fff','#27ae60','#00b894'],
      dark: ['#0d1117','#161b22','#58a6ff','#7ee787'],
      retro: ['#fef9ef','#fff8e7','#c0392b','#d35400'],
      playful: ['#fff','#f0f7ff','#805ad5','#ed8936'],
      'ind-heritage': ['#fff9f0','#ffffff','#800000','#d4af37'],
      'ind-ayurveda': ['#f4f6f0','#ffffff','#4a5d23','#8b5a2b'],
      'ind-masala': ['#fff5eb','#ffffff','#e65100','#ffb300'],
      'ind-tech': ['#0b0c10','#1f2833','#45a29e','#66fcf1'],
      'ind-jewellery': ['#4a0e1e','#2a0811','#d4af37','#fdf1d6'],
      'ind-clothes': ['#fffbfb','#ffffff','#d84672','#ff9eb5'],
      'ind-construction': ['#f4f5f7','#ffffff','#2c3e50','#f39c12'],
      'ind-dhaba': ['#fffaf0','#ffffff','#d35400','#e67e22'],
      'ind-cafe': ['#fdf8f5','#ffffff','#5c4033','#8b5a2b'],
      'ind-finedining': ['#0a0a0a','#1a1a1a','#d4af37','#f9eed3'],
      'ind-localshop': ['#f0f4f8','#ffffff','#102a43','#fdb813'],
      'ind-coaching': ['#f1f5f9','#ffffff','#0f172a','#3b82f6'],
      'ind-school': ['#f0fdf6','#ffffff','#166534','#facc15'],
      'ind-realestate': ['#f8fafc','#ffffff','#1e3a8a','#e2e8f0'],
      'ind-gym': ['#171717','#262626','#ef4444','#dc2626'],
      'ind-freelancer': ['#f5f3ff','#ffffff','#6d28d9','#a78bfa']
    };

    container.innerHTML = `<div class="theme-selector">
      ${this.themes.map(t => {
        const c = colors[t.id];
        return `<div class="theme-thumb${this.currentTheme === t.id ? ' active' : ''}" data-theme="${t.id}" title="${t.name}">
          <div style="width:100%;height:100%;display:flex;flex-direction:column">
            <div style="height:25%;background:${c[1]};display:flex;align-items:center;padding:0 6px">
              <div style="width:8px;height:8px;border-radius:4px;background:${c[2]}"></div>
            </div>
            <div style="height:40%;background:${c[2]};display:flex;align-items:center;justify-content:center">
              <div style="width:40%;height:8px;border-radius:4px;background:${c[3]}"></div>
            </div>
            <div style="height:35%;background:${c[0]};display:flex;align-items:center;justify-content:center;gap:4px;padding:4px">
              <div style="width:28%;height:60%;border-radius:3px;background:${c[1]};border:1px solid ${c[2]}22"></div>
              <div style="width:28%;height:60%;border-radius:3px;background:${c[1]};border:1px solid ${c[2]}22"></div>
              <div style="width:28%;height:60%;border-radius:3px;background:${c[1]};border:1px solid ${c[2]}22"></div>
            </div>
          </div>
          <div class="theme-thumb-label">${t.name}</div>
        </div>`;
      }).join('')}
    </div>`;

    container.querySelectorAll('.theme-thumb').forEach(el => {
      el.addEventListener('click', () => {
        container.querySelectorAll('.theme-thumb').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        this.apply(el.dataset.theme);
        SoundManager.play('click');
        Utils.toast(`Theme: ${this.themes.find(t => t.id === el.dataset.theme).name}`, 'info');
      });
    });
  }
};
