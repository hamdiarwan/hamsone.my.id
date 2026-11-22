import * as THREE from './assets/vendor/three.module.min.js';
import { RoundedBoxGeometry } from './assets/vendor/RoundedBoxGeometry.js';

// Shared toy-building primitives. Geometries and materials are reused within
// each scene; the avatar is separate from the desk for a future standing pose.
export function createToyKit() {
  const geometries = new Map();
  const materials = new Map();
  function material(color, roughness = 0.8) {
    const key = `${color}:${roughness}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness }));
    return materials.get(key);
  }
  function mesh(parent, geometry, color, position, scale) {
    const item = new THREE.Mesh(geometry, typeof color === 'string' ? material(color) : color);
    item.position.set(...position);
    if (scale) item.scale.set(...scale);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }
  function box(parent, size, color, position, radius = 0.08) {
    const key = `box:${size}:${radius}`;
    if (!geometries.has(key)) geometries.set(key, new RoundedBoxGeometry(...size, 3, radius));
    return mesh(parent, geometries.get(key), color, position);
  }
  function ball(parent, scale, color, position) {
    if (!geometries.has('sphere')) geometries.set('sphere', new THREE.SphereGeometry(1, 24, 16));
    return mesh(parent, geometries.get('sphere'), color, position, scale);
  }
  function cylinder(parent, top, bottom, height, color, position) {
    const key = `cylinder:${top}:${bottom}:${height}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.CylinderGeometry(top, bottom, height, 24));
    return mesh(parent, geometries.get(key), color, position);
  }
  function limb(parent, start, end, radius, color) {
    const from = new THREE.Vector3(...start), to = new THREE.Vector3(...end);
    const length = from.distanceTo(to);
    const key = `limb:${radius}:${length.toFixed(3)}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.CapsuleGeometry(radius, length, 4, 12));
    const item = mesh(parent, geometries.get(key), color, from.clone().add(to).multiplyScalar(0.5).toArray());
    item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.sub(from).normalize());
    return item;
  }
  function curve(parent, points, radius, color) {
    const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const geometry = new THREE.TubeGeometry(path, 16, radius, 6, false);
    return mesh(parent, geometry, color, [0, 0, 0]);
  }
  return { material, mesh, box, ball, cylinder, limb, curve };
}

export function createHamdiAvatar(kit) {
  const { box, ball, limb, curve } = kit;
  const avatar = new THREE.Group();
  const skin = '#bb805b', skinLight = '#c58b65', hair = '#202329';
  // Seated pose: overshirt, cream tee, denim, and chunky trainers.
  box(avatar, [0.91, 0.83, 0.51], '#25343b', [0, 1.92, -0.28], 0.18);
  box(avatar, [0.28, 0.62, 0.045], '#f0e8d9', [0, 1.98, 0], 0.04);
  for (const side of [-1, 1]) {
    const collar = box(avatar, [0.15, 0.33, 0.07], '#34464c', [side * 0.20, 2.16, 0.01], 0.035);
    collar.rotation.z = side * -0.28;
    limb(avatar, [side * 0.4, 2.14, -0.25], [side * 0.62, 1.77, -0.03], 0.18, '#25343b');
    limb(avatar, [side * 0.62, 1.77, -0.03], [side * 0.36, 1.79, 0.44], 0.12, skinLight);
    ball(avatar, [0.15, 0.085, 0.17], skinLight, [side * 0.36, 1.80, 0.50]);
    limb(avatar, [side * 0.24, 1.51, -0.23], [side * 0.29, 1.19, 0.46], 0.205, '#324550');
    limb(avatar, [side * 0.29, 1.19, 0.46], [side * 0.29, 0.48, 0.58], 0.17, '#324550');
    box(avatar, [0.35, 0.12, 0.35], '#263942', [side * 0.29, 0.47, 0.58], 0.04);
    box(avatar, [0.39, 0.22, 0.66], '#f5efdf', [side * 0.29, 0.28, 0.73], 0.09);
    box(avatar, [0.41, 0.075, 0.67], '#d5d9c7', [side * 0.29, 0.19, 0.73], 0.03);
    box(avatar, [0.23, 0.05, 0.18], '#b3dc83', [side * 0.29, 0.39, 0.75], 0.02);
  }
  ball(avatar, [0.18, 0.24, 0.17], skin, [0, 2.41, -0.25]);
  const head = new THREE.Group();
  head.position.set(0, 2.94, -0.23);
  // Look slightly down and left toward the screen, not out at the viewer.
  head.rotation.set(0.18, -0.10, 0);
  avatar.add(head);
  ball(head, [0.57, 0.62, 0.49], skinLight, [0, 0, 0]);
  for (const side of [-1, 1]) {
    ball(head, [0.12, 0.18, 0.11], skin, [side * 0.55, -0.06, 0]);
    ball(head, [0.055, 0.09, 0.045], '#a56b51', [side * 0.59, -0.06, 0.075]);
  }
  // The swept, parted black hair and restrained moustache/chin patch are
  // likeness cues from avatar.gif, kept soft and deliberately non-realistic.
  ball(head, [0.585, 0.47, 0.50], hair, [0, 0.30, -0.065]);
  for (const [x, y, z, tilt] of [
    [-0.42, 0.35, 0.25, -0.3], [-0.25, 0.52, 0.30, -0.45],
    [-0.03, 0.59, 0.24, -0.55], [0.20, 0.54, 0.22, -0.6],
    [0.40, 0.33, 0.25, 0.2],
  ]) {
    const lock = ball(head, [0.20, 0.30, 0.24], '#22272b', [x, y, z]);
    lock.rotation.z = tilt;
  }
  for (const side of [-1, 1]) {
    const sideburn = ball(head, [0.095, 0.24, 0.14], hair, [side * 0.49, 0.10, 0.13]);
    sideburn.rotation.z = side * 0.1;
    curve(head, [[side * 0.13, 0.16, 0.465], [side * 0.24, 0.19, 0.45], [side * 0.32, 0.15, 0.42]], 0.027, '#34302a');
  }
  const eyes = new THREE.Group();
  head.add(eyes);
  for (const side of [-1, 1]) {
    ball(eyes, [0.107, 0.133, 0.047], '#fff9ec', [side * 0.22, 0.015, 0.456]);
    ball(eyes, [0.060, 0.081, 0.032], '#352d28', [side * 0.22 + 0.015, 0.006, 0.499]);
    ball(eyes, [0.021, 0.026, 0.014], '#ffffff', [side * 0.22 + 0.032, 0.04, 0.526]);
  }
  ball(head, [0.095, 0.12, 0.12], skin, [0, -0.11, 0.48]);
  for (const side of [-1, 1]) {
    const moustache = ball(head, [0.095, 0.026, 0.025], '#49372d', [side * 0.075, -0.245, 0.451]);
    moustache.rotation.z = side * -0.18;
  }
  curve(head, [[-0.115, -0.31, 0.405], [0, -0.345, 0.426], [0.115, -0.31, 0.405]], 0.018, '#754532');
  ball(head, [0.065, 0.033, 0.017], '#513a2e', [0, -0.43, 0.347]);
  return { avatar, head, eyes };
}
