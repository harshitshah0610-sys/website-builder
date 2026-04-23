/* ============================================
   WebFlow AI — Landing Page & Auth Logic
   ============================================ */

const Landing = {
  isLoginMode: false,
  
  init() {
    this.render();
    this.bindEvents();
    
    // Check if user is already logged in
    const token = localStorage.getItem('wf_auth_token');
    if (token) {
      this.hideLanding();
      const isReset = window.location.search.includes('reset=true');
      const hasContent = AppState.builder.pages && AppState.builder.pages[0] && AppState.builder.pages[0].content.trim() !== '';
      if (isReset || !hasContent) {
        if (typeof Onboarding !== 'undefined') Onboarding.init();
      } else {
        Builder.init();
      }
    }
  },

  render() {
    const isLogged = !!localStorage.getItem('wf_auth_token');
    const existing = document.getElementById('platform-landing');
    const currentDisplay = existing ? existing.style.display : 'flex';
    const isHidden = existing ? existing.classList.contains('hidden') : false;

    const landingHtml = `
      <div id="platform-landing" class="${isHidden ? 'hidden' : ''}" style="display:${currentDisplay}">
        <nav class="landing-nav">
          <div class="landing-logo">${typeof Icons !== 'undefined' ? Icons.get('glow', 24) : '✨'} WebFlow AI</div>
          <div style="display:flex; gap:16px;">
            ${isLogged ? `
              <button class="btn btn-ghost" onclick="Landing.hideLanding()">Dashboard</button>
              <button class="btn btn-primary" onclick="Landing.logout()">Logout</button>
            ` : `
              <button class="btn btn-ghost" onclick="Landing.openAuth(true)">Login</button>
              <button class="btn btn-primary" onclick="Landing.openAuth(false)">Start Free Trial</button>
            `}
            <button class="btn btn-secondary" onclick="Landing.downloadUsersExcel()" title="Admin: Download User Data Excel" style="background:#166534; border:none;">Admin Data</button>
          </div>
        </nav>

        <section class="landing-hero">
          <div class="glow-orb"></div>
          <h1>Build Your Dream Website<br/>in <span class="text-gradient">Seconds</span></h1>
          <p>Join thousands of creators using our intelligent SaaS platform to generate, edit, and publish high-converting websites. The perfect tool for freelancers, agencies, and dynamic businesses.</p>
          <div class="hero-actions">
            ${isLogged ? `
              <button class="btn btn-primary btn-glow" style="font-size: 1.2rem; padding: 16px 32px;" onclick="Landing.hideLanding()">Continue Building ✨</button>
              <button class="btn btn-secondary" style="font-size: 1.2rem; padding: 16px 32px;" onclick="Landing.logout()">Sign Out</button>
            ` : `
              <button class="btn btn-primary btn-glow" style="font-size: 1.2rem; padding: 16px 32px;" onclick="Landing.openAuth(false)">Get Started Now ✨</button>
              <button class="btn btn-secondary" style="font-size: 1.2rem; padding: 16px 32px;" onclick="Landing.openAuth(true)">Login to Dashboard</button>
            `}
          </div>
          
          <div class="hero-mockup">
            <div class="mockup-header">
               <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            </div>
            <div class="mockup-body">
               <div class="mockup-sidebar"></div>
               <div class="mockup-content">
                  <div class="mockup-box width-full"></div>
                  <div class="mockup-box width-half"></div>
                  <div class="mockup-box width-half"></div>
               </div>
            </div>
          </div>
        </section>

        <!-- Trusted By -->
        <section class="landing-trusted">
          <p>TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
          <div class="trusted-logos">
            <div class="logo-item">Acme Corp</div>
            <div class="logo-item">TechFlow</div>
            <div class="logo-item">GlobalNet</div>
            <div class="logo-item">InnovateX</div>
            <div class="logo-item">Stark Ind.</div>
          </div>
        </section>

        <section class="landing-features">
          <h2>Intelligent Design, <span class="text-gradient">Zero Code.</span></h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🚀</div>
              <h3>Instant Generation</h3>
              <p>Answer a few questions and our AI creates a fully structured website with tailored copy instantly.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎨</div>
              <h3>14+ Industry Themes</h3>
              <p>From Fine Dining to Yoga Studios, get color palettes and layouts designed for your exact niche.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>SEO Optimized</h3>
              <p>Built-in SEO analyzers suggest metadata and keyword structures to get you ranked instantly.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💾</div>
              <h3>Excel Export</h3>
              <p>Capture leads and user data, securely exporting them straight to your local Excel sheets.</p>
            </div>
          </div>
        </section>
        
        <footer class="landing-footer">
          <div class="landing-logo">${typeof Icons !== 'undefined' ? Icons.get('glow', 24) : '✨'} WebFlow AI</div>
          <p>© 2026 WebFlow AI Inc. All rights reserved.</p>
          <div class="footer-links">
            <span>Privacy Policy</span> | <span>Terms of Service</span> | <span>Contact</span>
          </div>
        </footer>

        <!-- Auth Modal -->
        <div class="auth-overlay" id="auth-overlay">
          <div class="auth-modal">
            <button class="close-modal" onclick="Landing.closeAuth()">✕</button>
            <h2 id="auth-title">Create Account</h2>
            <p id="auth-desc">Join WebFlow AI and start building today.</p>

            <form id="auth-form">
              <div class="auth-form-group" id="auth-name-group">
                <label>Full Name</label>
                <input type="text" class="auth-input" id="auth-name" placeholder="John Doe">
              </div>
              <div class="auth-form-group">
                <label>Email</label>
                <input type="email" class="auth-input" id="auth-email" placeholder="you@company.com" required>
              </div>
              <div class="auth-form-group">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <label>Password</label>
                  <span id="forgot-password" onclick="Landing.handleForgotPassword()" style="font-size:0.8rem;color:var(--primary-color);cursor:pointer;margin-bottom:8px;">Forgot Password?</span>
                </div>
                <input type="password" class="auth-input" id="auth-password" placeholder="••••••••" required>
              </div>
              <button type="submit" class="auth-btn" id="auth-submit">Sign Up</button>
            </form>

            <div class="auth-toggle">
              <span id="auth-toggle-text">Already have an account? <span onclick="Landing.toggleAuthMode()">Log in</span></span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (existing) {
       existing.outerHTML = landingHtml;
    } else {
       document.body.insertAdjacentHTML('afterbegin', landingHtml);
    }
    
    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById('auth-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuth();
      });
    }
  },

  openAuth(isLogin = false) {
    this.isLoginMode = isLogin;
    this.updateAuthUI();
    document.getElementById('auth-overlay').classList.add('active');
  },

  closeAuth() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  toggleAuthMode() {
    this.isLoginMode = !this.isLoginMode;
    this.updateAuthUI();
  },

  updateAuthUI() {
    const title = document.getElementById('auth-title');
    const desc = document.getElementById('auth-desc');
    const submit = document.getElementById('auth-submit');
    const toggle = document.getElementById('auth-toggle-text');
    const nameGroup = document.getElementById('auth-name-group');
    const nameInput = document.getElementById('auth-name');
    if (!title || !desc || !submit) return;

    if (this.isLoginMode) {
      title.textContent = 'Welcome Back';
      desc.textContent = 'Log in to continue building your websites.';
      submit.textContent = 'Log In';
      toggle.innerHTML = 'Need an account? <span onclick="Landing.toggleAuthMode()">Sign up</span>';
      nameGroup.style.display = 'none';
      nameInput.removeAttribute('required');
    } else {
      title.textContent = 'Create Account';
      desc.textContent = 'Join WebFlow AI and start building today.';
      submit.textContent = 'Sign Up';
      toggle.innerHTML = 'Already have an account? <span onclick="Landing.toggleAuthMode()">Log in</span>';
      nameGroup.style.display = 'block';
      nameInput.setAttribute('required', 'true');
    }
  },

  handleAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();

    if (!email || !password) return;

    let users = JSON.parse(localStorage.getItem('wf_users') || '[]');

    if (this.isLoginMode) {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Invalid email or password!');
        return;
      }
      this.loginSuccess(user);
    } else {
      if (users.find(u => u.email === email)) {
        alert('User already exists! Please log in.');
        return;
      }
      
      const newUser = {
        name,
        email,
        password,
        registeredAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('wf_users', JSON.stringify(users));
      
      this.loginSuccess(newUser);
    }
  },

  loginSuccess(user) {
    localStorage.setItem('wf_auth_token', btoa(user.email + ':' + Date.now()));
    localStorage.setItem('wf_current_user', JSON.stringify(user));
    
    this.closeAuth();
    this.hideLanding();
    
    if (typeof Onboarding !== 'undefined') {
      Onboarding.init();
    }
  },

  hideLanding() {
    const el = document.getElementById('platform-landing');
    if (el) el.classList.add('hidden');
    
    const builder = document.getElementById('builder');
    if (builder) {
       builder.style.display = 'flex';
       setTimeout(() => builder.classList.add('active'), 10);
    }

    setTimeout(() => {
      if (el) el.style.display = 'none';
    }, 500);
  },

  showLanding() {
    this.render(); 
    
    const el = document.getElementById('platform-landing');
    if (el) {
      el.style.display = 'flex';
      setTimeout(() => el.classList.remove('hidden'), 50);
    }
    
    const builder = document.getElementById('builder');
    if (builder) {
       builder.style.display = 'none';
       builder.classList.remove('active');
    }
  },

  logout() {
    localStorage.removeItem('wf_auth_token');
    localStorage.removeItem('wf_current_user');
    
    const builder = document.getElementById('builder');
    if (builder) {
       builder.style.display = 'none';
       builder.classList.remove('active');
    }
    
    this.render();
    Utils.toast('Signed out successfully', 'info');
  },

  handleForgotPassword() {
    const email = document.getElementById('auth-email').value.trim();
    if (!email) {
      alert('Please enter your email address first.');
      return;
    }
    
    const btn = document.getElementById('forgot-password');
    const originalText = btn.textContent;
    btn.textContent = 'Sending link...';
    btn.style.pointerEvents = 'none';
    
    setTimeout(() => {
      alert(`A password reset link has been sent to ${email}.`);
      btn.textContent = originalText;
      btn.style.pointerEvents = 'auto';
    }, 1000);
  },

  downloadUsersExcel() {
    if (typeof XLSX === 'undefined') {
      alert("SheetJS library is not loaded. Cannot export excel.");
      return;
    }
    const users = JSON.parse(localStorage.getItem('wf_users') || '[]');
    if (users.length === 0) {
      alert("No users registered yet.");
      return;
    }
    // Prepare data
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    // Force download
    XLSX.writeFile(workbook, "WebFlow_Users.xlsx");
  }
};
