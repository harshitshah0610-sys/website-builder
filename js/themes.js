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
    { id: 'playful', name: 'Playful / Startup' }
  ],

  init() {
    this.currentTheme = AppState.builder.theme || 'minimalist';
    this.apply(this.currentTheme);
  },

  apply(themeId) {
    this.currentTheme = themeId;
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.setAttribute('data-theme', themeId);
    AppState.builder.theme = themeId;
    AppState.saveState();
    Utils.emit('theme:change', themeId);
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
      playful: ['#fff','#f0f7ff','#805ad5','#ed8936']
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
