/* ============================================
   WebFlow AI — SEO Manager & Optimizer
   ============================================ */

const SEOManager = {
  defaults: {
    pageTitle: '',
    metaDescription: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'website',
    canonicalUrl: '',
    robots: 'index, follow',
    language: 'en',
    author: '',
    favicon: '',
    structuredData: true,
    sitemap: true,
    googleAnalytics: '',
    twitterCard: 'summary_large_image',
    twitterHandle: '',
  },

  getData() {
    const saved = Utils.load('seo_data', null);
    return saved ? { ...this.defaults, ...saved } : { ...this.defaults };
  },

  saveData(data) {
    Utils.save('seo_data', data);
  },

  updateField(key, value) {
    const data = this.getData();
    data[key] = value;
    this.saveData(data);
  },

  addKeyword(keyword) {
    const data = this.getData();
    const kw = keyword.trim().toLowerCase();
    if (kw && !data.keywords.includes(kw)) {
      data.keywords.push(kw);
      this.saveData(data);
    }
    return data.keywords;
  },

  removeKeyword(keyword) {
    const data = this.getData();
    data.keywords = data.keywords.filter(k => k !== keyword);
    this.saveData(data);
    return data.keywords;
  },

  /* ── SEO Score Calculator ── */
  calculateScore() {
    const data = this.getData();
    const d = AppState.onboarding;
    const canvas = document.getElementById('canvas');
    let score = 0;
    const checks = [];

    // Title (0-15)
    const title = data.pageTitle || d.businessName || '';
    if (title.length > 0) {
      score += 5;
      checks.push({ label: 'Page title set', pass: true });
      if (title.length >= 30 && title.length <= 60) {
        score += 10;
        checks.push({ label: 'Title length optimal (30-60 chars)', pass: true });
      } else {
        score += 3;
        checks.push({ label: `Title length: ${title.length} chars (aim for 30-60)`, pass: false });
      }
    } else {
      checks.push({ label: 'Page title missing', pass: false });
    }

    // Meta Description (0-15)
    const desc = data.metaDescription || d.description || '';
    if (desc.length > 0) {
      score += 5;
      checks.push({ label: 'Meta description set', pass: true });
      if (desc.length >= 120 && desc.length <= 160) {
        score += 10;
        checks.push({ label: 'Description length optimal (120-160 chars)', pass: true });
      } else {
        score += 3;
        checks.push({ label: `Description: ${desc.length} chars (aim for 120-160)`, pass: false });
      }
    } else {
      checks.push({ label: 'Meta description missing', pass: false });
    }

    // Keywords (0-15)
    if (data.keywords.length > 0) {
      score += 10;
      checks.push({ label: `${data.keywords.length} keyword(s) defined`, pass: true });
      if (data.keywords.length >= 3 && data.keywords.length <= 10) {
        score += 5;
        checks.push({ label: 'Keyword count is optimal (3-10)', pass: true });
      } else {
        checks.push({ label: 'Aim for 3-10 focused keywords', pass: false });
      }
    } else {
      checks.push({ label: 'No keywords defined', pass: false });
    }

    // Open Graph (0-10)
    if (data.ogTitle || data.pageTitle) {
      score += 5;
      checks.push({ label: 'Open Graph title set', pass: true });
    } else {
      checks.push({ label: 'Open Graph title missing', pass: false });
    }
    if (data.ogDescription || data.metaDescription) {
      score += 5;
      checks.push({ label: 'Open Graph description set', pass: true });
    } else {
      checks.push({ label: 'Open Graph description missing', pass: false });
    }

    // Content checks (0-20)
    if (canvas) {
      const h1s = canvas.querySelectorAll('h1');
      if (h1s.length === 1) {
        score += 10;
        checks.push({ label: 'Single H1 heading found', pass: true });
      } else if (h1s.length > 1) {
        score += 3;
        checks.push({ label: `${h1s.length} H1 headings found (use only 1)`, pass: false });
      } else {
        checks.push({ label: 'No H1 heading found', pass: false });
      }

      const imgs = canvas.querySelectorAll('img');
      const imgsWithAlt = Array.from(imgs).filter(i => i.alt && i.alt.length > 0);
      if (imgs.length === 0 || imgsWithAlt.length === imgs.length) {
        score += 5;
        checks.push({ label: 'All images have alt text', pass: true });
      } else {
        checks.push({ label: `${imgs.length - imgsWithAlt.length} images missing alt text`, pass: false });
      }

      const links = canvas.querySelectorAll('a[href]');
      if (links.length > 0) {
        score += 5;
        checks.push({ label: `${links.length} internal links found`, pass: true });
      }
    }

    // Structured Data (0-5)
    if (data.structuredData) {
      score += 5;
      checks.push({ label: 'Structured data (JSON-LD) enabled', pass: true });
    } else {
      checks.push({ label: 'Structured data disabled', pass: false });
    }

    // Canonical URL (0-5)
    if (data.canonicalUrl) {
      score += 5;
      checks.push({ label: 'Canonical URL set', pass: true });
    } else {
      checks.push({ label: 'Canonical URL not set', pass: false });
    }

    // Author (0-5)
    if (data.author || d.businessName) {
      score += 5;
      checks.push({ label: 'Author/brand defined', pass: true });
    } else {
      checks.push({ label: 'Author not set', pass: false });
    }

    // Analytics (0-5)
    if (data.googleAnalytics) {
      score += 5;
      checks.push({ label: 'Google Analytics configured', pass: true });
    } else {
      checks.push({ label: 'No analytics tracking', pass: false });
    }

    return { score: Math.min(score, 100), checks };
  },

  /* ── Generate SEO Meta Tags for Export ── */
  generateMetaTags() {
    const data = this.getData();
    const d = AppState.onboarding;
    const title = data.pageTitle || d.businessName || 'My Website';
    const description = data.metaDescription || d.description || '';
    const keywords = data.keywords.join(', ');
    const ogTitle = data.ogTitle || title;
    const ogDesc = data.ogDescription || description;
    const author = data.author || d.businessName || '';

    let tags = '';

    // Core Meta
    tags += `  <title>${title}</title>\n`;
    if (description) tags += `  <meta name="description" content="${description}">\n`;
    if (keywords) tags += `  <meta name="keywords" content="${keywords}">\n`;
    if (author) tags += `  <meta name="author" content="${author}">\n`;
    tags += `  <meta name="robots" content="${data.robots}">\n`;
    if (data.language) tags += `  <meta http-equiv="content-language" content="${data.language}">\n`;

    // Canonical
    if (data.canonicalUrl) tags += `  <link rel="canonical" href="${data.canonicalUrl}">\n`;

    // Open Graph
    tags += `  <meta property="og:type" content="${data.ogType}">\n`;
    tags += `  <meta property="og:title" content="${ogTitle}">\n`;
    if (ogDesc) tags += `  <meta property="og:description" content="${ogDesc}">\n`;
    if (data.ogImage) tags += `  <meta property="og:image" content="${data.ogImage}">\n`;
    if (data.canonicalUrl) tags += `  <meta property="og:url" content="${data.canonicalUrl}">\n`;

    // Twitter Card
    tags += `  <meta name="twitter:card" content="${data.twitterCard}">\n`;
    tags += `  <meta name="twitter:title" content="${ogTitle}">\n`;
    if (ogDesc) tags += `  <meta name="twitter:description" content="${ogDesc}">\n`;
    if (data.ogImage) tags += `  <meta name="twitter:image" content="${data.ogImage}">\n`;
    if (data.twitterHandle) tags += `  <meta name="twitter:site" content="${data.twitterHandle}">\n`;

    // Structured Data (JSON-LD)
    if (data.structuredData) {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": d.businessType === 'business' ? "Organization" : d.businessType === 'portfolio' ? "Person" : "WebSite",
        "name": title,
        "description": description,
      };
      if (data.canonicalUrl) jsonLd.url = data.canonicalUrl;
      if (data.ogImage) jsonLd.image = data.ogImage;
      if (d.email) jsonLd.email = d.email;

      tags += `  <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}<\/script>\n`;
    }

    // Google Analytics
    if (data.googleAnalytics) {
      tags += `  <script async src="https://www.googletagmanager.com/gtag/js?id=${data.googleAnalytics}"><\/script>\n`;
      tags += `  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${data.googleAnalytics}');<\/script>\n`;
    }

    return tags;
  },

  /* ── Generate Sitemap XML ── */
  generateSitemap(baseUrl) {
    const pages = AppState.builder.pages || [{ id: 'home', name: 'Home' }];
    const url = baseUrl || 'https://example.com';
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach(page => {
      const loc = page.id === 'home' ? url : `${url}/${page.id}.html`;
      xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${page.id === 'home' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  },

  /* ── Generate robots.txt ── */
  generateRobotsTxt(baseUrl) {
    const url = baseUrl || 'https://example.com';
    return `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`;
  },

  /* ── Smart SEO Suggestions Engine ── */
  generateSuggestions() {
    const d = AppState.onboarding;
    const data = this.getData();
    const suggestions = [];
    const name = d.businessName || '';
    const desc = d.description || '';
    const tagline = d.tagline || '';
    const type = d.businessType || 'business';

    // Industry keyword maps
    const industryKeywords = {
      business: ['professional services', 'solutions', 'consulting', 'enterprise', 'business growth', 'management', 'strategy', 'innovation', 'b2b', 'partnership'],
      portfolio: ['portfolio', 'creative work', 'design', 'projects', 'freelance', 'gallery', 'showcase', 'visual design', 'case studies', 'hire me'],
      creative: ['creative', 'design studio', 'artistry', 'branding', 'visual identity', 'ui design', 'graphic design', 'illustration', 'creative agency', 'motion design'],
      startup: ['startup', 'innovation', 'disruptive', 'saas', 'technology', 'product launch', 'mvp', 'growth hacking', 'venture', 'digital transformation']
    };

    // Extract words from description for keyword suggestions
    const descWords = desc.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    const commonWords = ['that', 'this', 'with', 'from', 'have', 'will', 'your', 'they', 'been', 'were', 'said', 'each', 'make', 'like', 'just', 'over', 'such', 'take', 'than', 'them', 'very', 'when', 'come', 'could', 'made', 'about', 'after', 'also', 'back', 'into', 'only', 'other', 'some', 'what'];
    const meaningfulWords = descWords.filter(w => !commonWords.includes(w));
    const wordFreq = {};
    meaningfulWords.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const topDescWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // Combine industry keywords with description-extracted keywords
    const baseKeywords = industryKeywords[type] || industryKeywords.business;
    const suggestedKeywords = [...new Set([...topDescWords, ...baseKeywords.slice(0, 5)])].slice(0, 8);

    // Filter out already-added keywords
    const newKeywords = suggestedKeywords.filter(kw => !data.keywords.includes(kw));

    if (newKeywords.length > 0) {
      suggestions.push({
        type: 'keywords',
        icon: '🏷️',
        title: 'Suggested Keywords',
        description: `Based on your ${type} description, these keywords could boost your visibility:`,
        keywords: newKeywords,
      });
    }

    // Title suggestion
    if (!data.pageTitle || data.pageTitle.length < 30) {
      let suggestedTitle = '';
      if (name && tagline) {
        suggestedTitle = `${name} — ${tagline}`.slice(0, 60);
      } else if (name && desc) {
        const shortDesc = desc.split('.')[0].trim().slice(0, 45 - name.length);
        suggestedTitle = `${name} | ${shortDesc}`;
      } else if (name) {
        const typeLabels = { business: 'Professional Services', portfolio: 'Creative Portfolio', creative: 'Design Studio', startup: 'Innovative Solutions' };
        suggestedTitle = `${name} — ${typeLabels[type] || 'Website'}`;
      }
      if (suggestedTitle && suggestedTitle.length >= 20) {
        suggestions.push({
          type: 'title',
          icon: '📝',
          title: 'Optimized Page Title',
          description: `A well-crafted title (30-60 chars) improves click-through rates:`,
          value: suggestedTitle.slice(0, 60),
        });
      }
    }

    // Meta description suggestion
    if (!data.metaDescription || data.metaDescription.length < 120) {
      let suggestedDesc = '';
      if (desc) {
        // Clean and optimize the description
        suggestedDesc = desc.split('.').slice(0, 2).join('. ').trim();
        if (suggestedDesc.length < 120 && name) {
          suggestedDesc = `${name}: ${suggestedDesc}`;
        }
        if (!suggestedDesc.endsWith('.')) suggestedDesc += '.';
        // Add a call to action if space permits
        if (suggestedDesc.length < 140) {
          suggestedDesc += ' Discover more today.';
        }
      } else if (name) {
        const typeDescs = {
          business: `${name} delivers professional solutions tailored to your needs. Explore our services and discover how we can help your business grow.`,
          portfolio: `Explore the creative portfolio of ${name}. Featuring stunning projects, innovative designs, and professional work samples.`,
          creative: `${name} is a creative studio specializing in beautiful, impactful design. Browse our work and start your next project with us.`,
          startup: `${name} is building the future with innovative technology solutions. Join us on our mission to transform the digital landscape.`
        };
        suggestedDesc = typeDescs[type] || typeDescs.business;
      }
      if (suggestedDesc && suggestedDesc.length >= 80) {
        suggestions.push({
          type: 'description',
          icon: '📋',
          title: 'SEO Meta Description',
          description: `An optimized description (120-160 chars) appears in search results:`,
          value: suggestedDesc.slice(0, 160),
        });
      }
    }

    // OG suggestions
    if (!data.ogTitle && (data.pageTitle || name)) {
      suggestions.push({
        type: 'og-title',
        icon: '🔗',
        title: 'Social Share Title',
        description: 'Set an Open Graph title for better social media sharing:',
        value: data.pageTitle || name,
      });
    }

    return suggestions;
  },

  /* ── Render SEO Panel ── */
  renderPanel(container) {
    const data = this.getData();
    const d = AppState.onboarding;
    const { score, checks } = this.calculateScore();
    const suggestions = this.generateSuggestions();

    // Score color
    const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
    const scoreLabel = score >= 80 ? 'Excellent' : score >= 50 ? 'Needs Work' : 'Poor';

    // Build suggestions HTML
    let suggestionsHtml = '';
    if (suggestions.length > 0) {
      suggestionsHtml = `
        <div class="seo-suggestions-card">
          <div class="seo-suggestions-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Smart SEO Suggestions
          </div>
          ${suggestions.map((s, i) => {
            if (s.type === 'keywords') {
              return `<div class="seo-suggestion-item">
                <span class="seo-suggestion-icon">${s.icon}</span>
                <div>
                  <div style="margin-bottom:6px;font-weight:600;color:var(--builder-text)">${s.title}</div>
                  <div style="margin-bottom:8px">${s.description}</div>
                  <div class="seo-suggested-keywords">
                    ${s.keywords.map(kw => `<button class="seo-suggestion-keyword-btn" data-keyword="${kw}">${kw} <span>+</span></button>`).join('')}
                  </div>
                </div>
              </div>`;
            } else {
              return `<div class="seo-suggestion-item">
                <span class="seo-suggestion-icon">${s.icon}</span>
                <div>
                  <div style="margin-bottom:4px;font-weight:600;color:var(--builder-text)">${s.title}</div>
                  <div style="margin-bottom:6px">${s.description}</div>
                  <div class="seo-suggestion-preview">${s.value}</div>
                  <button class="seo-suggestion-btn" data-suggestion-type="${s.type}" data-suggestion-value="${s.value.replace(/"/g, '&quot;')}">✨ Apply This</button>
                </div>
              </div>`;
            }
          }).join('')}
        </div>`;
    }

    container.innerHTML = `
      ${suggestionsHtml}

      <!-- SEO Score Card -->
      <div class="seo-score-card">
        <div class="seo-score-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--builder-border)" stroke-width="8"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor}" stroke-width="8"
              stroke-dasharray="${(score / 100) * 327} 327"
              stroke-linecap="round" transform="rotate(-90 60 60)"
              style="transition: stroke-dasharray 0.6s ease"/>
          </svg>
          <div class="seo-score-value" style="color:${scoreColor}">${score}</div>
        </div>
        <div class="seo-score-info">
          <div class="seo-score-label" style="color:${scoreColor}">${scoreLabel}</div>
          <div class="seo-score-subtitle">SEO Health Score</div>
        </div>
      </div>

      <!-- SEO Checklist -->
      <div class="seo-checklist">
        ${checks.map(c => `
          <div class="seo-check-item ${c.pass ? 'pass' : 'fail'}">
            <span class="seo-check-icon">${c.pass ? '✓' : '✕'}</span>
            <span class="seo-check-label">${c.label}</span>
          </div>
        `).join('')}
      </div>

      <!-- Page Title -->
      <div class="panel-section">
        <div class="panel-section-title">${Icons.get('hero', 14)} Page Title</div>
        <div class="onboarding-form-group">
          <input class="input seo-input" id="seo-title" placeholder="My Awesome Website" 
            value="${(data.pageTitle || d.businessName || '').replace(/"/g, '&quot;')}"
            maxlength="70">
          <div class="seo-input-counter"><span id="seo-title-count">${(data.pageTitle || d.businessName || '').length}</span>/60 chars</div>
        </div>
      </div>

      <!-- Meta Description -->
      <div class="panel-section">
        <div class="panel-section-title">${Icons.get('about', 14)} Meta Description</div>
        <div class="onboarding-form-group">
          <textarea class="input seo-input seo-textarea" id="seo-desc" placeholder="A compelling description of your website..."
            maxlength="200">${(data.metaDescription || d.description || '').replace(/"/g, '&quot;')}</textarea>
          <div class="seo-input-counter"><span id="seo-desc-count">${(data.metaDescription || d.description || '').length}</span>/160 chars</div>
        </div>
      </div>

      <!-- Keywords -->
      <div class="panel-section">
        <div class="panel-section-title">${Icons.get('features', 14)} Focus Keywords</div>
        <div class="seo-keywords-input-row">
          <input class="input seo-input" id="seo-keyword-input" placeholder="Add a keyword..." style="flex:1">
          <button class="btn btn-primary btn-sm" id="seo-add-keyword" style="flex-shrink:0">+ Add</button>
        </div>
        <div class="seo-keywords-list" id="seo-keywords-list">
          ${data.keywords.map(kw => `
            <span class="seo-keyword-tag">
              ${kw}
              <button class="seo-keyword-remove" data-keyword="${kw}">✕</button>
            </span>
          `).join('')}
          ${data.keywords.length === 0 ? '<span class="seo-keywords-empty">No keywords added yet</span>' : ''}
        </div>
      </div>

      <!-- SERP Preview -->
      <div class="panel-section">
        <div class="panel-section-title">${Icons.get('gallery', 14)} Google Preview</div>
        <div class="seo-serp-preview">
          <div class="serp-url">${data.canonicalUrl || 'https://yourwebsite.com'}</div>
          <div class="serp-title">${data.pageTitle || d.businessName || 'Your Page Title'}</div>
          <div class="serp-desc">${data.metaDescription || d.description || 'Your meta description will appear here. Write a compelling description to attract clicks from search results.'}</div>
        </div>
      </div>

      <!-- Open Graph -->
      <div class="panel-section">
        <div class="panel-section-title">${Icons.get('contact', 14)} Social Sharing (Open Graph)</div>
        <div class="onboarding-form-group">
          <label class="label">OG Title</label>
          <input class="input seo-input" id="seo-og-title" placeholder="Same as page title" 
            value="${(data.ogTitle || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="onboarding-form-group">
          <label class="label">OG Description</label>
          <textarea class="input seo-input seo-textarea" id="seo-og-desc" placeholder="Same as meta description">${data.ogDescription || ''}</textarea>
        </div>
        <div class="onboarding-form-group">
          <label class="label">OG Image URL</label>
          <input class="input seo-input" id="seo-og-image" placeholder="https://example.com/image.jpg" value="${data.ogImage || ''}">
        </div>
      </div>

      <!-- Technical SEO -->
      <div class="panel-section">
        <div class="panel-section-title">${Icons.get('services', 14)} Technical SEO</div>
        <div class="onboarding-form-group">
          <label class="label">Canonical URL</label>
          <input class="input seo-input" id="seo-canonical" placeholder="https://yourwebsite.com" value="${data.canonicalUrl || ''}">
        </div>
        <div class="onboarding-form-group">
          <label class="label">Author / Brand</label>
          <input class="input seo-input" id="seo-author" placeholder="Your name or brand" value="${(data.author || d.businessName || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="onboarding-form-group">
          <label class="label">Google Analytics ID</label>
          <input class="input seo-input" id="seo-ga" placeholder="G-XXXXXXXXXX" value="${data.googleAnalytics || ''}">
        </div>
        <div class="onboarding-form-group">
          <label class="label">Robots Directive</label>
          <select class="input seo-input" id="seo-robots">
            <option value="index, follow" ${data.robots === 'index, follow' ? 'selected' : ''}>Index & Follow (Recommended)</option>
            <option value="index, nofollow" ${data.robots === 'index, nofollow' ? 'selected' : ''}>Index, No Follow</option>
            <option value="noindex, follow" ${data.robots === 'noindex, follow' ? 'selected' : ''}>No Index, Follow</option>
            <option value="noindex, nofollow" ${data.robots === 'noindex, nofollow' ? 'selected' : ''}>No Index, No Follow</option>
          </select>
        </div>
        <div class="seo-toggle-row">
          <span class="seo-toggle-label">Generate Structured Data (JSON-LD)</span>
          <button class="sound-effect-toggle ${data.structuredData ? 'active' : ''}" id="seo-jsonld"></button>
        </div>
        <div class="seo-toggle-row">
          <span class="seo-toggle-label">Generate Sitemap.xml</span>
          <button class="sound-effect-toggle ${data.sitemap ? 'active' : ''}" id="seo-sitemap"></button>
        </div>
      </div>

      <!-- Twitter -->
      <div class="panel-section">
        <div class="panel-section-title">${Icons.get('team', 14)} Twitter Card</div>
        <div class="onboarding-form-group">
          <label class="label">Twitter Handle</label>
          <input class="input seo-input" id="seo-twitter" placeholder="@yourhandle" value="${data.twitterHandle || ''}">
        </div>
        <div class="onboarding-form-group">
          <label class="label">Card Type</label>
          <select class="input seo-input" id="seo-twitter-card">
            <option value="summary_large_image" ${data.twitterCard === 'summary_large_image' ? 'selected' : ''}>Large Image</option>
            <option value="summary" ${data.twitterCard === 'summary' ? 'selected' : ''}>Summary</option>
          </select>
        </div>
      </div>
    `;

    this.bindPanelEvents(container);
    this.bindSuggestionEvents(container);
  },

  bindPanelEvents(container) {
    const self = this;

    // Title
    const titleInput = container.querySelector('#seo-title');
    titleInput?.addEventListener('input', function() {
      self.updateField('pageTitle', this.value);
      container.querySelector('#seo-title-count').textContent = this.value.length;
      self.updateSerpPreview(container);
    });

    // Description
    const descInput = container.querySelector('#seo-desc');
    descInput?.addEventListener('input', function() {
      self.updateField('metaDescription', this.value);
      container.querySelector('#seo-desc-count').textContent = this.value.length;
      self.updateSerpPreview(container);
    });

    // Keywords
    const kwInput = container.querySelector('#seo-keyword-input');
    const addBtn = container.querySelector('#seo-add-keyword');
    
    const addKeyword = () => {
      const val = kwInput.value.trim();
      if (val) {
        self.addKeyword(val);
        kwInput.value = '';
        self.refreshKeywordsList(container);
        SoundManager.play('drop');
      }
    };

    addBtn?.addEventListener('click', addKeyword);
    kwInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addKeyword(); }
    });

    container.querySelectorAll('.seo-keyword-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        self.removeKeyword(btn.dataset.keyword);
        self.refreshKeywordsList(container);
        SoundManager.play('delete');
      });
    });

    // OG fields
    container.querySelector('#seo-og-title')?.addEventListener('input', function() { self.updateField('ogTitle', this.value); });
    container.querySelector('#seo-og-desc')?.addEventListener('input', function() { self.updateField('ogDescription', this.value); });
    container.querySelector('#seo-og-image')?.addEventListener('input', function() { self.updateField('ogImage', this.value); });

    // Technical
    container.querySelector('#seo-canonical')?.addEventListener('input', function() { self.updateField('canonicalUrl', this.value); self.updateSerpPreview(container); });
    container.querySelector('#seo-author')?.addEventListener('input', function() { self.updateField('author', this.value); });
    container.querySelector('#seo-ga')?.addEventListener('input', function() { self.updateField('googleAnalytics', this.value); });
    container.querySelector('#seo-robots')?.addEventListener('change', function() { self.updateField('robots', this.value); });
    container.querySelector('#seo-twitter')?.addEventListener('input', function() { self.updateField('twitterHandle', this.value); });
    container.querySelector('#seo-twitter-card')?.addEventListener('change', function() { self.updateField('twitterCard', this.value); });

    // Toggles
    container.querySelector('#seo-jsonld')?.addEventListener('click', function() {
      this.classList.toggle('active');
      self.updateField('structuredData', this.classList.contains('active'));
      SoundManager.play('click');
    });
    container.querySelector('#seo-sitemap')?.addEventListener('click', function() {
      this.classList.toggle('active');
      self.updateField('sitemap', this.classList.contains('active'));
      SoundManager.play('click');
    });
  },

  refreshKeywordsList(container) {
    const data = this.getData();
    const list = container.querySelector('#seo-keywords-list');
    if (!list) return;
    list.innerHTML = data.keywords.map(kw => `
      <span class="seo-keyword-tag">
        ${kw}
        <button class="seo-keyword-remove" data-keyword="${kw}">✕</button>
      </span>
    `).join('') || '<span class="seo-keywords-empty">No keywords added yet</span>';

    list.querySelectorAll('.seo-keyword-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeKeyword(btn.dataset.keyword);
        this.refreshKeywordsList(container);
        SoundManager.play('delete');
      });
    });
  },

  updateSerpPreview(container) {
    const data = this.getData();
    const d = AppState.onboarding;
    const title = container.querySelector('.serp-title');
    const desc = container.querySelector('.serp-desc');
    const url = container.querySelector('.serp-url');
    if (title) title.textContent = data.pageTitle || d.businessName || 'Your Page Title';
    if (desc) desc.textContent = data.metaDescription || d.description || 'Your meta description will appear here.';
    if (url) url.textContent = data.canonicalUrl || 'https://yourwebsite.com';
  },

  bindSuggestionEvents(container) {
    const self = this;

    // Keyword suggestion buttons
    container.querySelectorAll('.seo-suggestion-keyword-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const kw = this.dataset.keyword;
        self.addKeyword(kw);
        self.refreshKeywordsList(container);
        this.style.opacity = '0.4';
        this.style.pointerEvents = 'none';
        this.innerHTML = `✓ ${kw}`;
        SoundManager.play('drop');
        Utils.toast(`Keyword "${kw}" added!`, 'success');
      });
    });

    // Apply suggestion buttons (title, description, og-title)
    container.querySelectorAll('.seo-suggestion-btn[data-suggestion-type]').forEach(btn => {
      btn.addEventListener('click', function() {
        const type = this.dataset.suggestionType;
        const value = this.dataset.suggestionValue;

        switch (type) {
          case 'title':
            self.updateField('pageTitle', value);
            const titleInput = container.querySelector('#seo-title');
            if (titleInput) { titleInput.value = value; }
            const titleCount = container.querySelector('#seo-title-count');
            if (titleCount) titleCount.textContent = value.length;
            break;
          case 'description':
            self.updateField('metaDescription', value);
            const descInput = container.querySelector('#seo-desc');
            if (descInput) { descInput.value = value; }
            const descCount = container.querySelector('#seo-desc-count');
            if (descCount) descCount.textContent = value.length;
            break;
          case 'og-title':
            self.updateField('ogTitle', value);
            const ogInput = container.querySelector('#seo-og-title');
            if (ogInput) { ogInput.value = value; }
            break;
        }

        self.updateSerpPreview(container);
        this.innerHTML = '✓ Applied!';
        this.style.background = 'var(--accent-primary)';
        this.style.color = '#fff';
        this.style.pointerEvents = 'none';
        SoundManager.play('success');
        Utils.toast('SEO suggestion applied!', 'success');
      });
    });
  }
};
