import * as THREE from './assets/vendor/three.module.min.js';
import { createToyKit, createHamdiAvatar, animateHamdi } from './hamdi-avatar.js';
import { createAboutScene } from './about-scene.js';

const stage = document.getElementById('heroStage');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const compact = matchMedia('(max-width: 700px)');
let renderer;

function startScene() {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !compact.matches, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact.matches ? 1.25 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 50);
  const kit = createToyKit();
  const { box, ball, cylinder, curve, mesh, material } = kit;
  scene.add(new THREE.HemisphereLight('#fff7e6', '#a9b7ae', 2.5));
  const sun = new THREE.DirectionalLight('#fff6de', 3.5);
  sun.position.set(-3, 8, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(compact.matches ? 512 : 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 6, bottom: -4, near: 0.5, far: 20 });
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.0002;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#d9f8dc', 1.4);
  fill.position.set(5, 4, -3);
  scene.add(fill);
  const world = new THREE.Group();
  scene.add(world);

  // A small, tactile studio island rather than a floating model viewer.
  box(world, [5.1, 0.16, 3.65], '#dfdfc8', [0, 0, 0], 0.18);
  box(world, [4.45, 0.035, 2.95], '#b5ce96', [0, 0.10, 0.03], 0.16);
  box(world, [4.05, 0.025, 2.58], '#c7dca8', [0, 0.13, 0.03], 0.14);
  // Chair behind Hamdi, with visible padded back and a five-spoke base.
  box(world, [1.02, 0.18, 0.86], '#3d5457', [0.32, 1.44, -0.55], 0.13);
  box(world, [1.02, 1.03, 0.21], '#3d5457', [0.32, 1.96, -0.95], 0.17);
  cylinder(world, 0.055, 0.07, 0.73, '#697c77', [0.32, 0.98, -0.55]);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    kit.limb(world, [0.32, 0.53, -0.55], [0.32 + Math.sin(a) * 0.55, 0.29, -0.55 + Math.cos(a) * 0.55], 0.045, '#697c77');
  }
  const hamdi = createHamdiAvatar(kit);
  hamdi.avatar.position.set(0.32, 0, -0.27);
  world.add(hamdi.avatar);

  // Rounded cream desk, warm wood edge, and sturdy navy legs.
  for (const x of [-1.6, 1.6]) for (const z of [-0.17, 1.05]) {
    const leg = box(world, [0.15, 1.27, 0.15], '#33474a', [x, 0.84, z], 0.055);
    leg.rotation.z = x < 0 ? -0.045 : 0.045;
  }
  box(world, [3.85, 0.15, 1.82], '#c3a67c', [0, 1.46, 0.43], 0.09);
  box(world, [3.93, 0.13, 1.89], '#f8f0de', [0, 1.56, 0.43], 0.10);
  box(world, [1.78, 0.025, 0.73], '#7d9990', [0.32, 1.64, 0.32], 0.07);
  // Hamdi sits at negative Z: keyboard first, monitor beyond it. The screen
  // faces him (-Z); the camera at +Z sees the back/side of the monitor.
  const monitor = new THREE.Group();
  monitor.position.set(0.18, 0, 0.91);
  monitor.rotation.y = Math.PI - 0.10;
  world.add(monitor);
  box(monitor, [0.65, 0.06, 0.39], '#34474c', [0, 1.67, 0], 0.05);
  box(monitor, [0.11, 0.42, 0.10], '#34474c', [0, 1.88, -0.1], 0.04);
  box(monitor, [1.49, 1.00, 0.14], '#293c43', [0, 2.30, -0.08], 0.08);
  box(monitor, [0.30, 0.25, 0.025], '#344b50', [0, 2.34, -0.157], 0.045);
  for (const x of [-0.065, 0.065]) box(monitor, [0.025, 0.12, 0.012], '#8caaa0', [x, 2.34, -0.176], 0.008);
  box(monitor, [0.13, 0.023, 0.012], '#8caaa0', [0, 2.34, -0.176], 0.008);
  for (let vent = 0; vent < 7; vent++) box(monitor, [0.07, 0.012, 0.01], '#20343a', [-0.27 + vent * 0.09, 2.03, -0.153], 0.004);
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 768; screenCanvas.height = 448;
  const ctx = screenCanvas.getContext('2d');
  ctx.fillStyle = '#142b34'; ctx.fillRect(0, 0, 768, 448);
  ctx.fillStyle = '#223e46'; ctx.fillRect(0, 0, 768, 55);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#b9e78f', '#e4d49a', '#7b9e96'][i];
    ctx.beginPath(); ctx.arc(28 + i * 27, 27, 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.font = '20px monospace'; ctx.fillStyle = '#c3d2cc'; ctx.fillText('hamsone / bot.py', 290, 35);
  const code = [
    ['#8aaca4', '# A little code. A lot less busywork.'],
    ['#c9ec9f', 'async def on_message(message):'],
    ['#b9cbd1', '    command = message.content'],
    ['#b9cbd1', '    if command == "/stock":'],
    ['#ebd1a4', '        await shop.show_stock()'],
    ['#b9cbd1', '    elif command == "/buy":'],
    ['#ebd1a4', '        await shop.create_order()'],
    ['#8aaca4', '# Built with care. Kept running.'],
  ];
  ctx.font = '21px monospace';
  code.forEach(([color, line], i) => {
    ctx.fillStyle = '#5d7e77'; ctx.fillText(String(i + 1).padStart(2, '0'), 23, 107 + i * 37);
    ctx.fillStyle = color; ctx.fillText(line, 75, 107 + i * 37);
  });
  const texture = new THREE.CanvasTexture(screenCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.80), new THREE.MeshBasicMaterial({ map: texture }));
  screen.position.set(0, 2.30, 0.001);
  monitor.add(screen);
  ball(monitor, [0.018, 0.018, 0.012], '#bce989', [0, 1.86, 0]);
  // Low-profile keyboard, lime escape key, and rounded mouse.
  box(world, [1.02, 0.06, 0.39], '#e4e3d3', [0.32, 1.69, 0.22], 0.045);
  for (let row = 0; row < 3; row++) for (let key = 0; key < 10; key++) {
    box(world, [0.071, 0.025, 0.077], row === 0 && key === 0 ? '#b1da7b' : '#f9f4e8', [-0.10 + key * 0.094, 1.735, 0.115 + row * 0.105], 0.015);
  }
  ball(world, [0.11, 0.066, 0.16], '#f3eddf', [1.03, 1.71, 0.25]);
  // Coffee with a visible rim and a tiny curl of steam.
  cylinder(world, 0.16, 0.125, 0.29, '#c1df91', [1.47, 1.80, 0.76]);
  cylinder(world, 0.134, 0.134, 0.012, '#634a35', [1.47, 1.951, 0.76]);
  const handle = mesh(world, new THREE.TorusGeometry(0.105, 0.032, 8, 18), '#c1df91', [1.65, 1.82, 0.76]);
  handle.rotation.y = 0.1;
  const steamMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5 });
  const steam = curve(world, [[1.47, 2.02, 0.76], [1.44, 2.13, 0.76], [1.50, 2.24, 0.76], [1.47, 2.34, 0.76]], 0.012, steamMaterial);
  // A friendly little robot desk figure, not the removed hero robot.
  box(world, [0.31, 0.27, 0.24], '#c2dc9a', [-1.46, 1.78, 0.82], 0.07);
  box(world, [0.34, 0.27, 0.26], '#e9eddb', [-1.46, 2.04, 0.82], 0.075);
  box(world, [0.26, 0.13, 0.025], '#334d4e', [-1.46, 2.05, 0.96], 0.03);
  for (const x of [-1.52, -1.40]) ball(world, [0.022, 0.03, 0.01], '#c7ef90', [x, 2.06, 0.981]);
  cylinder(world, 0.016, 0.016, 0.10, '#687d69', [-1.46, 2.22, 0.82]);
  ball(world, [0.042, 0.042, 0.042], '#b4d67f', [-1.46, 2.28, 0.82]);
  // Potted plant at the back corner of the desk.
  cylinder(world, 0.23, 0.17, 0.36, '#d3b591', [1.38, 1.82, -0.12]);
  cylinder(world, 0.205, 0.205, 0.03, '#75654b', [1.38, 2.01, -0.12]);
  for (const [x, z, tilt] of [[0, 0, 0], [-0.15, 0.05, 0.5], [0.17, -0.03, -0.6], [-0.06, -0.13, 0.2], [0.10, 0.12, -0.3]]) {
    const leaf = ball(world, [0.085, 0.38, 0.055], x > 0 ? '#6e995c' : '#8fb567', [1.38 + x, 2.27, -0.12 + z]);
    leaf.rotation.z = tilt;
    leaf.rotation.y = x * 4;
  }
  // Soft contact shadow under the island, without a large opaque background.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const shadowCtx = shadowCanvas.getContext('2d');
  const gradient = shadowCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(45,54,41,0.23)'); gradient.addColorStop(1, 'rgba(45,54,41,0)');
  shadowCtx.fillStyle = gradient; shadowCtx.fillRect(0, 0, 128, 128);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.095; world.add(ground);

  const about = createAboutScene({ renderer, scene, camera, world, hamdi, stage });
  let frame = 0, visible = true, failed = false, lastFrame = 0, time = 0;
  let targetX = 0, targetY = 0;
  function resize() {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    // Fit both dimensions. No controls capture touch or compete with scrolling.
    const aspect = width / height;
    const halfHeight = Math.max(2.42, (compact.matches ? 3.50 : 3.25) / aspect);
    camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    camera.position.set(5.5, 4.6, 8);
    camera.lookAt(0, 1.65, 0);
    camera.updateProjectionMatrix();
    renderStill();
  }
  function renderStill() {
    if (failed) return;
    const standing = about.update(time, motion.matches);
    animateHamdi(hamdi, time, standing, motion.matches);
    steam.position.y = motion.matches ? 0 : Math.sin(time * 1.2) * 0.035;
    renderer.render(scene, camera);
  }
  function animate(now) {
    frame = 0;
    if (failed || !visible || document.hidden) return;
    // A preference can update before its change event arrives. Settle the
    // static pose/scan before stopping, rather than freezing mid-animation.
    if (motion.matches) { syncAnimation(); return; }
    // 30fps is ample for subtle idle motion and limits work on phones.
    if (now - lastFrame >= 1000 / 30) {
      time = now * 0.001;
      world.rotation.y += (targetX - world.rotation.y) * 0.065;
      world.rotation.x += (targetY - world.rotation.x) * 0.065;
      renderStill(); lastFrame = now;
    }
    frame = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    cancelAnimationFrame(frame); frame = 0;
    // The canvas is viewport-fixed while travelling between sections. Hide it
    // immediately on an instant anchor/End jump, before pausing its RAF.
    renderer.domElement.style.visibility = visible && !document.hidden && !failed ? 'visible' : 'hidden';
    if (motion.matches) {
      world.rotation.set(0, 0, 0); hamdi.head.rotation.z = 0;
      hamdi.body.position.y = 0; hamdi.body.scale.set(1, 1, 1);
      hamdi.typingArms.forEach(arm => { arm.rotation.x = 0; });
      hamdi.head.position.y = 2.94; hamdi.eyes.scale.y = 1; steam.position.y = 0;
      renderStill();
    } else if (visible && !document.hidden && !failed) {
      renderStill();
      frame = requestAnimationFrame(animate);
    }
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  const intersections = new Map();
  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => intersections.set(entry.target, entry.isIntersecting));
    visible = [...intersections.values()].some(Boolean);
    syncAnimation();
  });
  visibilityObserver.observe(stage);
  visibilityObserver.observe(about.section);
  document.addEventListener('visibilitychange', syncAnimation);
  motion.addEventListener('change', syncAnimation);
  // Reduced motion has no continuous RAF. A native scroll/resize can still
  // place its single, static pose in the right section without animation.
  window.addEventListener('scroll', () => { if (motion.matches && visible) renderStill(); }, { passive: true });
  window.addEventListener('resize', () => { if (visible) renderStill(); }, { passive: true });
  stage.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || motion.matches) return;
    const rect = stage.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.16;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.05;
  });
  stage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); failed = true; cancelAnimationFrame(frame);
    stage.classList.remove('scene-ready');
    about.fail();
    resizeObserver.disconnect(); visibilityObserver.disconnect();
  });
  resize();
  stage.classList.add('scene-ready');
  syncAnimation();
}

try { startScene(); }
catch {
  // The static illustration is visible by default, including failed modules,
  // unsupported WebGL, blocked scripts, and context creation failures.
  stage.classList.remove('scene-ready');
  renderer?.dispose(); renderer?.domElement.remove();
}
