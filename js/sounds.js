/* ============================================
   WebFlow AI — Web Audio Sound Effects
   ============================================ */

const SoundManager = {
  ctx: null,
  enabled: false,
  volume: 0.3,

  init() {
    this.enabled = Utils.load('sound_enabled', false);
    this.attachGlobalListeners();
  },

  attachGlobalListeners() {
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-sound-hover]');
      if (el) this.play(el.dataset.soundHover);
    });
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-sound-click]');
      if (el) this.play(el.dataset.soundClick);
    });
  },

  getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  },

  play(type) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = this.volume;

      const now = ctx.currentTime;
      switch (type) {
        case 'click':
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now); osc.stop(now + 0.08);
          break;
        case 'drop':
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
          break;
        case 'success':
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.1);
          osc.frequency.setValueAtTime(784, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now); osc.stop(now + 0.35);
          break;
        case 'error':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now); osc.stop(now + 0.25);
          break;
        case 'hover':
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.value = this.volume * 0.15;
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now); osc.stop(now + 0.04);
          break;
        case 'transition':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
          break;
        case 'delete':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
          break;
      }
    } catch (e) { /* silent fail */ }
  },

  toggle() {
    this.enabled = !this.enabled;
    Utils.save('sound_enabled', this.enabled);
    if (this.enabled) this.play('success');
    Utils.emit('sound:toggle', this.enabled);
    return this.enabled;
  }
};
