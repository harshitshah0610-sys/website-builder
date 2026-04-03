/* ============================================
   WebFlow AI — Export / Download Manager (v2)
   With SEO, Code Viewer, Backend & Deploy
   ============================================ */

const ExportManager = {
  generateHTML(pageId) {
    const canvas = document.getElementById('canvas');
    const theme = AppState.builder.theme || 'minimalist';
    const d = AppState.onboarding;
    const components = canvas ? canvas.innerHTML : '';
    const seoData = (typeof SEOManager !== 'undefined') ? SEOManager.getData() : {};

    // Clean builder-specific attributes
    let cleanHTML = components
      .replace(/\s*data-component-name="[^"]*"/g, '')
      .replace(/\s*data-editable-list="[^"]*"/g, '')
      .replace(/\s*data-editable-item="[^"]*"/g, '')
      .replace(/\s*data-editable="[^"]*"/g, '')
      .replace(/\s*data-editable-section="[^"]*"/g, '')
      .replace(/\s*contenteditable="[^"]*"/g, '')
      .replace(/\s*data-id="[^"]*"/g, '')
      .replace(/\s*data-type="[^"]*"/g, '');
    
    // Remove component action buttons
    cleanHTML = cleanHTML.replace(/<div class="component-actions">[\s\S]*?<\/button>\s*<\/div>/g, '');
    
    // Clean builder classes
    cleanHTML = cleanHTML.replace(/\s*class="([^"]*)"/g, (match, classes) => {
      const cleaned = classes
        .replace(/\b(selected|canvas-component|visible)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return cleaned ? ` class="${cleaned}"` : '';
    });

    // Remove empty wrappers
    cleanHTML = cleanHTML.replace(/<div\s*>\s*(<(?:nav|section|footer|header|div class="wf-))/g, '$1');

    // SEO Meta Tags
    const seoMeta = (typeof SEOManager !== 'undefined') ? SEOManager.generateMetaTags() : 
      `  <title>${d.businessName || 'My Website'}</title>\n  <meta name="description" content="${d.description || ''}">\n`;

    return `<!DOCTYPE html>
<html lang="${seoData.language || 'en'}" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoMeta}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
${this.getThemeCSS(theme)}
${this.getComponentCSS()}
${this.getEffectsCSS()}
  </style>
</head>
<body>
  ${cleanHTML}
  ${d.compliance && d.compliance.cookies ? ComplianceGenerator.cookieBanner() : ''}
  <script>${this.getSiteScript()}<\/script>
</body>
</html>`;
  },

  getSiteScript() {
    return `
    document.addEventListener('DOMContentLoaded', function() {
      // ── MOUSE PERSPECTIVE (3D) ──
      document.addEventListener('mousemove', function(e) {
        var targets = document.querySelectorAll('.fx-3d-tilt');
        targets.forEach(function(el) {
          var rect = el.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;
          if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
            var cx = rect.width / 2; var cy = rect.height / 2;
            var tx = (y - cy) / 10; var ty = (cx - x) / 10;
            el.style.transform = "perspective(1000px) rotateX(" + tx + "deg) rotateY(" + ty + "deg) scale3d(1.05, 1.05, 1.05)";
            el.querySelectorAll('.fx-depth-layer').forEach(function(l, i) { l.style.transform = "translateZ(" + ((i+1)*20) + "px)"; });
          } else {
            el.style.transform = "";
            el.querySelectorAll('.fx-depth-layer').forEach(function(l) { l.style.transform = ""; });
          }
        });
      });

      // ── SCROLL ANIMATIONS ──
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) { if(e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.15 });
      ['fx-fade-in','fx-slide-up','fx-scale-in'].forEach(function(c) {
        document.querySelectorAll('.' + c).forEach(function(el) { obs.observe(el); });
      });

      // ── SOUND ENGINE ──
      var SoundLite = {
        ctx: null,
        play: function(type) {
          if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; } }
          var osc = this.ctx.createOscillator(); var gain = this.ctx.createGain();
          osc.connect(gain); gain.connect(this.ctx.destination);
          var now = this.ctx.currentTime;
          if (type === 'click') { osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.1); osc.start(); osc.stop(now + 0.1); }
          else if (type === 'success') { osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(); osc.stop(now + 0.2); }
        }
      };
      document.addEventListener('mouseover', function(e) { var el = e.target.closest('[data-sound-hover]'); if (el) SoundLite.play('click'); });
      document.addEventListener('click', function(e) { var el = e.target.closest('[data-sound-click]'); if (el) SoundLite.play(el.dataset.soundClick || 'click'); });

      // ── FORM BACKEND (Formspree / Netlify / Fallback) ──
      document.querySelectorAll('.wf-form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var status = form.querySelector('.wf-form-status');
          var btn = form.querySelector('button[type="submit"]');
          if (!status || !btn) return;
          var original = btn.textContent;
          btn.disabled = true; btn.textContent = 'Sending...';

          // Collect form data
          var formData = new FormData(form);
          var action = form.getAttribute('action');

          if (action && action.startsWith('http')) {
            // Real backend endpoint (Formspree, Netlify, custom)
            fetch(action, {
              method: 'POST',
              body: formData,
              headers: { 'Accept': 'application/json' }
            }).then(function(r) {
              if (r.ok) {
                status.style.display = 'block';
                status.innerHTML = '✅ Message sent successfully!';
                status.style.background = 'rgba(34,197,94,0.1)';
                status.style.color = '#22c55e';
                status.style.border = '1px solid #22c55e';
                form.reset();
                SoundLite.play('success');
              } else {
                throw new Error('Server error');
              }
            }).catch(function() {
              status.style.display = 'block';
              status.innerHTML = '❌ Failed to send. Please try again.';
              status.style.background = 'rgba(239,68,68,0.1)';
              status.style.color = '#ef4444';
              status.style.border = '1px solid #ef4444';
            }).finally(function() {
              btn.disabled = false; btn.textContent = original;
              setTimeout(function() { status.style.display = 'none'; }, 6000);
            });
          } else {
            // Fallback demo mode
            setTimeout(function() {
              status.style.display = 'block';
              status.innerHTML = '✅ Message sent successfully!';
              status.style.background = 'rgba(34,197,94,0.1)';
              status.style.color = '#22c55e';
              status.style.border = '1px solid #22c55e';
              form.reset(); btn.disabled = false; btn.textContent = original;
              SoundLite.play('success');
              setTimeout(function() { status.style.display = 'none'; }, 6000);
            }, 1500);
          }
        });
      });

      // ── SMOOTH SCROLL NAV ──
      document.querySelectorAll('a[href^="#"]').forEach(function(a) {
        a.addEventListener('click', function(e) {
          var target = document.querySelector(a.getAttribute('href'));
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
      });

      // ── MOBILE NAV TOGGLE ──
      var burger = document.querySelector('.wf-navbar-burger');
      var links = document.querySelector('.wf-navbar-links');
      if (burger && links) {
        burger.addEventListener('click', function() {
          links.classList.toggle('active');
          burger.classList.toggle('active');
        });
      }
    });`;
  },

  getThemeCSS(theme) {
    const themeEl = document.createElement('div');
    themeEl.setAttribute('data-theme', theme);
    document.body.appendChild(themeEl);
    const styles = getComputedStyle(themeEl);
    const vars = ['site-bg','site-surface','site-text','site-text-muted','site-heading','site-primary','site-primary-rgb','site-secondary','site-accent','site-accent-rgb','site-border','site-radius','site-radius-lg','site-shadow','site-shadow-lg','site-font-body','site-font-heading','site-nav-bg','site-nav-text','site-hero-bg','site-footer-bg','site-footer-text','site-btn-radius'];
    let css = `[data-theme="${theme}"] {\n`;
    vars.forEach(v => { const val = styles.getPropertyValue('--' + v).trim(); if (val) css += `  --${v}: ${val};\n`; });
    css += '}\n';
    document.body.removeChild(themeEl);
    css += `* { box-sizing: border-box; margin: 0; padding: 0; } html { scroll-behavior: smooth; } body { font-family: var(--site-font-body, 'Inter', sans-serif); color: var(--site-text); background: var(--site-bg); line-height: 1.6; } img, video { max-width: 100%; display: block; } a { color: inherit; text-decoration: none; } ul { list-style: none; } button, input, textarea, select { font-family: inherit; border: none; outline: none; background: none; }`;
    return css;
  },

  getComponentCSS() {
    const sheet = Array.from(document.styleSheets).find(s => s.href && s.href.includes('components.css'));
    if (!sheet) return '';
    try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); } catch(e) { return '/* Component styles */'; }
  },

  getEffectsCSS() {
    const sheet = Array.from(document.styleSheets).find(s => s.href && s.href.includes('effects.css'));
    if (!sheet) return '';
    try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); } catch(e) { return '/* Effects styles */'; }
  },

  /* ── View Code Modal ── */
  showCodeViewer() {
    Builder.saveCurrentPage();
    const html = this.generateHTML();
    const formatted = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const overlay = document.createElement('div');
    overlay.id = 'code-viewer-overlay';
    overlay.innerHTML = `
      <div class="code-viewer-modal">
        <div class="code-viewer-header">
          <div class="code-viewer-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span>Source Code</span>
          </div>
          <div class="code-viewer-actions">
            <button class="btn btn-secondary btn-sm" id="code-copy-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy Code
            </button>
            <button class="btn btn-ghost btn-sm" id="code-close-btn">✕</button>
          </div>
        </div>
        <div class="code-viewer-body">
          <pre class="code-viewer-pre"><code>${formatted}</code></pre>
        </div>
        <div class="code-viewer-footer">
          <span class="code-viewer-info">${html.length.toLocaleString()} characters · HTML5 · Ready to deploy</span>
        </div>
      </div>`;
    
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    overlay.querySelector('#code-close-btn').onclick = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
      }
    });

    overlay.querySelector('#code-copy-btn').onclick = () => {
      navigator.clipboard.writeText(html).then(() => {
        Utils.toast('Code copied to clipboard!', 'success');
        SoundManager.play('success');
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = html; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        ta.remove();
        Utils.toast('Code copied!', 'success');
      });
    };

    // ESC to close
    const esc = (e) => { if (e.key === 'Escape') { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
  },

  /* ── Download ZIP ── */
  async downloadZip() {
    Utils.toast('Generating production site...', 'info');
    if (typeof JSZip === 'undefined') {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
      });
    }

    const zip = new JSZip();
    const d = AppState.onboarding;
    const seoData = (typeof SEOManager !== 'undefined') ? SEOManager.getData() : {};

    // Save current page first
    Builder.saveCurrentPage();

    // Export all pages
    const pages = AppState.builder.pages || [{ id: 'home', name: 'Home' }];
    const originalPageId = Builder.activePageId;

    for (const page of pages) {
      Builder.activePageId = page.id;
      Builder.loadActivePage();
      const html = this.generateHTML(page.id);
      zip.file(page.id === 'home' ? 'index.html' : `${page.id}.html`, html);
    }

    Builder.activePageId = originalPageId;
    Builder.loadActivePage();

    // Compliance pages
    if (d.compliance && d.compliance.privacyPolicy) zip.file('privacy-policy.html', this.wrapPage('Privacy Policy', ComplianceGenerator.generate('privacy')));
    if (d.compliance && d.compliance.terms) zip.file('terms-of-service.html', this.wrapPage('Terms of Service', ComplianceGenerator.generate('terms')));

    // SEO files
    if (typeof SEOManager !== 'undefined') {
      if (seoData.sitemap) {
        zip.file('sitemap.xml', SEOManager.generateSitemap(seoData.canonicalUrl));
      }
      zip.file('robots.txt', SEOManager.generateRobotsTxt(seoData.canonicalUrl));
    }

    // Netlify config (for easy deployment)
    zip.file('netlify.toml', `[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"]}
`);

    // Vercel config
    zip.file('vercel.json', JSON.stringify({
      "cleanUrls": true,
      "headers": [
        { "source": "/(.*)", "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
        ]}
      ]
    }, null, 2));

    // Package.json for npm deploy
    zip.file('package.json', JSON.stringify({
      "name": (d.businessName || 'my-website').toLowerCase().replace(/\s+/g, '-'),
      "version": "1.0.0",
      "description": d.description || "Website built with WebFlow AI",
      "scripts": {
        "start": "npx serve .",
        "dev": "npx live-server --port=3000",
        "deploy:netlify": "npx netlify deploy --prod --dir=.",
        "deploy:vercel": "npx vercel --prod"
      },
      "keywords": seoData.keywords || [],
      "author": seoData.author || d.businessName || "",
      "license": "MIT"
    }, null, 2));

    // README with deployment instructions
    zip.file('README.md', this.generateReadme(d, seoData));

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${(d.businessName || 'website').toLowerCase().replace(/\s+/g, '-')}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    SoundManager.play('success');
    Utils.toast('Website downloaded successfully!', 'success');
  },

  generateReadme(d, seoData) {
    return `# ${d.businessName || 'My Website'}

> ${d.description || 'Built with WebFlow AI'}

## 🚀 Quick Deploy

### Option 1: Netlify (Recommended — Free)
1. Go to [netlify.com](https://app.netlify.com/drop)
2. Drag and drop this entire folder
3. Your site is live! Add your custom domain in Site Settings.

### Option 2: Vercel (Free)
1. Install Vercel CLI: \`npm i -g vercel\`
2. Run: \`vercel --prod\`
3. Follow prompts to deploy.

### Option 3: GitHub Pages (Free)
1. Create a new repo on GitHub
2. Push these files to the repo
3. Go to Settings → Pages → Deploy from main branch

### Option 4: Any Static Host
Upload all files to your hosting provider (GoDaddy, Hostinger, etc.)

## 📧 Contact Form Setup

The contact form works in demo mode by default. To receive real submissions:

### Free Option: Formspree
1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and copy your endpoint URL
3. In \`index.html\`, find the \`<form class="wf-form">\` tag
4. Add: \`action="https://formspree.io/f/YOUR_ID" method="POST"\`

### Free Option: Netlify Forms
If hosting on Netlify, just add \`netlify\` attribute to your form:
\`<form class="wf-form" netlify>\`

## 🌐 Custom Domain

1. Buy a domain from Namecheap, GoDaddy, or Google Domains
2. In your hosting dashboard (Netlify/Vercel), go to Domain Settings
3. Add your custom domain and update DNS records as instructed

## 📁 File Structure
\`\`\`
├── index.html          # Main homepage
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Search engine directives
├── privacy-policy.html # Privacy policy
├── terms-of-service.html # Terms of service
├── netlify.toml        # Netlify config
├── vercel.json         # Vercel config
├── package.json        # npm scripts
└── README.md           # This file
\`\`\`

## 🔍 SEO
${seoData.keywords && seoData.keywords.length > 0 ? '- **Keywords**: ' + seoData.keywords.join(', ') : '- Configure keywords in the builder SEO panel'}
- **Sitemap**: \`sitemap.xml\` included
- **Robots.txt**: Configured for search engines
- **Structured Data**: JSON-LD schema included
- **Open Graph**: Social sharing meta tags included

## ⚡ Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`
Opens at http://localhost:3000

---
*Generated with [WebFlow AI](https://webflow-ai.com) — Build beautiful websites in minutes.*
`;
  },

  wrapPage(title, content) {
    const theme = AppState.builder.theme || 'minimalist';
    return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${AppState.onboarding.businessName || 'My Website'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@500;700&display=swap" rel="stylesheet">
  <style>${this.getThemeCSS(theme)}\n${this.getComponentCSS()}</style>
</head>
<body>${content}</body>
</html>`;
  }
};
