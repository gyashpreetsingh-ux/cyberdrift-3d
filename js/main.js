/**
 * CyberDrift 3D: Neo Tokyo Overdrive
 * Lead Developer / Architect: Yashpreet Singh
 */

import * as THREE from 'three';
import { SceneRenderer } from './engine/Renderer.js';
import { CityEngine } from './engine/City.js';
import { WeatherEngine } from './engine/Weather.js';
import { AudioEngine } from './engine/AudioEngine.js';
import { PlayerCar } from './entities/PlayerCar.js';
import { TrafficManager } from './entities/TrafficCar.js';
import { PickupManager } from './entities/Pickups.js';
import { HUD } from './ui/HUD.js';
import { Garage } from './ui/Garage.js';
import { AuthorModal } from './ui/AuthorModal.js';

class CyberDriftGame {
  constructor() {
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.gameMode = 'endless'; // 'endless', 'timeattack', 'pursuit'

    // Core Systems
    this.renderer = new SceneRenderer();
    this.audio = new AudioEngine();
    this.city = new CityEngine(this.renderer.scene);
    this.weather = new WeatherEngine(this.renderer.scene, this.audio);
    this.player = new PlayerCar(this.renderer.scene);
    this.traffic = new TrafficManager(this.renderer.scene);
    this.pickups = new PickupManager(this.renderer.scene);
    this.hud = new HUD();
    this.garage = new Garage(this.player, this.audio);
    this.authorModal = new AuthorModal(this.garage, this.audio);

    // Scoring & Progression
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cyberdrift_highscore') || '0', 10);
    this.multiplier = 1.0;
    this.comboTimer = 0;
    this.maxComboTime = 4.0;
    this.nearMissCount = 0;
    this.maxSpeedAchieved = 0;
    this.distanceTraveled = 0;

    // Time Attack Mode timer
    this.timeAttackRemaining = 60;

    // Input State
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false,
      nitro: false,
      drift: false
    };

    // Clock
    this.clock = new THREE.Clock();

    this.initInputs();
    this.initUIEvents();
    this.animate();
  }

  // ==========================================
  // Input Handling (Keyboard, Touch, Gamepad)
  // ==========================================
  initInputs() {
    window.addEventListener('keydown', (e) => {
      if (this.state === 'MENU' && e.code === 'Enter') {
        this.startGame();
        return;
      }

      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.up = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.down = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.nitro = true;
      if (e.code === 'Space') this.input.drift = true;

      if (e.code === 'KeyC') {
        const newCam = this.renderer.cycleCamera();
        this.hud.showAnnouncer('CAMERA VIEW', newCam.toUpperCase());
        if (this.audio) this.audio.playClick();
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING') this.pauseGame();
        else if (this.state === 'PAUSED') this.resumeGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.down = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.nitro = false;
      if (e.code === 'Space') this.input.drift = false;
    });

    // Mobile / Touch Controls
    this.setupTouchButton('btn-touch-left', (pressed) => { this.input.left = pressed; });
    this.setupTouchButton('btn-touch-right', (pressed) => { this.input.right = pressed; });
    this.setupTouchButton('btn-touch-gas', (pressed) => { this.input.up = pressed; });
    this.setupTouchButton('btn-touch-brake', (pressed) => { this.input.down = pressed; });
    this.setupTouchButton('btn-touch-nitro', (pressed) => { this.input.nitro = pressed; });
  }

  setupTouchButton(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;

    const start = (e) => { e.preventDefault(); callback(true); };
    const end = (e) => { e.preventDefault(); callback(false); };

    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
  }

  // ==========================================
  // UI & Menu Screen Transitions
  // ==========================================
  initUIEvents() {
    // Mode Cards selection
    const modeCards = document.querySelectorAll('.mode-selector .mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        modeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.gameMode = card.dataset.mode;
        if (this.audio) this.audio.playClick();
      });
    });

    // Start Game Button
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => this.startGame());
    }

    // Open Garage Button
    const btnGarage = document.getElementById('btn-open-garage');
    if (btnGarage) {
      btnGarage.addEventListener('click', () => {
        document.getElementById('screen-main-menu').classList.remove('active');
        document.getElementById('screen-garage').classList.remove('hidden');
        document.getElementById('screen-garage').classList.add('active');
        if (this.audio) this.audio.playClick();
      });
    }

    // Close Garage Button
    const closeGarage = () => {
      document.getElementById('screen-garage').classList.remove('active');
      setTimeout(() => document.getElementById('screen-garage').classList.add('hidden'), 200);
      document.getElementById('screen-main-menu').classList.add('active');
      if (this.audio) this.audio.playClick();
    };
    const btnCloseGarage = document.getElementById('btn-close-garage');
    const btnGarageDone = document.getElementById('btn-garage-done');
    if (btnCloseGarage) btnCloseGarage.addEventListener('click', closeGarage);
    if (btnGarageDone) btnGarageDone.addEventListener('click', closeGarage);

    // Open Settings Button
    const btnSettings = document.getElementById('btn-open-settings');
    const screenSettings = document.getElementById('screen-settings');
    if (btnSettings && screenSettings) {
      btnSettings.addEventListener('click', () => {
        document.getElementById('screen-main-menu').classList.remove('active');
        screenSettings.classList.remove('hidden');
        screenSettings.classList.add('active');
        if (this.audio) this.audio.playClick();
      });
    }

    const closeSettings = () => {
      screenSettings.classList.remove('active');
      setTimeout(() => screenSettings.classList.add('hidden'), 200);
      if (this.state === 'PAUSED') {
        document.getElementById('screen-pause').classList.add('active');
      } else {
        document.getElementById('screen-main-menu').classList.add('active');
      }
      if (this.audio) this.audio.playClick();
    };
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnSaveSettings = document.getElementById('btn-settings-save');
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
    if (btnSaveSettings) btnSaveSettings.addEventListener('click', closeSettings);

    // Settings Inputs
    const volMusic = document.getElementById('vol-music');
    const volSfx = document.getElementById('vol-sfx');
    const selectWeather = document.getElementById('select-weather');
    const selectCamera = document.getElementById('select-camera');

    if (volMusic && volSfx) {
      const updateVols = () => {
        this.audio.setVolumes(volMusic.value / 100, volSfx.value / 100);
      };
      volMusic.addEventListener('input', updateVols);
      volSfx.addEventListener('input', updateVols);
    }

    if (selectWeather) {
      selectWeather.addEventListener('change', (e) => {
        this.weather.setMode(e.target.value);
      });
    }

    if (selectCamera) {
      selectCamera.addEventListener('change', (e) => {
        this.renderer.cameraMode = e.target.value;
      });
    }

    // In-game quick toggles
    const btnCamToggle = document.getElementById('btn-camera-toggle');
    if (btnCamToggle) {
      btnCamToggle.addEventListener('click', () => {
        const newCam = this.renderer.cycleCamera();
        this.hud.showAnnouncer('CAMERA VIEW', newCam.toUpperCase());
        if (this.audio) this.audio.playClick();
      });
    }

    const btnPauseToggle = document.getElementById('btn-pause-toggle');
    if (btnPauseToggle) {
      btnPauseToggle.addEventListener('click', () => {
        if (this.state === 'PLAYING') this.pauseGame();
      });
    }

    // Pause Menu actions
    const btnResume = document.getElementById('btn-resume-game');
    if (btnResume) btnResume.addEventListener('click', () => this.resumeGame());

    const btnRestart = document.getElementById('btn-restart-game');
    if (btnRestart) btnRestart.addEventListener('click', () => this.restartGame());

    const btnPauseSettings = document.getElementById('btn-pause-settings');
    if (btnPauseSettings) {
      btnPauseSettings.addEventListener('click', () => {
        document.getElementById('screen-pause').classList.remove('active');
        screenSettings.classList.remove('hidden');
        screenSettings.classList.add('active');
      });
    }

    const btnQuit = document.getElementById('btn-quit-to-menu');
    if (btnQuit) btnQuit.addEventListener('click', () => this.quitToMenu());

    // Game Over actions
    const btnGoRetry = document.getElementById('btn-go-retry');
    if (btnGoRetry) btnGoRetry.addEventListener('click', () => this.startGame());

    const btnGoGarage = document.getElementById('btn-go-garage');
    if (btnGoGarage) {
      btnGoGarage.addEventListener('click', () => {
        document.getElementById('screen-game-over').classList.remove('active');
        document.getElementById('screen-game-over').classList.add('hidden');
        document.getElementById('screen-garage').classList.remove('hidden');
        document.getElementById('screen-garage').classList.add('active');
      });
    }

    const btnGoMenu = document.getElementById('btn-go-menu');
    if (btnGoMenu) btnGoMenu.addEventListener('click', () => this.quitToMenu());
  }

  // ==========================================
  // Game Flow & State Transitions
  // ==========================================
  startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.multiplier = 1.0;
    this.comboTimer = 0;
    this.nearMissCount = 0;
    this.maxSpeedAchieved = 0;
    this.distanceTraveled = 0;
    this.timeAttackRemaining = 60;

    // Reset entities
    this.player.reset();
    this.traffic.reset();
    this.pickups.reset();

    // Hide UI Overlays, Show HUD
    document.getElementById('screen-main-menu').classList.remove('active');
    document.getElementById('screen-game-over').classList.remove('active');
    document.getElementById('screen-game-over').classList.add('hidden');
    document.getElementById('screen-pause').classList.remove('active');
    document.getElementById('hud').classList.remove('hidden');

    // Start Audio
    this.audio.startEngine();
    this.audio.startMusic();

    this.hud.showAnnouncer('SYSTEMS ONLINE', 'DRIVE FAST • DODGE TRAFFIC');
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';

    document.getElementById('pause-score').innerText = Math.floor(this.score);
    document.getElementById('pause-distance').innerText = (this.distanceTraveled / 1000).toFixed(1) + ' KM';

    const screenPause = document.getElementById('screen-pause');
    screenPause.classList.remove('hidden');
    screenPause.classList.add('active');

    this.audio.stopEngine();
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';

    const screenPause = document.getElementById('screen-pause');
    screenPause.classList.remove('active');
    setTimeout(() => screenPause.classList.add('hidden'), 200);

    this.audio.startEngine();
  }

  restartGame() {
    const screenPause = document.getElementById('screen-pause');
    screenPause.classList.remove('active');
    screenPause.classList.add('hidden');
    this.startGame();
  }

  quitToMenu() {
    this.state = 'MENU';
    this.audio.stopEngine();
    this.audio.stopMusic();

    document.getElementById('hud').classList.add('hidden');
    document.getElementById('screen-pause').classList.remove('active');
    document.getElementById('screen-pause').classList.add('hidden');
    document.getElementById('screen-game-over').classList.remove('active');
    document.getElementById('screen-game-over').classList.add('hidden');

    const screenMenu = document.getElementById('screen-main-menu');
    screenMenu.classList.remove('hidden');
    screenMenu.classList.add('active');
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.audio.stopEngine();
    this.audio.playCrash();

    // High score check
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('cyberdrift_highscore', this.highScore.toString());
    }

    // Credits reward calculation
    const creditsEarned = Math.floor(this.score / 50 + this.nearMissCount * 100);
    this.garage.credits += creditsEarned;
    this.garage.saveState();

    // Populate Game Over Screen
    document.getElementById('go-score').innerText = Math.floor(this.score);
    document.getElementById('go-highscore').innerText = this.highScore;
    document.getElementById('go-distance').innerText = (this.distanceTraveled / 1000).toFixed(1) + ' KM';
    document.getElementById('go-nearmiss').innerText = this.nearMissCount;
    document.getElementById('go-maxspeed').innerText = `${this.maxSpeedAchieved} KM/H`;
    document.getElementById('go-credits').innerText = `+${creditsEarned} CYBER-CR`;

    document.getElementById('hud').classList.add('hidden');
    const screenGo = document.getElementById('screen-game-over');
    screenGo.classList.remove('hidden');
    screenGo.classList.add('active');
  }

  // ==========================================
  // Main Animation / Physics Loop
  // ==========================================
  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'PLAYING') {
      // 1. Update Player Vehicle
      this.player.update(dt, this.input);
      this.distanceTraveled += this.player.speed * dt;

      if (this.player.speedKmh > this.maxSpeedAchieved) {
        this.maxSpeedAchieved = this.player.speedKmh;
      }

      // 2. Combo & Multiplier Decay
      if (this.multiplier > 1.0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.multiplier = Math.max(1.0, this.multiplier - 0.5);
          this.comboTimer = this.maxComboTime;
        }
      }

      // 3. Score Accrual based on Speed & Multiplier
      this.score += (this.player.speed * 0.8 * this.multiplier) * dt;

      // 4. Update City & Weather
      this.city.update(this.player.position.z);
      this.weather.update(dt, this.player.position.z, this.renderer.dirLight, this.renderer.ambientLight);

      // 5. Update AI Traffic
      this.traffic.update(
        dt,
        this.player,
        // On Near Miss
        (trafficCar) => {
          this.nearMissCount++;
          this.multiplier = Math.min(8.0, this.multiplier + 0.5);
          this.comboTimer = this.maxComboTime;
          this.score += 500 * this.multiplier;
          this.renderer.addShake(0.2);
          this.audio.playNearMiss();
          this.hud.showAnnouncer('NEAR MISS!', `+${Math.floor(500 * this.multiplier)} PTS (x${this.multiplier.toFixed(1)})`);
        },
        // On Direct Collision
        (trafficCar) => {
          this.renderer.addShake(0.8);
          const taken = this.player.takeDamage(35);
          if (taken) {
            this.audio.playCrash();
            this.multiplier = 1.0;
            this.player.speed *= 0.4;
          } else {
            this.audio.playPickup();
            this.hud.showAnnouncer('SHIELD ABSORBED IMPACT', '');
          }

          if (this.player.health <= 0) {
            this.gameOver();
          }
        }
      );

      // 6. Update Pickups
      this.pickups.update(
        dt,
        this.player,
        (pickup) => {
          this.audio.playPickup();
          if (pickup.type === 'nitro') {
            this.player.nitro = Math.min(this.player.maxNitro, this.player.nitro + 45);
            this.hud.showAnnouncer('NITRO RECHARGED', '+45% BOOST');
          } else if (pickup.type === 'multiplier') {
            this.multiplier = Math.min(8.0, this.multiplier + 1.0);
            this.comboTimer = this.maxComboTime;
            this.hud.showAnnouncer('MULTIPLIER BOOST!', `x${this.multiplier.toFixed(1)} ACTIVE`);
          } else if (pickup.type === 'shield') {
            this.player.activateShield(2);
            this.hud.showAnnouncer('MAGNETIC SHIELD', '2 CHARGES ACTIVE');
          }
        }
      );

      // 7. Update Audio Synthesizer
      this.audio.updateEngine(this.player.speedKmh, this.player.maxBaseSpeed * 3.6, this.player.isNitroActive);

      // 8. Update HUD
      const comboRatio = this.multiplier > 1.0 ? (this.comboTimer / this.maxComboTime) : 0;
      this.hud.update(
        this.player,
        this.score,
        this.multiplier,
        comboRatio,
        this.distanceTraveled,
        this.renderer.cameraMode,
        this.traffic.vehicles
      );

    } else if (this.state === 'MENU' || this.state === 'PAUSED') {
      // Gentle menu camera rotation & idle city update
      this.weather.update(dt, this.player.position.z, this.renderer.dirLight, this.renderer.ambientLight);
    }

    // Always update camera & render 3D scene
    this.renderer.updateCamera(dt, this.player);
    this.renderer.render();
  }
}

// Bootstrap game on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new CyberDriftGame();
});
