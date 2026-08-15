/**
 * CyberDrift 3D - AI Traffic Vehicles
 * Lead Developer: Yashpreet Singh
 */

import * as THREE from 'three';

export class TrafficManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];
    this.maxVehicles = 16;
    this.lanes = [-9, -3, 3, 9];
    this.spawnDistanceAhead = 200;
    this.despawnDistanceBehind = 40;

    // Vehicle Color options
    this.vehicleColors = [
      0xff0055, 0x00f3ff, 0xffe600, 0x9900ff, 0x00ff88, 0xff5500, 0xdddddd, 0x222222
    ];

    this.initPool();
  }

  initPool() {
    for (let i = 0; i < this.maxVehicles; i++) {
      const v = this.createVehicleMesh(i % 3);
      v.active = false;
      v.mesh.visible = false;
      this.vehicles.push(v);
      this.scene.add(v.mesh);
    }
  }

  createVehicleMesh(typeIndex) {
    const group = new THREE.Group();
    let length = 4.2;
    let width = 2.0;
    let height = 0.85;

    if (typeIndex === 2) {
      // Cyber Truck / Heavy Hauler
      length = 7.5;
      width = 2.4;
      height = 2.2;
    }

    const color = this.vehicleColors[Math.floor(Math.random() * this.vehicleColors.length)];
    const bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.7,
      roughness: 0.3
    });

    const bodyGeo = new THREE.BoxGeometry(width, height, length);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = height / 2 + 0.2;
    body.castShadow = true;
    group.add(body);

    // Cab / Window
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x080c14 });
    const glassGeo = new THREE.BoxGeometry(width * 0.9, height * 0.5, length * 0.45);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, height * 0.85 + 0.2, 0);
    group.add(glass);

    // Taillights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const tailGeo = new THREE.BoxGeometry(width * 0.85, 0.15, 0.1);
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, height * 0.5 + 0.2, -length / 2 - 0.05);
    group.add(tail);

    // Headlights
    const headMat = new THREE.MeshBasicMaterial({ color: 0xffffdd });
    const headGeo = new THREE.BoxGeometry(width * 0.85, 0.15, 0.1);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, height * 0.5 + 0.2, length / 2 + 0.05);
    group.add(head);

    return {
      mesh: group,
      active: false,
      speed: 15, // m/s
      lane: 0,
      targetLaneX: 0,
      length: length,
      width: width,
      height: height,
      nearMissChecked: false,
      laneChangeTimer: Math.random() * 8 + 4
    };
  }

  spawnAhead(playerZ) {
    const inactive = this.vehicles.find(v => !v.active);
    if (!inactive) return;

    // Pick random lane
    const laneIndex = Math.floor(Math.random() * this.lanes.length);
    const laneX = this.lanes[laneIndex];

    // Check if lane is too crowded at spawn distance
    const spawnZ = playerZ + this.spawnDistanceAhead + Math.random() * 80;
    const isObstructed = this.vehicles.some(v => v.active && Math.abs(v.mesh.position.z - spawnZ) < 25 && Math.abs(v.mesh.position.x - laneX) < 3);

    if (isObstructed) return;

    inactive.active = true;
    inactive.mesh.visible = true;
    inactive.mesh.position.set(laneX, 0, spawnZ);
    inactive.lane = laneIndex;
    inactive.targetLaneX = laneX;
    inactive.speed = THREE.MathUtils.randFloat(18, 38); // 65 - 135 KM/H
    inactive.nearMissChecked = false;
    inactive.laneChangeTimer = THREE.MathUtils.randFloat(5, 12);
  }

  update(dt, player, onNearMiss, onCollision) {
    const playerZ = player.position.z;

    // Spawning logic
    const activeCount = this.vehicles.filter(v => v.active).length;
    if (activeCount < this.maxVehicles && Math.random() < 0.12) {
      this.spawnAhead(playerZ);
    }

    this.vehicles.forEach(v => {
      if (!v.active) return;

      // Move vehicle forward
      v.mesh.position.z += v.speed * dt;

      // AI Lane changing
      v.laneChangeTimer -= dt;
      if (v.laneChangeTimer <= 0) {
        v.laneChangeTimer = THREE.MathUtils.randFloat(6, 15);
        // Switch to adjacent lane
        const step = Math.random() > 0.5 ? 1 : -1;
        const newLane = Math.max(0, Math.min(this.lanes.length - 1, v.lane + step));
        v.lane = newLane;
        v.targetLaneX = this.lanes[newLane];
      }

      // Smooth lateral movement towards target lane
      v.mesh.position.x = THREE.MathUtils.lerp(v.mesh.position.x, v.targetLaneX, 0.05);

      // 1. Collision Check with Player
      const dx = Math.abs(player.position.x - v.mesh.position.x);
      const dz = Math.abs(player.position.z - v.mesh.position.z);
      const hitX = (player.mesh.children[0]?.geometry?.parameters?.width || 2.1) / 2 + v.width / 2 - 0.2;
      const hitZ = 4.4 / 2 + v.length / 2 - 0.4;

      if (dx < hitX && dz < hitZ) {
        // Direct crash impact!
        v.active = false;
        v.mesh.visible = false;
        onCollision(v);
        return;
      }

      // 2. Near-Miss Check (Passing close at high relative speed)
      if (!v.nearMissChecked && dz < 4.0 && dx < 3.2 && dx > hitX && player.speed > v.speed + 10) {
        v.nearMissChecked = true;
        onNearMiss(v);
      }

      // 3. Despawn when out of view
      if (v.mesh.position.z < playerZ - this.despawnDistanceBehind || v.mesh.position.z > playerZ + this.spawnDistanceAhead + 120) {
        v.active = false;
        v.mesh.visible = false;
      }
    });
  }

  reset() {
    this.vehicles.forEach(v => {
      v.active = false;
      v.mesh.visible = false;
    });
  }
}
