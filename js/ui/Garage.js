/**
 * CyberDrift 3D - Garage & Customization Manager
 * Lead Developer: Yashpreet Singh
 */

export class Garage {
  constructor(playerCar, audioEngine) {
    this.playerCar = playerCar;
    this.audioEngine = audioEngine;

    this.selectedPaint = '#00f3ff';
    this.selectedUnderglow = '#00f3ff';
    this.selectedCar = 'specter';

    this.credits = 5000;
    this.loadState();
    this.initEvents();
  }

  loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('cyberdrift_garage') || '{}');
      if (saved.paint) this.selectedPaint = saved.paint;
      if (saved.underglow) this.selectedUnderglow = saved.underglow;
      if (saved.car) this.selectedCar = saved.car;
      if (saved.engineLvl) this.playerCar.engineLevel = saved.engineLvl;
      if (saved.nitroLvl) this.playerCar.nitroLevel = saved.nitroLvl;
      if (saved.armorLvl) this.playerCar.armorLevel = saved.armorLvl;
      if (saved.credits !== undefined) this.credits = saved.credits;

      this.playerCar.setColors(this.selectedPaint, this.selectedUnderglow);
    } catch (e) {}
  }

  saveState() {
    try {
      localStorage.setItem('cyberdrift_garage', JSON.stringify({
        paint: this.selectedPaint,
        underglow: this.selectedUnderglow,
        car: this.selectedCar,
        engineLvl: this.playerCar.engineLevel,
        nitroLvl: this.playerCar.nitroLevel,
        armorLvl: this.playerCar.armorLevel,
        credits: this.credits
      }));
    } catch (e) {}
  }

  initEvents() {
    // 1. Paint Swatches
    const paintButtons = document.querySelectorAll('#paint-palette .color-swatch');
    paintButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        paintButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPaint = btn.dataset.color;
        this.playerCar.setColors(this.selectedPaint, this.selectedUnderglow);
        this.saveState();
        if (this.audioEngine) this.audioEngine.playClick();
      });
    });

    // 2. Underglow Swatches
    const glowButtons = document.querySelectorAll('#underglow-palette .color-swatch');
    glowButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        glowButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedUnderglow = btn.dataset.glow;
        this.playerCar.setColors(this.selectedPaint, this.selectedUnderglow);
        this.saveState();
        if (this.audioEngine) this.audioEngine.playClick();
      });
    });

    // 3. Car Selection Cards
    const carCards = document.querySelectorAll('.car-selection-grid .car-card');
    carCards.forEach(card => {
      card.addEventListener('click', () => {
        carCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedCar = card.dataset.car;

        if (this.selectedCar === 'yashpreet_edition') {
          this.selectedPaint = '#ffe600'; // Yashpreet Gold
          this.selectedUnderglow = '#ffe600';
          this.playerCar.setColors('#ffe600', '#ffe600');
          this.playerCar.maxBaseSpeed = 85;
        } else if (this.selectedCar === 'apex') {
          this.playerCar.maxBaseSpeed = 78;
        } else {
          this.playerCar.maxBaseSpeed = 70;
        }

        this.saveState();
        if (this.audioEngine) this.audioEngine.playClick();
      });
    });

    // 4. Upgrade Buttons
    const btnUpgradeEngine = document.getElementById('btn-upgrade-engine');
    if (btnUpgradeEngine) {
      btnUpgradeEngine.addEventListener('click', () => {
        if (this.playerCar.engineLevel < 5) {
          this.playerCar.engineLevel++;
          this.updateUpgradeUI();
          this.saveState();
          if (this.audioEngine) this.audioEngine.playPickup();
        }
      });
    }

    const btnUpgradeNitro = document.getElementById('btn-upgrade-nitro');
    if (btnUpgradeNitro) {
      btnUpgradeNitro.addEventListener('click', () => {
        if (this.playerCar.nitroLevel < 5) {
          this.playerCar.nitroLevel++;
          this.updateUpgradeUI();
          this.saveState();
          if (this.audioEngine) this.audioEngine.playPickup();
        }
      });
    }

    const btnUpgradeArmor = document.getElementById('btn-upgrade-armor');
    if (btnUpgradeArmor) {
      btnUpgradeArmor.addEventListener('click', () => {
        if (this.playerCar.armorLevel < 5) {
          this.playerCar.armorLevel++;
          this.updateUpgradeUI();
          this.saveState();
          if (this.audioEngine) this.audioEngine.playPickup();
        }
      });
    }

    this.updateUpgradeUI();
  }

  updateUpgradeUI() {
    const engineLvlEl = document.getElementById('upgrade-engine-lvl');
    if (engineLvlEl) engineLvlEl.innerText = `LVL ${this.playerCar.engineLevel}/5`;

    const nitroLvlEl = document.getElementById('upgrade-nitro-lvl');
    if (nitroLvlEl) nitroLvlEl.innerText = `LVL ${this.playerCar.nitroLevel}/5`;

    const armorLvlEl = document.getElementById('upgrade-armor-lvl');
    if (armorLvlEl) armorLvlEl.innerText = `LVL ${this.playerCar.armorLevel}/5`;
  }
}
