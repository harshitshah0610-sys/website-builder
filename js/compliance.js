/* ============================================
   WebFlow AI — Privacy & Compliance Generator
   ============================================ */

const ComplianceGenerator = {
  generate(type) {
    const d = AppState.onboarding;
    const name = d.businessName || 'Our Company';
    const email = d.email || 'contact@example.com';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    switch (type) {
      case 'privacy': return this.privacyPolicy(name, email, date, d);
      case 'terms': return this.termsOfService(name, email, date, d);
      case 'cookies': return this.cookieBanner();
      default: return '';
    }
  },

  privacyPolicy(name, email, date, d) {
    return `
      <div style="max-width:800px;margin:0 auto;padding:60px 24px;font-family:var(--site-font-body);color:var(--site-text);line-height:1.8">
        <h1 style="font-family:var(--site-font-heading);font-size:2rem;margin-bottom:8px;color:var(--site-heading)">Privacy Policy</h1>
        <p style="color:var(--site-text-muted);margin-bottom:32px">Last updated: ${date}</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">1. Information We Collect</h2>
        <p>${name} collects information you provide directly, such as your name, email address, and any other information you submit through our contact forms or services.</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and comply with legal obligations.</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">3. Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website.</p>
        ${d.compliance.gdpr ? `<h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">4. GDPR Rights (EU Residents)</h2>
        <p>If you are a resident of the EU, you have the right to access, rectify, delete, or port your personal data. You may also object to or restrict processing. Contact us at ${email} to exercise these rights.</p>` : ''}
        ${d.compliance.ccpa ? `<h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">${d.compliance.gdpr ? '5' : '4'}. CCPA Rights (California Residents)</h2>
        <p>California residents have the right to know what personal information is collected, request deletion, and opt out of the sale of personal information.</p>` : ''}
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">Contact Us</h2>
        <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:${email}" style="color:var(--site-accent)">${email}</a>.</p>
      </div>`;
  },

  termsOfService(name, email, date) {
    return `
      <div style="max-width:800px;margin:0 auto;padding:60px 24px;font-family:var(--site-font-body);color:var(--site-text);line-height:1.8">
        <h1 style="font-family:var(--site-font-heading);font-size:2rem;margin-bottom:8px;color:var(--site-heading)">Terms of Service</h1>
        <p style="color:var(--site-text-muted);margin-bottom:32px">Last updated: ${date}</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">1. Acceptance of Terms</h2>
        <p>By accessing and using the services provided by ${name}, you agree to be bound by these Terms of Service.</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">2. Use of Services</h2>
        <p>You agree to use our services only for lawful purposes and in accordance with these terms. You may not use our services in any way that could damage or impair our services.</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">3. Intellectual Property</h2>
        <p>All content, features, and functionality of our services are owned by ${name} and are protected by copyright, trademark, and other intellectual property laws.</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">4. Limitation of Liability</h2>
        <p>${name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>
        <h2 style="font-size:1.3rem;margin:24px 0 12px;color:var(--site-heading)">5. Contact</h2>
        <p>Questions? Contact us at <a href="mailto:${email}" style="color:var(--site-accent)">${email}</a>.</p>
      </div>`;
  },

  cookieBanner() {
    return `<div id="cookie-banner" style="position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.9);color:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;z-index:9999;backdrop-filter:blur(10px);font-size:0.9rem">
      <p style="margin:0;flex:1">We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button onclick="this.closest('#cookie-banner').remove()" style="padding:8px 20px;background:var(--site-accent,#6c5ce7);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600">Accept</button>
        <button onclick="this.closest('#cookie-banner').remove()" style="padding:8px 20px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:6px;cursor:pointer">Decline</button>
      </div>
    </div>`;
  }
};
