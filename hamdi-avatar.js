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
  const body = new THREE.Group();
  const typingArms = [];
  const shoulders = [];
  const legs = [];
  avatar.add(body);
  const skin = '#bb805b', skinLight = '#c58b65', hair = '#202329';
  // Seated pose: overshirt, cream tee, denim, and chunky trainers.
  box(body, [0.91, 0.83, 0.51], '#25343b', [0, 1.92, -0.28], 0.18);
  box(body, [0.28, 0.62, 0.045], '#f0e8d9', [0, 1.98, 0], 0.04);
  for (const side of [-1, 1]) {
    const collar = box(body, [0.15, 0.33, 0.07], '#34464c', [side * 0.20, 2.16, 0.01], 0.035);
    collar.rotation.z = side * -0.28;
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.4, 2.14, -0.25);
    body.add(shoulder);
    shoulders.push(shoulder);
    limb(shoulder, [0, 0, 0], [side * 0.22, -0.37, 0.22], 0.18, '#25343b');
    // Pivot each forearm at its elbow so key taps keep the arm connected.
    const forearm = new THREE.Group();
    forearm.position.set(side * 0.22, -0.37, 0.22);
    shoulder.add(forearm);
    limb(forearm, [0, 0, 0], [-side * 0.26, 0.02, 0.47], 0.12, skinLight);
    ball(forearm, [0.15, 0.085, 0.17], skinLight, [-side * 0.26, 0.03, 0.53]);
    typingArms.push(forearm);
    const thigh = new THREE.Group(), calf = new THREE.Group(), foot = new THREE.Group();
    thigh.position.set(side * 0.24, 1.51, -0.23);
    avatar.add(thigh);
    limb(thigh, [0, 0, 0], [side * 0.05, -0.32, 0.69], 0.205, '#324550');
    calf.position.set(side * 0.05, -0.32, 0.69);
    thigh.add(calf);
    limb(calf, [0, 0, 0], [0, -0.71, 0.12], 0.17, '#324550');
    foot.position.set(0, -0.71, 0.12);
    calf.add(foot);
    box(foot, [0.35, 0.12, 0.35], '#263942', [0, -0.01, 0], 0.04);
    box(foot, [0.39, 0.22, 0.66], '#f5efdf', [0, -0.20, 0.15], 0.09);
    box(foot, [0.41, 0.075, 0.67], '#d5d9c7', [0, -0.29, 0.15], 0.03);
    box(foot, [0.23, 0.05, 0.18], '#b3dc83', [0, -0.09, 0.17], 0.02);
    legs.push({ thigh, calf, foot });
  }
  ball(body, [0.18, 0.24, 0.17], skin, [0, 2.41, -0.25]);
  const head = new THREE.Group();
  head.position.set(0, 2.94, -0.23);
  // Look slightly down and left toward the screen, not out at the viewer.
  head.rotation.set(0.18, -0.10, 0);
  body.add(head);
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
  return { avatar, body, head, eyes, typingArms, shoulders, legs };
}

// One motion rig, used by the desk pose and the standing hologram. Pose values
// are absolute (not accumulated), so reverse scrolling never drifts the joints.
export function animateHamdi(hamdi, time, standing = 0, reduced = false) {
  const breath = reduced ? 0 : Math.sin(time * 1.4);
  hamdi.body.position.y = breath * 0.032;
  hamdi.body.scale.set(1, 1 + breath * 0.006, 1 + breath * 0.018);
  hamdi.head.position.y = 2.94 + breath * 0.014;
  hamdi.head.rotation.set(0.18 * (1 - standing), -0.10 * (1 - standing), reduced ? 0 : Math.sin(time * 0.8) * 0.024);
  const burst = reduced ? 0 : Math.min(1, Math.max(0, Math.sin((time % 8) / 5.6 * Math.PI) * 5));
  hamdi.typingArms.forEach((arm, index) => {
    const tap = Math.max(0, Math.sin(time * 7 + index * Math.PI));
    arm.rotation.x = standing * 1.075 - (1 - standing) * tap * burst * 0.14;
    hamdi.shoulders[index].rotation.x = standing * 0.535;
    hamdi.shoulders[index].rotation.z = standing * (index ? -0.07 : 0.07);
  });
  hamdi.legs.forEach(({ thigh, calf, foot }) => {
    thigh.rotation.x = standing * Math.atan2(0.69, 0.32);
    calf.rotation.x = standing * (Math.atan2(0.12, 0.71) - Math.atan2(0.69, 0.32));
    foot.rotation.x = -standing * Math.atan2(0.12, 0.71);
  });
  const blink = time % 4.8;
  hamdi.eyes.scale.y = !reduced && blink > 4.46 ? 1 - Math.sin((blink - 4.46) / 0.34 * Math.PI) * 0.96 : 1;
}
