/* ============================================
   WebFlow AI — Component Registry (Premium)
   ============================================ */

const ComponentRegistry = {
  types: {
    navbar: {
      name: 'Navigation Bar',
      icon: Icons.get('nav'),
      category: 'Layout',
      template(data) {
        const d = AppState.onboarding;
        const pages = AppState.builder.pages || [{ id: 'home', name: 'Home' }];
        const linksHtml = pages.map(p => `<li><a href="${p.id === 'home' ? 'index.html' : p.id + '.html'}" data-page-id="${p.id}">${p.name}</a></li>`).join('');
        
        return `<nav class="wf-navbar wf-component" data-component-name="Navigation">
          <div class="wf-navbar-logo" data-editable="text">${d.businessName || 'Your Brand'}</div>
          <ul class="wf-navbar-links">${linksHtml}</ul>
          <button class="wf-navbar-cta" data-editable="text">Get Started</button>
        </nav>`;
      },
      defaults: {}
    },

    hero: {
      name: 'Hero Section',
      icon: Icons.get('hero'),
      category: 'Sections',
      template(data) {
        const d = AppState.onboarding;
        const copyMap = {
          'ind-dhaba': { t: 'Authentic Indian Flavors', d: 'Experience the real taste of the highway.' },
          'ind-cafe': { t: 'Your Perfect Cup of Chai', d: 'Take a break and relax with our premium blends.' },
          'ind-finedining': { t: 'Exquisite Culinary Journey', d: 'Taste luxury in every single bite.' },
          'ind-clothes': { t: 'Elegant Ethnic Wear', d: 'Discover the beauty of traditional designs.' },
          'ind-localshop': { t: 'Your Trusted Local Store', d: 'Daily essentials delivered with a smile.' },
          'ind-coaching': { t: 'Shape Your Future', d: 'Expert guidance for top competitive exams.' },
          'ind-school': { t: 'Excellence in Education', d: 'Nurturing young minds for tomorrow.' },
          'ind-realestate': { t: 'Find Your Dream Home', d: 'Premium properties across the city.' },
          'ind-gym': { t: 'Transform Your Body', d: 'Join the ultimate fitness revolution today.' },
          'ind-ayurveda': { t: 'Holistic Mind & Body', d: 'Find inner peace with ancient practices.' },
          'ind-heritage': { t: 'Your Perfect Wedding', d: 'Crafting unforgettable memories for your big day.' },
          'ind-freelancer': { t: 'Creative Professional', d: 'Delivering exceptional digital experiences.' }
        };
        const copy = copyMap[d.businessType] || { t: d.tagline || 'Build Something Amazing', d: d.description || 'Create beautiful, responsive websites in minutes.' };
        
        return `<section class="wf-hero wf-component wf-media-target" data-component-name="Hero" data-editable-section="true">
          <div class="wf-hero-content fx-3d-depth">
            <h1 data-editable="text">${copy.t}</h1>
            <p data-editable="text">${copy.d}</p>
            <div class="wf-hero-actions">
              <button class="wf-hero-btn primary fx-depth-layer" data-sound-click="click" data-editable="text">Get Started</button>
              <button class="wf-hero-btn secondary fx-depth-layer" data-sound-hover="hover" data-editable="text">Learn More</button>
            </div>
          </div>
        </section>`;
      },
      defaults: {}
    },

    features: {
      name: 'Features Grid',
      icon: Icons.get('features'),
      category: 'Sections',
      template() {
        const d = AppState.onboarding;
        let features = [
          { icon: 'hero', title: 'Lightning Fast', desc: 'Optimized performance for scale.' },
          { icon: 'glow', title: 'Beautiful Design', desc: 'Stunning templates for your brand.' },
          { icon: 'about', title: 'Secure & Reliable', desc: 'Enterprise-grade security.' }
        ];
        
        if (d.businessType?.includes('dhaba') || d.businessType?.includes('cafe') || d.businessType?.includes('finedining')) {
          features = [{ icon: 'hero', title: 'Fresh Ingredients', desc: 'Locally sourced.' }, { icon: 'glow', title: 'Master Chefs', desc: 'Authentic recipes.' }, { icon: 'about', title: 'Great Ambience', desc: 'Perfect dining.' }];
        } else if (d.businessType?.includes('school') || d.businessType?.includes('coaching')) {
          features = [{ icon: 'features', title: 'Expert Faculty', desc: 'Years of experience.' }, { icon: 'hero', title: 'Smart Classes', desc: 'Interactive learning.' }, { icon: 'about', title: 'Results Driven', desc: 'Top rankings.' }];
        } else if (d.businessType?.includes('gym') || d.businessType?.includes('ayurveda')) {
          features = [{ icon: 'hero', title: 'Pro Trainers', desc: 'Personalized plans.' }, { icon: 'features', title: 'Modern Eqpt', desc: 'Best in class.' }, { icon: 'glow', title: 'Flexible Timings', desc: 'Open 24/7.' }];
        }

        return `<section class="wf-features wf-component" data-component-name="Features" data-editable-section="true">
          <div class="wf-features-header">
            <h2 data-editable="text">Why Choose Us</h2>
            <p data-editable="text">Everything you need, right here.</p>
          </div>
          <div class="wf-features-grid fx-stagger" data-editable-list="features">
            ${features.map(f => `
              <div class="wf-feature-card fx-slide-up fx-3d-tilt" data-editable-item="true">
                <div class="wf-feature-icon fx-depth-layer">${Icons.get(f.icon, 32, 1)}</div>
                <h3 data-editable="text">${f.title}</h3>
                <p data-editable="text">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>`;
      },
      defaults: {}
    },

    about: {
      name: 'About Section',
      icon: Icons.get('about'),
      category: 'Sections',
      template() {
        const d = AppState.onboarding;
        return `<section class="wf-about wf-component" data-component-name="About" data-editable-section="true">
          <div class="wf-about-inner fx-3d-depth">
            <div class="wf-about-image wf-media-target fx-depth-layer"></div>
            <div class="wf-about-text">
              <h2 data-editable="text">About ${d.businessName || 'Our Company'}</h2>
              <p data-editable="text">${d.description || 'We are a passionate team dedicated to delivering exceptional results.'}</p>
              <button class="wf-hero-btn primary" data-sound-click="success" data-editable="text">Learn More</button>
            </div>
          </div>
        </section>`;
      },
      defaults: {}
    },

    pricing: {
      name: 'Pricing Table',
      icon: Icons.get('pricing'),
      category: 'Sections',
      template() {
        const plans = [
          { name: 'Starter', price: '₹999', features: ['Basic Access', 'Standard Support', 'Validity 30 Days'] },
          { name: 'Premium', price: '₹2499', features: ['Full Access', 'Priority Support', 'Validity 90 Days'], featured: true }
        ];
        return `<section class="wf-pricing wf-component" data-component-name="Pricing" data-editable-section="true">
          <div class="wf-pricing-header"><h2 data-editable="text">Simple Pricing</h2></div>
          <div class="wf-pricing-grid" data-editable-list="plans">
            ${plans.map(p => `
              <div class="wf-pricing-card fx-3d-tilt ${p.featured ? 'featured' : ''}" data-editable-item="true" ${p.featured ? 'data-featured="true"' : ''}>
                <div class="plan-name fx-depth-layer" data-editable="text">${p.name}</div>
                <div class="plan-price" data-editable="text">${p.price}</div>
                <div class="plan-period">/month</div>
                <ul class="plan-features-list">
                  ${p.features.map(f => `<li><span class="plan-feature-icon">${Icons.get('check', 14, 2)}</span> <span data-editable="text">${f}</span></li>`).join('')}
                </ul>
                <button class="wf-hero-btn ${p.featured ? 'primary' : 'secondary'}" style="width:100%" data-editable="text">Choose Plan</button>
              </div>
            `).join('')}
          </div>
        </section>`;
      },
      defaults: {}
    },
    
    menu: {
      name: 'Restaurant Menu',
      icon: Icons.get('gallery'),
      category: 'Sections',
      template() {
        const items = [
          { name: 'Paneer Butter Masala', desc: 'Rich and creamy curry.', price: '₹250' },
          { name: 'Chicken Tikka', desc: 'Tandoori roasted skewers.', price: '₹350' },
          { name: 'Garlic Naan', desc: 'Butter layered flatbread.', price: '₹60' },
          { name: 'Special Thali', desc: 'Complete traditional meal.', price: '₹400' }
        ];
        return `<section class="wf-pricing wf-component" data-component-name="Menu" data-editable-section="true">
          <div class="wf-pricing-header"><h2 data-editable="text">Our Menu</h2></div>
          <div class="wf-pricing-grid" data-editable-list="menu" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))">
            ${items.map(p => `
              <div class="wf-pricing-card fx-slide-up" style="text-align:left;" data-editable-item="true">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <h3 data-editable="text" style="margin:0">${p.name}</h3>
                  <div data-editable="text" style="color:var(--site-primary);font-weight:700">${p.price}</div>
                </div>
                <p data-editable="text" style="color:var(--site-text-muted);font-size:0.9rem;margin-top:10px">${p.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>`;
      },
      defaults: {}
    },

    products: {
      name: 'E-Commerce Products',
      icon: Icons.get('gallery'),
      category: 'Sections',
      template() {
        return `<section class="wf-gallery wf-component" data-component-name="Products" data-editable-section="true" style="background:var(--site-surface)">
          <div class="wf-gallery-header"><h2 data-editable="text">Featured Products</h2></div>
          <div class="wf-gallery-grid" data-editable-list="products" style="gap:2rem">
            ${[1, 2, 3].map(i => `
              <div class="wf-gallery-item fx-3d-tilt" data-editable-item="true" style="overflow:visible;background:transparent;">
                <div class="wf-media-target" style="height:250px;width:100%;border-radius:var(--site-radius);background:var(--site-bg);margin-bottom:1rem;"></div>
                <h3 data-editable="text" style="margin:0">Premium Collection ${i}</h3>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                  <span data-editable="text" style="font-weight:bold;color:var(--site-primary)">₹1299</span>
                  <button class="wf-hero-btn primary" style="padding:5px 15px;font-size:0.8rem" data-editable="text">Add to Cart</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>`;
      },
      defaults: {}
    },

    contact: {
      name: 'Contact Form',
      icon: Icons.get('contact'),
      category: 'Sections',
      template() {
        return `<section class="wf-contact wf-component" data-component-name="Contact" data-editable-section="true">
          <div class="wf-contact-inner fx-3d-depth">
            <h2 data-editable="text">Get In Touch</h2>
            <form class="wf-form" id="contact-form">
              <div class="wf-form-group"><label data-editable="text">Name</label><input type="text" name="name" placeholder="Your name" required></div>
              <div class="wf-form-group"><label data-editable="text">Email</label><input type="email" name="email" placeholder="your@email.com" required></div>
              <div class="wf-form-group"><label data-editable="text">Message</label><textarea name="message" placeholder="How can we help?" required></textarea></div>
              <button type="submit" class="wf-form-submit" data-sound-click="success" data-editable="text">Send Message</button>
              <div class="wf-form-status" style="display:none;margin-top:1.5rem;padding:1rem;border-radius:var(--radius-md);text-align:center;font-size:var(--text-sm)"></div>
            </form>
          </div>
        </section>`;
      },
      defaults: {}
    },

    gallery: {
      name: 'Gallery Grid',
      icon: Icons.get('gallery'),
      category: 'Sections',
      template() {
        return `<section class="wf-gallery wf-component" data-component-name="Gallery" data-editable-section="true">
          <div class="wf-gallery-header"><h2 data-editable="text">Our Work</h2></div>
          <div class="wf-gallery-grid" data-editable-list="gallery">
            ${[1, 2, 3].map(i => `<div class="wf-gallery-item wf-media-target fx-3d-tilt" data-editable-item="true" style="background:rgba(var(--accent-primary-rgb),0.05)"></div>`).join('')}
          </div>
        </section>`;
      },
      defaults: {}
    },

    footer: {
      name: 'Footer',
      icon: Icons.get('footer'),
      category: 'Layout',
      template() {
        const d = AppState.onboarding;
        return `<footer class="wf-footer wf-component" data-component-name="Footer" data-editable-section="true">
          <div class="wf-footer-inner">
            <div class="wf-footer-brand"><h3 data-editable="text">${d.businessName || 'Your Brand'}</h3><p data-editable="text">Premium digital experiences.</p></div>
            <div class="wf-footer-col"><h4 data-editable="text">Support</h4><a href="#">Help Center</a><a href="#">Contact</a></div>
            <div class="wf-footer-col"><h4 data-editable="text">Legal</h4><a href="privacy-policy.html" data-editable="text">Privacy Policy</a><a href="terms-of-service.html" data-editable="text">Terms of Service</a></div>
          </div>
          <div class="wf-footer-bottom" data-editable="text">&copy; ${new Date().getFullYear()} ${d.businessName || 'Your Brand'}. All rights reserved.</div>
        </footer>`;
      },
      defaults: {}
    }
  },

  getByCategory() {
    const cats = {};
    Object.entries(this.types).forEach(([id, comp]) => {
      const cat = comp.category || 'Other';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push({ id, ...comp });
    });
    return cats;
  },

  create(typeId, customData = {}) {
    const type = this.types[typeId];
    if (!type) return null;
    return {
      id: Utils.uuid(),
      type: typeId,
      name: type.name,
      html: type.template(customData),
      effects: [],
      styles: {},
      data: { ...type.defaults, ...customData }
    };
  }
};
