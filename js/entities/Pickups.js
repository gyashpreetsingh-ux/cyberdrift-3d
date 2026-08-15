/**
 * CyberDrift 3D - Pickups & Power-ups Manager
 * Lead Developer: Yashpreet Singh
 */

import * as THREE from 'three';

export class PickupManager {
  constructor(scene) {
    this.scene = scene;
    this.pickups = [];
    this.maxPickups = 8;
    this.lanes = [-9, -3, 3, 9];

    this.types = [
      { type: 'nitro', color: 0x00f3ff, name: 'NITRO BOOST', geometry: new THREE.CylinderGeometry(0.35, 0.35, 1.2, 8) },
      { type: 'multiplier', color: 0xffe600, name: 'SCORE MULTIPLIER', geometry: new THREE.OctahedronGeometry(0.7) },
      { type: 'shield', color: 0x00ff88, name: 'MAGNETIC SHIELD', geometry: new THREE.IcosahedronGeometry(0.65) }
    ];

    this.initPool();
  }

  initPool() {
    for (let i = 0; i < this.maxPickups; i++) {
      const typeData = this.types[i % this.types.length];
      const mat = new THREE.MeshBasicMaterial({
        color: typeData.color,
        wireframe: false
      });
      const mesh = new THREE.Mesh(typeData.geometry, mat);

      // Add a faint glow aura
      const auraMat = new THREE.MeshBasicMaterial({
        color: typeData.color,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const aura = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), auraMat);
      mesh.add(aura);

      mesh.visible = false;
      this.scene.add(mesh);

      this.pickups.push({
        mesh: mesh,
        type: typeData.type,
        name: typeData.name,
        color: typeData.color,
        active: false,
        rotSpeed: 2.5
      });
    }
  }

  spawnAhead(playerZ) {
    const inactive = this.pickups.find(p => !p.active);
    if (!inactive) return;

    const laneIndex = Math.floor(Math.random() * this.lanes.length);
    const laneX = this.lanes[laneIndex];
    const spawnZ = playerZ + 180 + Math.random() * 120;

    inactive.active = true;
    inactive.mesh.visible = true;
    inactive.mesh.position.set(laneX, 1.2, spawnZ);
  }

  update(dt, player, onCollect) {
    const playerZ = player.position.z;

    // Spawning chance
    const activeCount = this.pickups.filter(p => p.active).length;
    if (activeCount < 4 && Math.random() < 0.05) {
      this.spawnAhead(playerZ);
    }

    this.pickups.forEach(p => {
      if (!p.active) return;

      // Animate rotation & bobbing
      p.mesh.rotation.y += p.rotSpeed * dt;
      p.mesh.rotation.x += 1.0 * dt;
      p.mesh.position.y = 1.2 + Math.sin(Date.now() * 0.005) * 0.25;

      // Check collision with player
      const dx = Math.abs(player.position.x - p.mesh.position.x);
      const dz = Math.abs(player.position.z - p.mesh.position.z);

      if (dx < 2.0 && dz < 2.5) {
        // Collected!
        p.active = false;
        p.mesh.visible = false;
        onCollect(p);
        return;
      }

      // Despawn if passed
      if (p.mesh.position.z < playerZ - 20) {
        p.active = false;
        p.mesh.visible = false;
      }
    });
  }

  reset() {
    this.pickups.forEach(p => {
      p.active = false;
      p.mesh.visible = false;
    });
  }
}
