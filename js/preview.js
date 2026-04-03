/* ============================================
   WebFlow AI — Responsive Preview Controller (Fixed)
   ============================================ */

const PreviewManager = {
  currentDevice: 'desktop',

  init() {
    this.canvas = document.getElementById('canvas');
    
    // Builder toolbar device buttons
    document.querySelectorAll('.toolbar .device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDevice(btn.dataset.device);
        SoundManager.play('click');
      });
    });
  },

  setDevice(device) {
    this.currentDevice = device;
    AppState.builder.deviceMode = device;
    
    this.canvas.classList.remove('tablet-view', 'mobile-view');
    if (device === 'tablet') this.canvas.classList.add('tablet-view');
    if (device === 'mobile') this.canvas.classList.add('mobile-view');

    // Update both toolbar and preview device buttons
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === device);
    });

    Utils.emit('device:change', device);
  },

  openFullPreview() {
    const overlay = document.getElementById('preview-overlay');
    const frame = overlay.querySelector('.preview-frame');
    
    // Build the full HTML for preview
    const html = ExportManager.generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    frame.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none;border-radius:var(--radius-lg);box-shadow:var(--shadow-xl);background:#fff"></iframe>`;
    overlay.classList.add('active');
    SoundManager.play('transition');

    // Preview device toggle
    overlay.querySelectorAll('.device-btn').forEach(btn => {
      btn.onclick = () => {
        const dev = btn.dataset.device;
        overlay.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const iframe = frame.querySelector('iframe');
        if (iframe) {
          iframe.style.maxWidth = dev === 'desktop' ? '1440px' : dev === 'tablet' ? '768px' : '375px';
        }
        SoundManager.play('click');
      };
    });

    // Close handler
    overlay.querySelector('.preview-close-btn').onclick = () => {
      overlay.classList.remove('active');
      URL.revokeObjectURL(url);
      frame.innerHTML = '';
    };

    // ESC to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.classList.remove('active');
        URL.revokeObjectURL(url);
        frame.innerHTML = '';
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
};
