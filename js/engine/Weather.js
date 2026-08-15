/**
 * CyberDrift 3D - Atmospheric Weather Engine
 * Lead Developer: Yashpreet Singh
 */

import * as THREE from 'three';

export class WeatherEngine {
  constructor(scene, audioEngine) {
    this.scene = scene;
    this.audioEngine = audioEngine;
    this.currentMode = 'dynamic'; // 'rain', 'night', 'sunset', 'storm', 'dynamic'
    this.activePreset = 'night';

    this.rainParticles = null;
    this.rainCount = 1800;
    this.rainGeometry = null;

    this.lightningTimer = 0;
    this.weatherCycleTimer = 0;
    this.cycleInterval = 45; // Switch weather every 45s in dynamic mode

    this.screenFlashEl = document.getElementById('lightning-flash');
    this.rainOverlayEl = document.getElementById('rain-droplets');
    this.weatherNameEl = document.getElementById('hud-weather-name');

    this.presets = {
      night: {
        name: 'NEON NIGHT',
        fogColor: 0x070912,
        fogDensity: 0.0035,
        ambientColor: 0x1a2238,
        ambientIntensity: 0.8,
        dirLightColor: 0x00f3ff,
        dirLightIntensity: 1.2,
        hasRain: false
      },
      rain: {
        name: 'CYBER RAIN',
        fogColor: 0x05070c,
        fogDensity: 0.0055,
        ambientColor: 0x101524,
        ambientIntensity: 0.6,
        dirLightColor: 0x00a8ff,
        dirLightIntensity: 0.9,
        hasRain: true
      },
      sunset: {
        name: 'SYNTH SUNSET',
        fogColor: 0x24081e,
        fogDensity: 0.004,
        ambientColor: 0x3d1428,
        ambientIntensity: 1.1,
        dirLightColor: 0xffaa00,
        dirLightIntensity: 1.6,
        hasRain: false
      },
      storm: {
        name: 'THUNDER STORM',
        fogColor: 0x020306,
        fogDensity: 0.0065,
        ambientColor: 0x0a0d18,
        ambientIntensity: 0.4,
        dirLightColor: 0x88bbff,
        dirLightIntensity: 0.6,
        hasRain: true
      }
    };

    this.initRain();
    this.applyPreset('night');
  }

  initRain() {
    const rainPositions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 80;
      rainPositions[i * 3 + 1] = Math.random() * 40;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }

    this.rainGeometry = new THREE.BufferGeometry();
    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMaterial = new THREE.PointsMaterial({
      color: 0x99ccff,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.rainParticles = new THREE.Points(this.rainGeometry, rainMaterial);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  setMode(mode) {
    this.currentMode = mode;
    if (mode !== 'dynamic') {
      this.applyPreset(mode);
    }
  }

  applyPreset(presetKey) {
    const preset = this.presets[presetKey];
    if (!preset) return;
    this.activePreset = presetKey;

    if (this.weatherNameEl) {
      this.weatherNameEl.innerText = preset.name;
    }

    // Toggle Rain
    if (this.rainParticles) {
      this.rainParticles.visible = preset.hasRain;
    }
    if (this.rainOverlayEl) {
      this.rainOverlayEl.style.opacity = preset.hasRain ? '0.6' : '0';
    }

    // Adjust Fog
    if (this.scene.fog) {
      this.scene.fog.color.setHex(preset.fogColor);
      this.scene.fog.density = preset.fogDensity;
    }
  }

  update(dt, playerZ, dirLight, ambientLight) {
    // Dynamic Weather cycling
    if (this.currentMode === 'dynamic') {
      this.weatherCycleTimer += dt;
      if (this.weatherCycleTimer > this.cycleInterval) {
        this.weatherCycleTimer = 0;
        const keys = Object.keys(this.presets);
        const nextKey = keys[(keys.indexOf(this.activePreset) + 1) % keys.length];
        this.applyPreset(nextKey);
      }
    }

    const preset = this.presets[this.activePreset];

    // Smooth lighting lerp
    if (dirLight && ambientLight) {
      dirLight.color.lerp(new THREE.Color(preset.dirLightColor), 0.05);
      dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, preset.dirLightIntensity, 0.05);
      ambientLight.color.lerp(new THREE.Color(preset.ambientColor), 0.05);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, preset.ambientIntensity, 0.05);
    }

    // Update Rain Particles around player
    if (preset.hasRain && this.rainParticles) {
      const positions = this.rainGeometry.attributes.position.array;
      for (let i = 0; i < this.rainCount; i++) {
        // Fall down
        positions[i * 3 + 1] -= 65 * dt;

        // Wrap around player's Z location
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 35 + Math.random() * 5;
          positions[i * 3 + 2] = playerZ + (Math.random() - 0.5) * 140;
          positions[i * 3] = (Math.random() - 0.5) * 70;
        }
      }
      this.rainGeometry.attributes.position.needsUpdate = true;
    }

    // Lightning Flash in Storm mode
    if (this.activePreset === 'storm') {
      this.lightningTimer += dt;
      if (this.lightningTimer > 7 + Math.random() * 8) {
        this.lightningTimer = 0;
        this.triggerLightning(dirLight);
      }
    }
  }

  triggerLightning(dirLight) {
    if (this.screenFlashEl) {
      this.screenFlashEl.style.opacity = '1';
      setTimeout(() => {
        if (this.screenFlashEl) this.screenFlashEl.style.opacity = '0';
      }, 120);
    }

    if (dirLight) {
      const originalIntensity = dirLight.intensity;
      dirLight.intensity = 5.0;
      setTimeout(() => {
        dirLight.intensity = originalIntensity;
      }, 150);
    }

    if (this.audioEngine) {
      this.audioEngine.playThunder();
    }
  }
}
