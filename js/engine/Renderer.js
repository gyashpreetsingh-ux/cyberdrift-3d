/**
 * CyberDrift 3D - Scene, Camera & Lighting Engine
 * Lead Developer: Yashpreet Singh
 */

import * as THREE from 'three';

export class SceneRenderer {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070912, 0.0035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(62, this.width / this.height, 0.1, 800);
    this.cameraMode = 'chase'; // 'chase', 'cockpit', 'cinematic'
    this.baseFov = 62;

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.ambientLight = new THREE.AmbientLight(0x1a2238, 0.8);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0x00f3ff, 1.2);
    this.dirLight.position.set(20, 45, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);

    // Camera Shake
    this.shakeIntensity = 0;
    this.speedLinesEl = document.getElementById('speed-lines');

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  cycleCamera() {
    const modes = ['chase', 'cockpit', 'cinematic'];
    const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
    this.cameraMode = modes[nextIdx];
    return this.cameraMode;
  }

  addShake(amount = 0.4) {
    this.shakeIntensity = Math.min(1.0, this.shakeIntensity + amount);
  }

  updateCamera(dt, player) {
    const speedRatio = player.speed / player.maxBaseSpeed;

    // Dynamic FOV stretching on high speed / Nitro
    const targetFov = this.baseFov + (player.isNitroActive ? 18 : speedRatio * 8);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 0.1);
    this.camera.updateProjectionMatrix();

    // Speed lines overlay
    if (this.speedLinesEl) {
      this.speedLinesEl.style.opacity = player.isNitroActive || speedRatio > 1.1 ? '0.7' : (speedRatio > 0.8 ? '0.3' : '0');
    }

    // Camera Positioning Modes
    if (this.cameraMode === 'chase') {
      const targetPos = new THREE.Vector3(
        player.position.x * 0.75,
        player.position.y + 3.2 + (player.isNitroActive ? -0.2 : 0),
        player.position.z - 8.5
      );
      this.camera.position.lerp(targetPos, 0.12);

      const lookTarget = new THREE.Vector3(player.position.x * 0.4, player.position.y + 1.2, player.position.z + 18);
      this.camera.lookAt(lookTarget);

    } else if (this.cameraMode === 'cockpit') {
      this.camera.position.set(
        player.position.x,
        player.position.y + 1.05,
        player.position.z + 0.2
      );
      const lookTarget = new THREE.Vector3(player.position.x, player.position.y + 1.0, player.position.z + 50);
      this.camera.lookAt(lookTarget);

    } else if (this.cameraMode === 'cinematic') {
      const targetPos = new THREE.Vector3(
        player.position.x + 5.5,
        player.position.y + 1.8,
        player.position.z - 4.5
      );
      this.camera.position.lerp(targetPos, 0.08);
      this.camera.lookAt(player.position.x, player.position.y + 0.6, player.position.z + 10);
    }

    // Apply Camera Shake / Road Vibration
    if (this.shakeIntensity > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity * 0.4;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity * 0.4;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - 3.5 * dt);
    }

    // Sync Directional Light with Player
    this.dirLight.position.set(player.position.x + 20, 45, player.position.z + 20);
    this.dirLight.target = player.mesh;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
