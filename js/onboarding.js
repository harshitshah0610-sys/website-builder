/* ============================================
   WebFlow AI — Onboarding Wizard (Fixed)
   ============================================ */

const Onboarding = {
  container: null,
  step: 1,

  init() {
    // Check if onboarding was already completed
    const isReset = window.location.search.includes('reset=true');
    if (isReset) {
       Utils.save('onboarding_completed', false);
    }
    
    const completed = Utils.load('onboarding_completed', false);
    if (completed && !isReset) {
      this.showBuilder();
      Builder.init();
      return;
    }

    this.container = document.createElement('div');
    this.container.className = 'onboarding-screen';
    document.body.appendChild(this.container);
    this.renderStep();
  },

  showBuilder() {
    const builder = document.getElementById('builder');
    if (builder) builder.classList.add('active');
    // Remove the static onboarding overlay from HTML if it exists
    const staticOverlay = document.getElementById('onboarding-overlay');
    if (staticOverlay) staticOverlay.style.display = 'none';
  },

  renderStep() {
    switch(this.step) {
      case 1: this.renderStep1(); break;
      case 2: this.renderStep2(); break;
      case 3: this.renderStep3(); break;
      case 4: this.renderStep4(); break;
      case 5: this.renderStep5(); break;
    }
  },

  renderCard(title, desc, content, showBack = true) {
    this.container.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-header">
          <h2 class="onboarding-title">${title}</h2>
          <p class="onboarding-desc">${desc}</p>
        </div>
        <div class="onboarding-form">
          ${content}
        </div>
        <div class="onboarding-footer">
          <div class="step-indicator">
            ${[1, 2, 3, 4, 5].map(i => `<div class="step-dot ${i === this.step ? 'active' : ''}"></div>`).join('')}
          </div>
          <div style="display:flex;gap:12px">
            ${showBack ? `<button class="btn btn-secondary" onclick="Onboarding.prev()">Back</button>` : `<button class="btn btn-ghost" onclick="Onboarding.skip()">Skip Setup</button>`}
            <button class="btn btn-primary" onclick="Onboarding.next()">${this.step === 5 ? 'Launch Builder' : 'Next'} ${Icons.get('arrow', 18)}</button>
          </div>
        </div>
      </div>
    `;
  },

  renderStep1() {
    const bType = AppState.onboarding.businessType || 'ind-dhaba';
    // Ensure default is set immediately for the form
    AppState.onboarding.businessType = bType;
    
    const isSel = (val) => bType === val ? 'selected' : '';
    const content = `
      <div class="onboarding-form-group">
        <label class="label">Select Business Type</label>
        <select class="input" style="height:48px;font-size:16px;background:var(--builder-surface)" onchange="Onboarding.selectType(this.value)">
          <optgroup label="Restaurant">
            <option value="ind-dhaba" ${isSel('ind-dhaba')}>Indian Dhaba</option>
            <option value="ind-cafe" ${isSel('ind-cafe')}>Cafe / Chai Shop</option>
            <option value="ind-finedining" ${isSel('ind-finedining')}>Fine Dining</option>
          </optgroup>
          <optgroup label="E-commerce">
            <option value="ind-clothes" ${isSel('ind-clothes')}>Ethnic Boutique / Clothes</option>
            <option value="ind-localshop" ${isSel('ind-localshop')}>Local Kirana Shop</option>
          </optgroup>
          <optgroup label="Education">
            <option value="ind-coaching" ${isSel('ind-coaching')}>Coaching Classes</option>
            <option value="ind-school" ${isSel('ind-school')}>Local School</option>
          </optgroup>
          <optgroup label="Portfolio">
            <option value="ind-freelancer" ${isSel('ind-freelancer')}>Freelancer / Developer</option>
          </optgroup>
          <optgroup label="Real Estate">
            <option value="ind-realestate" ${isSel('ind-realestate')}>Property / Real Estate</option>
          </optgroup>
          <optgroup label="Fitness">
            <option value="ind-gym" ${isSel('ind-gym')}>Gym / Fitness Studio</option>
            <option value="ind-ayurveda" ${isSel('ind-ayurveda')}>Yoga / Ayurveda Studio</option>
          </optgroup>
          <optgroup label="Event Services">
            <option value="ind-heritage" ${isSel('ind-heritage')}>Wedding Planner</option>
          </optgroup>
        </select>
        <p style="margin-top:15px;font-size:13px;color:var(--builder-text-mutated);">We will instantly preview this theme and auto-generate content matched precisely for your industry.</p>
      </div>
    `;
    this.renderCard('What are you building?', 'Choose a tailored template.', content, false);
    
    // Auto-apply theme preview in background
    setTimeout(() => {
      if (typeof ThemeManager !== 'undefined') ThemeManager.apply(bType, true);
    }, 100);
  },

  renderStep2() {
    const content = `
      <div class="onboarding-form-group">
        <label class="label">Business / Project Name</label>
        <input type="text" class="input" placeholder="e.g. Acme Studio" oninput="Onboarding.setData('businessName', this.value)" value="${AppState.onboarding.businessName}">
      </div>
      <div class="onboarding-form-group">
        <label class="label">Tagline</label>
        <input type="text" class="input" placeholder="e.g. Building the future" oninput="Onboarding.setData('tagline', this.value)" value="${AppState.onboarding.tagline}">
      </div>
    `;
    this.renderCard('The Essentials', 'Tell us about your brand.', content);
  },

  renderStep3() {
    const content = `
      <div class="onboarding-form-group">
        <label class="label">Primary Color</label>
        <input type="color" class="input" style="height:50px;padding:4px;cursor:pointer" oninput="Onboarding.setColor('primary', this.value)" value="${AppState.onboarding.colors.primary}">
      </div>
      <div class="onboarding-form-group">
        <label class="label">Style Preference</label>
        <div class="onboarding-grid">
           <div class="type-option selected">${Icons.get('glass', 24)} Elegant</div>
           <div class="type-option">${Icons.get('3d', 24)} Dynamic</div>
        </div>
      </div>
    `;
    this.renderCard('Design & Style', 'Pick a starting palette and feel.', content);
  },

  renderStep4() {
    const content = `
      <div class="onboarding-form-group">
        <label class="label">Project Description</label>
        <textarea class="input" style="min-height:100px;resize:vertical" oninput="Onboarding.setData('description', this.value)" placeholder="Briefly describe what your business does...">${AppState.onboarding.description}</textarea>
      </div>
    `;
    this.renderCard('Tell your story', 'This helps generate your initial content.', content);
  },

  renderStep5() {
    const content = `
      <div style="text-align:center;padding:24px">
        <div style="font-size:3rem;margin-bottom:16px">${Icons.get('check', 48)}</div>
        <p class="onboarding-desc">Your website is ready to be generated. Click below to enter the builder!</p>
      </div>
    `;
    this.renderCard('All set!', 'Ready to start building?', content);
  },

  selectType(id) {
    AppState.onboarding.businessType = id;
    if (typeof ThemeManager !== 'undefined') ThemeManager.apply(id, true);
    SoundManager.play('click');
  },

  setData(key, val) {
    AppState.onboarding[key] = val;
  },

  setColor(key, val) {
    AppState.onboarding.colors[key] = val;
  },

  next() {
    if (this.step < 5) {
      this.step++;
      this.renderStep();
      SoundManager.play('click');
    } else {
      this.complete();
    }
  },

  // Aliases so app.js calls work
  nextStep() { this.next(); },
  prevStep() { this.prev(); },

  prev() {
    if (this.step > 1) {
      this.step--;
      this.renderStep();
      SoundManager.play('click');
    }
  },

  skip() {
    this.complete();
  },

  complete() {
    if (this.container) {
      this.container.classList.add('fx-fade-out');
    }
    setTimeout(() => {
      if (this.container) this.container.remove();
      // Mark completed so we skip next time
      Utils.save('onboarding_completed', true);
      AppState.saveState();
      // Show builder and initialize
      this.showBuilder();
      Builder.init();
      Builder.autoGenerateTemplate();
      Utils.toast('Welcome to WebFlow AI!', 'success');
      SoundManager.play('success');
    }, 500);
  }
};
