/**
 * CyberDrift 3D - Math & Utility Helpers
 * Lead Developer: Yashpreet Singh
 */

export const MathUtils = {
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  },

  damp(target, current, smoothing, dt) {
    return this.lerp(current, target, 1 - Math.exp(-smoothing * dt));
  },

  randFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  dist2D(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
  },

  formatScore(num) {
    return Math.floor(num).toString().padStart(6, '0');
  },

  formatDistance(meters) {
    return (meters / 1000).toFixed(1) + ' KM';
  }
};
