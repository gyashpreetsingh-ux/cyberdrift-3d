/**
 * CyberDrift 3D - Procedural Metropolis & Highway Generator
 * Lead Developer: Yashpreet Singh
 */

import * as THREE from 'three';

export class CityEngine {
  constructor(scene) {
    this.scene = scene;
    this.roadChunks = [];
    this.chunkLength = 120;
    this.numChunks = 6;
    this.roadWidth = 24; // 4 lanes
    this.currentChunkZ = 0;

    // Train System
    this.trains = [];

    // Billboard Textures cache
    this.billboardTextures = [];
    this.initBillboardTextures();

    // Reusable Materials
    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x11131a,
      roughness: 0.25,
      metalness: 0.75
    });

    this.buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x0a0d16, roughness: 0.5, metalness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x121728, roughness: 0.4, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x060810, roughness: 0.6, metalness: 0.4 })
    ];

    this.neonMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x00f3ff }),
      new THREE.MeshBasicMaterial({ color: 0xff0055 }),
      new THREE.MeshBasicMaterial({ color: 0xffe600 }),
      new THREE.MeshBasicMaterial({ color: 0x00ff66 }),
      new THREE.MeshBasicMaterial({ color: 0xb000ff })
    ];

    this.initRoadChunks();
  }

  // Create high-res canvas billboard textures
  initBillboardTextures() {
    const banners = [
      { main: 'DEVELOPED BY', sub: 'YASHPREET SINGH', color: '#ffe600', border: '#00f3ff', tag: 'LEAD CREATOR' },
      { main: 'NEO TOKYO', sub: 'OVERDRIVE 2099', color: '#00f3ff', border: '#ff0055', tag: 'SECTOR 07' },
      { main: 'YASHPREET', sub: 'CYBER LABS', color: '#00ff66', border: '#ffe600', tag: 'INNOVATION HUB' },
      { main: 'QUANTUM NITRO', sub: 'MAX ACCELERATION', color: '#ff0055', border: '#00f3ff', tag: 'WARP BOOST' },
      { main: 'SPEED LIMIT', sub: 'UNLIMITED', color: '#00f3ff', border: '#ffe600', tag: 'EXPRESSWAY' }
    ];

    banners.forEach((data) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#060810';
      ctx.fillRect(0, 0, 512, 256);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }

      // Cyber Border
      ctx.strokeStyle = data.border;
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, 492, 236);

      // Top Tag
      ctx.fillStyle = data.border;
      ctx.font = 'bold 20px Orbitron, sans-serif';
      ctx.fillText(`// ${data.tag} //`, 30, 45);

      // Main Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Orbitron, sans-serif';
      ctx.fillText(data.main, 30, 110);

      // Sub Text / Yashpreet Signature
      ctx.fillStyle = data.color;
      ctx.font = '900 48px Orbitron, sans-serif';
      ctx.shadowColor = data.color;
      ctx.shadowBlur = 20;
      ctx.fillText(data.sub, 30, 180);

      const texture = new THREE.CanvasTexture(canvas);
      this.billboardTextures.push(texture);
    });
  }

  initRoadChunks() {
    for (let i = 0; i < this.numChunks; i++) {
      const chunk = this.createChunk(i * this.chunkLength);
      this.roadChunks.push(chunk);
      this.scene.add(chunk.group);
    }
  }

  createChunk(zPos) {
    const group = new THREE.Group();
    group.position.z = zPos;

    // 1. Road Surface Mesh
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.chunkLength);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // 2. Lane Markings
    const lanePositions = [-6, 0, 6];
    lanePositions.forEach(lx => {
      const numDashes = 10;
      for (let d = 0; d < numDashes; d++) {
        const dashGeo = new THREE.PlaneGeometry(0.35, 4.5);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(lx, 0.02, -this.chunkLength / 2 + d * (this.chunkLength / numDashes) + 3);
        group.add(dash);
      }
    });

    // 3. Glowing Outer Road Borders
    [-this.roadWidth / 2, this.roadWidth / 2].forEach(bx => {
      const borderGeo = new THREE.BoxGeometry(0.6, 0.4, this.chunkLength);
      const borderMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.set(bx, 0.2, 0);
      group.add(border);
    });

    // 4. City Skyscrapers along Highway
    const buildings = this.generateBuildingsForChunk();
    buildings.forEach(b => group.add(b));

    // 5. Overhead Highway Gantry / Billboard
    if (Math.random() > 0.3) {
      const gantry = this.createGantry();
      group.add(gantry);
    }

    // 6. Street Lighting Poles
    for (let lz = -this.chunkLength / 2 + 15; lz < this.chunkLength / 2; lz += 30) {
      const lampLeft = this.createStreetLamp(-this.roadWidth / 2 - 1.5, lz, false);
      const lampRight = this.createStreetLamp(this.roadWidth / 2 + 1.5, lz, true);
      group.add(lampLeft);
      group.add(lampRight);
    }

    return { group, z: zPos };
  }

  createStreetLamp(x, z, flip) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, 0, z);

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x222233 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 4;
    lampGroup.add(pole);

    // Light Arm
    const armGeo = new THREE.BoxGeometry(flip ? -2.5 : 2.5, 0.15, 0.15);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(flip ? -1.25 : 1.25, 7.9, 0);
    lampGroup.add(arm);

    // Light Emitter
    const emitterGeo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
    const emitterMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.set(flip ? -2.2 : 2.2, 7.7, 0);
    lampGroup.add(emitter);

    return lampGroup;
  }

  createGantry() {
    const gantryGroup = new THREE.Group();
    const gantryHeight = 9;

    // Cross beam
    const beamGeo = new THREE.BoxGeometry(this.roadWidth + 4, 0.8, 1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x222638, metalness: 0.8 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, gantryHeight, 0);
    gantryGroup.add(beam);

    // Support pillars
    [-this.roadWidth / 2 - 2, this.roadWidth / 2 + 2].forEach(px => {
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, gantryHeight);
      const pillar = new THREE.Mesh(pillarGeo, beamMat);
      pillar.position.set(px, gantryHeight / 2, 0);
      gantryGroup.add(pillar);
    });

    // Billboard attached to Gantry
    const bbGeo = new THREE.PlaneGeometry(14, 4.5);
    const randomTex = this.billboardTextures[Math.floor(Math.random() * this.billboardTextures.length)];
    const bbMat = new THREE.MeshBasicMaterial({ map: randomTex, side: THREE.DoubleSide });
    const bbMesh = new THREE.Mesh(bbGeo, bbMat);
    bbMesh.position.set(0, gantryHeight + 0.5, 0.6);
    gantryGroup.add(bbMesh);

    return gantryGroup;
  }

  generateBuildingsForChunk() {
    const list = [];
    const sides = [-1, 1];

    sides.forEach(side => {
      const numTowers = 5;
      for (let i = 0; i < numTowers; i++) {
        const height = THREE.MathUtils.randFloat(30, 95);
        const width = THREE.MathUtils.randFloat(15, 28);
        const depth = THREE.MathUtils.randFloat(15, 28);

        const bGeo = new THREE.BoxGeometry(width, height, depth);
        const bMat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];
        const tower = new THREE.Mesh(bGeo, bMat);

        const xPos = side * (this.roadWidth / 2 + width / 2 + THREE.MathUtils.randFloat(3, 20));
        const zPos = -this.chunkLength / 2 + (i / numTowers) * this.chunkLength + THREE.MathUtils.randFloat(-5, 5);
        tower.position.set(xPos, height / 2, zPos);
        list.push(tower);

        // Neon Billboard on Tower facade
        if (Math.random() > 0.4) {
          const bbGeo = new THREE.PlaneGeometry(16, 8);
          const randomTex = this.billboardTextures[Math.floor(Math.random() * this.billboardTextures.length)];
          const bbMat = new THREE.MeshBasicMaterial({ map: randomTex });
          const bb = new THREE.Mesh(bbGeo, bbMat);

          bb.position.set(xPos - (side * (width / 2 + 0.1)), height * 0.6, zPos);
          bb.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
          list.push(bb);
        }

        // Rooftop Neon Antenna
        const antGeo = new THREE.CylinderGeometry(0.1, 0.3, 12);
        const ant = new THREE.Mesh(antGeo, this.neonMaterials[0]);
        ant.position.set(xPos, height + 6, zPos);
        list.push(ant);

        // Warning Light on top
        const warnGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const warnMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        const warn = new THREE.Mesh(warnGeo, warnMat);
        warn.position.set(xPos, height + 12, zPos);
        list.push(warn);
      }
    });

    return list;
  }

  update(playerZ) {
    // Check if player has advanced past the earliest chunk
    const sorted = [...this.roadChunks].sort((a, b) => a.group.position.z - b.group.position.z);
    const firstChunk = sorted[0];

    if (playerZ > firstChunk.group.position.z + this.chunkLength * 1.5) {
      // Recycle first chunk to the front
      const lastChunk = sorted[sorted.length - 1];
      const newZ = lastChunk.group.position.z + this.chunkLength;
      firstChunk.group.position.z = newZ;
      firstChunk.z = newZ;
    }
  }
}
