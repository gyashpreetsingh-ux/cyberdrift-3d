/**
 * CyberDrift 3D - High-Tech Glassmorphism HUD & Radar Manager
 * Lead Developer: Yashpreet Singh
 */

export class HUD {
  constructor() {
    this.scoreEl = document.getElementById('hud-score');
    this.multiplierEl = document.getElementById('hud-multiplier');
    this.comboBarFill = document.getElementById('combo-bar-fill');
    this.distanceEl = document.getElementById('hud-distance');
    this.speedEl = document.getElementById('hud-speed');
    this.gearEl = document.getElementById('hud-gear');
    this.tachoFill = document.getElementById('tacho-fill');
    this.nitroValEl = document.getElementById('hud-nitro-val');
    this.nitroBarFill = document.getElementById('nitro-bar-fill');
    this.healthValEl = document.getElementById('hud-health-val');
    this.healthBarFill = document.getElementById('health-bar-fill');
    this.cameraNameEl = document.getElementById('hud-camera-name');

    // Announcer
    this.announcerContainer = document.getElementById('hud-announcer');
    this.announcerText = document.getElementById('announcer-text');
    this.announcerSub = document.getElementById('announcer-sub');
    this.announcerTimeout = null;

    // Mini Radar Canvas
    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;
  }

  showAnnouncer(title, sub = '') {
    if (!this.announcerContainer) return;
    this.announcerText.innerText = title;
    this.announcerSub.innerText = sub;

    this.announcerContainer.classList.remove('active');
    void this.announcerContainer.offsetWidth; // Trigger DOM reflow
    this.announcerContainer.classList.add('active');

    if (this.announcerTimeout) clearTimeout(this.announcerTimeout);
    this.announcerTimeout = setTimeout(() => {
      if (this.announcerContainer) this.announcerContainer.classList.remove('active');
    }, 1800);
  }

  update(player, score, multiplier, comboRatio, distanceMeters, cameraMode, trafficVehicles) {
    // 1. Score & Multiplier
    if (this.scoreEl) {
      this.scoreEl.innerText = Math.floor(score).toString().padStart(6, '0');
    }
    if (this.multiplierEl) {
      this.multiplierEl.innerText = `x${multiplier.toFixed(1)}`;
    }
    if (this.comboBarFill) {
      this.comboBarFill.style.width = `${Math.min(100, comboRatio * 100)}%`;
    }

    // 2. Distance
    if (this.distanceEl) {
      this.distanceEl.innerText = `${(distanceMeters / 1000).toFixed(1)} KM`;
    }

    // 3. Speed & Tachometer
    const speedKmh = player.speedKmh;
    if (this.speedEl) {
      this.speedEl.innerText = speedKmh;
    }

    // Dynamic Gear calculation
    let gear = 1;
    if (speedKmh > 270) gear = 6;
    else if (speedKmh > 210) gear = 5;
    else if (speedKmh > 150) gear = 4;
    else if (speedKmh > 90) gear = 3;
    else if (speedKmh > 40) gear = 2;

    if (this.gearEl) {
      this.gearEl.innerText = gear;
    }

    if (this.tachoFill) {
      const rpmRatio = Math.min(1.0, (speedKmh % 60) / 60 + 0.2);
      this.tachoFill.style.width = `${rpmRatio * 100}%`;
    }

    // 4. Nitro Bar
    if (this.nitroValEl && this.nitroBarFill) {
      const nitroPct = Math.round((player.nitro / player.maxNitro) * 100);
      this.nitroValEl.innerText = `${nitroPct}%`;
      this.nitroBarFill.style.width = `${nitroPct}%`;
    }

    // 5. Health Bar
    if (this.healthValEl && this.healthBarFill) {
      const healthPct = Math.round((player.health / player.maxHealth) * 100);
      this.healthValEl.innerText = `${healthPct}%`;
      this.healthBarFill.style.width = `${healthPct}%`;
    }

    // 6. Camera Name
    if (this.cameraNameEl) {
      this.cameraNameEl.innerText = cameraMode.toUpperCase();
    }

    // 7. Radar Render
    this.drawRadar(player, trafficVehicles);
  }

  drawRadar(player, trafficVehicles) {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const rangeZ = 160;
    const rangeX = 14;

    ctx.clearRect(0, 0, w, h);

    // Draw radar sweep ring
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Player icon (Center Cyan Dot)
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.arc(cx, cy + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw traffic vehicles
    if (trafficVehicles) {
      trafficVehicles.forEach(v => {
        if (!v.active) return;
        const relZ = v.mesh.position.z - player.position.z;
        const relX = v.mesh.position.x - player.position.x;

        if (relZ > -20 && relZ < rangeZ) {
          const mapX = cx + (relX / rangeX) * (cx * 0.7);
          const mapY = (cy + 15) - (relZ / rangeZ) * (h * 0.7);

          ctx.fillStyle = '#ff0055';
          ctx.beginPath();
          ctx.arc(mapX, mapY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }
}
