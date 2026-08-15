/**
 * CyberDrift 3D - Author & Creator Profile Manager
 * Lead Developer: Yashpreet Singh
 */

export class AuthorModal {
  constructor(garage, audioEngine) {
    this.garage = garage;
    this.audioEngine = audioEngine;

    this.modalEl = document.getElementById('screen-author-modal');
    this.bannerBtn = document.getElementById('author-banner-btn');
    this.hudAuthorBtn = document.getElementById('hud-author-btn');
    this.closeBtn = document.getElementById('btn-close-author');
    this.claimCarBtn = document.getElementById('btn-claim-creator-car');

    this.initEvents();
  }

  initEvents() {
    if (this.bannerBtn) {
      this.bannerBtn.addEventListener('click', () => this.open());
    }

    if (this.hudAuthorBtn) {
      this.hudAuthorBtn.addEventListener('click', () => this.open());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.claimCarBtn) {
      this.claimCarBtn.addEventListener('click', () => {
        // Unlock Yashpreet Special Edition Gold Hypercar
        if (this.garage) {
          this.garage.selectedCar = 'yashpreet_edition';
          this.garage.selectedPaint = '#ffe600';
          this.garage.selectedUnderglow = '#ffe600';
          this.garage.playerCar.setColors('#ffe600', '#ffe600');
          this.garage.playerCar.maxBaseSpeed = 88;
          this.garage.saveState();
        }

        if (this.audioEngine) this.audioEngine.playPickup();
        alert('🌟 CREATOR SPECIAL UNLOCKED! Yashpreet Edition Golden Hypercar equipped!');
        this.close();
      });
    }
  }

  open() {
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
      this.modalEl.classList.add('active');
    }
    if (this.audioEngine) this.audioEngine.playClick();
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
      setTimeout(() => this.modalEl.classList.add('hidden'), 200);
    }
    if (this.audioEngine) this.audioEngine.playClick();
  }
}
