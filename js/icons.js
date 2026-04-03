/* ============================================
   WebFlow AI — Premium Icon Library
   ============================================ */

const Icons = {
  get(name, size = 18, stroke = 1.5) {
    const paths = {
      nav: '<path d="M3 12h18M3 6h18M3 18h18"/>',
      home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      hero: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/><path d="m9 8 3 3-3 3"/>',
      features: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
      about: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
      services: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
      pricing: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
      contact: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
      gallery: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
      cta: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>',
      team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      footer: '<path d="M3 12h18M3 18h18"/><rect width="18" height="18" x="3" y="3" rx="2"/>',
      check: '<polyline points="20 6 9 17 4 12"/>',
      arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
      glass: '<path d="M3 3h18v18H3z"/><path d="M21 3 3 21"/><path d="M9 3v18"/><path d="M15 3v18"/>',
      '3d': '<path d="M3 12h18M12 3v18M4.2 4.2l15.6 15.6M4.2 19.8 19.8 4.2"/>',
      scroll: '<rect width="12" height="20" x="6" y="2" rx="6"/><path d="M12 6v4"/>',
      glow: '<circle cx="12" cy="12" r="10"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
      copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
    };

    const path = paths[name] || paths.home;
    return `
      <svg 
        width="${size}" 
        height="${size}" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="${stroke}" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        class="wf-icon wf-icon-${name}"
      >${path}</svg>`;
  }
};
