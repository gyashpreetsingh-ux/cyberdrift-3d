/**
 * CyberDrift 3D - High-Tech Player Cybercar
 * Lead Developer: Yashpreet Singh
 */

import * as THREE from 'three';

export class PlayerCar {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // Physics & Movement State
    this.position = new THREE.Vector3(0, 0.4, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 0; // Current speed in m/s
    this.speedKmh = 0;
    this.maxBaseSpeed = 70; // ~250 KM/H
    this.maxSpeed = 70;
    this.nitroMaxSpeed = 98; // ~350 KM/H
    this.acceleration = 35;
    this.braking = 55;
    this.handling = 18;
    this.steerAngle = 0;
    this.rollAngle = 0;

    // Nitro System
    this.nitro = 100;
    this.maxNitro = 100;
    this.isNitroActive = false;
    this.nitroConsumption = 28; // % per second
    this.nitroRecharge = 10; // % per second passive

    // Health & Shield
    this.health = 100;
    this.maxHealth = 100;
    this.hasShield = false;
    this.shieldHits = 0;

    // Customization Colors
    this.bodyColor = '#00f3ff';
    this.underglowColor = '#00f3ff';
    this.carModelType = 'specter';

    // Meshes & Materials references
    this.bodyMesh = null;
    this.wheels = [];
    this.taillightMesh = null;
    this.headlights = [];
    this.underglowMesh = null;
    this.nitroFlames = [];
    this.shieldMesh = null;

    // Upgrades state
    this.engineLevel = 1;
    this.nitroLevel = 1;
    this.armorLevel = 1;

    this.buildCar();
    this.scene.add(this.mesh);
  }

  buildCar() {
    // Clear previous mesh children if rebuilding
    while (this.mesh.children.length > 0) {
      this.mesh.remove(this.mesh.children[0]);
    }
    this.wheels = [];
    this.nitroFlames = [];

    // Main Chassis Body
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.65, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.bodyColor),
      metalness: 0.85,
      roughness: 0.2
    });
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = 0.5;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // Aerodynamic Nose / Hood Slope
    const hoodGeo = new THREE.BoxGeometry(1.95, 0.35, 1.6);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
    hoodMesh.position.set(0, 0.42, 1.4);
    hoodMesh.rotation.x = 0.12;
    this.mesh.add(hoodMesh);

    // Cabin / Windshield Glass
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.55, 2.0);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050a15,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 0.95, -0.2);
    this.mesh.add(cabinMesh);

    // Rear Spoiler
    const spoilerWingGeo = new THREE.BoxGeometry(2.2, 0.08, 0.5);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    const spoilerWing = new THREE.Mesh(spoilerWingGeo, spoilerMat);
    spoilerWing.position.set(0, 1.15, -1.9);
    this.mesh.add(spoilerWing);

    [-0.8, 0.8].forEach(sx => {
      const standGeo = new THREE.BoxGeometry(0.08, 0.45, 0.2);
      const stand = new THREE.Mesh(standGeo, spoilerMat);
      stand.position.set(sx, 0.95, -1.9);
      this.mesh.add(stand);
    });

    // 4 Wheels
    const wheelPositions = [
      { x: -1.05, y: 0.35, z: 1.3 },
      { x: 1.05, y: 0.35, z: 1.3 },
      { x: -1.05, y: 0.35, z: -1.3 },
      { x: 1.05, y: 0.35, z: -1.3 }
    ];

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const rimMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.underglowColor) });

    wheelPositions.forEach((pos, idx) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);

      const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 16);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      wheelGroup.add(tire);

      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.34, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(rim);

      this.mesh.add(wheelGroup);
      this.wheels.push({ group: wheelGroup, isFront: idx < 2 });
    });

    // Headlights (Front LED)
    [-0.7, 0.7].forEach(hx => {
      const lightMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.12, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      lightMesh.position.set(hx, 0.55, 2.22);
      this.mesh.add(lightMesh);
    });

    // Taillights (Rear Neon Bar)
    const tailGeo = new THREE.BoxGeometry(1.8, 0.12, 0.1);
    this.taillightMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    this.taillightMesh = new THREE.Mesh(tailGeo, this.taillightMat);
    this.taillightMesh.position.set(0, 0.6, -2.22);
    this.mesh.add(this.taillightMesh);

    // Neon Underglow Plane
    const underglowGeo = new THREE.PlaneGeometry(2.6, 4.8);
    this.underglowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.underglowColor),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    this.underglowMesh = new THREE.Mesh(underglowGeo, this.underglowMat);
    this.underglowMesh.rotation.x = -Math.PI / 2;
    this.underglowMesh.position.y = 0.08;
    this.mesh.add(this.underglowMesh);

    // Nitro Exhaust Thruster Flames
    [-0.45, 0.45].forEach(ex => {
      const flameGeo = new THREE.ConeGeometry(0.18, 0.9, 8);
      flameGeo.rotateX(-Math.PI / 2);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(ex, 0.45, -2.55);
      this.mesh.add(flame);
      this.nitroFlames.push(flame);
    });

    // Shield Aura Sphere
    const shieldGeo = new THREE.SphereGeometry(2.8, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 0.6, 0);
    this.shieldMesh.visible = false;
    this.mesh.add(this.shieldMesh);
  }

  setColors(paintColor, underglowColor) {
    this.bodyColor = paintColor;
    this.underglowColor = underglowColor;
    if (this.bodyMesh) {
      this.bodyMesh.material.color.set(paintColor);
    }
    if (this.underglowMat) {
      this.underglowMat.color.set(underglowColor);
    }
  }

  activateShield(hits = 2) {
    this.hasShield = true;
    this.shieldHits = hits;
    if (this.shieldMesh) this.shieldMesh.visible = true;

    const overlay = document.getElementById('shield-active-overlay');
    if (overlay) overlay.style.opacity = '0.8';
  }

  takeDamage(amount = 25) {
    if (this.hasShield) {
      this.shieldHits--;
      if (this.shieldHits <= 0) {
        this.hasShield = false;
        if (this.shieldMesh) this.shieldMesh.visible = false;
        const overlay = document.getElementById('shield-active-overlay');
        if (overlay) overlay.style.opacity = '0';
      }
      return false; // Absorbed by shield
    }

    this.health = Math.max(0, this.health - amount);
    // Flash damage vignette
    const vignette = document.getElementById('damage-vignette');
    if (vignette) {
      vignette.style.opacity = '1';
      setTimeout(() => { vignette.style.opacity = '0'; }, 200);
    }
    return true; // Damage taken
  }

  update(dt, input) {
    // Top Speed adjustment based on Upgrades
    const engineBoost = (this.engineLevel - 1) * 5; // +5 m/s per level
    const currentMax = (this.maxBaseSpeed + engineBoost) * (this.isNitroActive ? 1.4 : 1.0);

    // Throttle & Acceleration
    if (input.up) {
      this.speed = Math.min(currentMax, this.speed + this.acceleration * dt);
    } else if (input.down) {
      // Braking
      this.speed = Math.max(0, this.speed - this.braking * dt);
      if (this.taillightMat) this.taillightMat.color.setHex(0xff0000);
    } else {
      // Natural Deceleration / Rolling resistance
      this.speed = Math.max(0, this.speed - 12 * dt);
      if (this.taillightMat) this.taillightMat.color.setHex(0x880022);
    }

    // Nitro Activation
    if (input.nitro && this.nitro > 5 && this.speed > 10) {
      this.isNitroActive = true;
      const consumption = this.nitroConsumption / (1 + (this.nitroLevel - 1) * 0.15);
      this.nitro = Math.max(0, this.nitro - consumption * dt);
      this.speed = Math.min(this.nitroMaxSpeed + engineBoost, this.speed + 45 * dt);

      // Nitro Flame Visuals
      this.nitroFlames.forEach(flame => {
        flame.material.opacity = 0.9;
        flame.scale.set(1 + Math.random() * 0.4, 1 + Math.random() * 0.6, 1);
      });
    } else {
      this.isNitroActive = false;
      // Passive recharge
      this.nitro = Math.min(this.maxNitro, this.nitro + this.nitroRecharge * dt);
      this.nitroFlames.forEach(flame => {
        flame.material.opacity = 0;
      });
    }

    // Steering
    let steerDelta = 0;
    if (input.left) steerDelta -= 1;
    if (input.right) steerDelta += 1;

    const speedFactor = Math.min(1.0, this.speed / 20);
    this.position.x += steerDelta * this.handling * speedFactor * dt;

    // Highway boundaries clamp
    this.position.x = Math.max(-10.5, Math.min(10.5, this.position.x));

    // Forward translation
    this.position.z += this.speed * dt;

    // Body Tilt & Roll (Chassis suspension feel)
    const targetRoll = -steerDelta * 0.08;
    this.rollAngle = THREE.MathUtils.lerp(this.rollAngle, targetRoll, 0.15);
    this.mesh.rotation.z = this.rollAngle;

    const targetSteerAngle = -steerDelta * 0.06;
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteerAngle, 0.2);
    this.mesh.rotation.y = this.steerAngle;

    // Sync mesh position
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    // Rotate Wheels
    const wheelRotSpeed = (this.speed / 0.38) * dt;
    this.wheels.forEach(w => {
      w.group.rotation.x += wheelRotSpeed;
      if (w.isFront) {
        w.group.rotation.y = steerDelta * 0.35;
      }
    });

    // Calculate Speed KM/H
    this.speedKmh = Math.round(this.speed * 3.6);
  }

  reset() {
    this.position.set(0, 0.4, 0);
    this.mesh.position.set(0, 0.4, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.speed = 0;
    this.speedKmh = 0;
    this.nitro = 100;
    this.health = 100;
    this.hasShield = false;
    if (this.shieldMesh) this.shieldMesh.visible = false;
  }
}
