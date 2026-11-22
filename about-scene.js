import * as THREE from './assets/vendor/three.module.min.js';

const clamp = value => Math.min(1, Math.max(0, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

// A single renderer, scene, and avatar travel from the workspace into About.
// No scroll capture, duplicate WebGL context, or second character download.
export function createAboutScene({ renderer, scene, camera, world, hamdi, stage }) {
  const section = document.getElementById('about');
  const target = document.getElementById('aboutStage');
  const counter = document.getElementById('scanCount');
  const canvas = renderer.domElement;
  canvas.classList.add('portfolio-canvas');
  document.body.append(canvas);
  const desk = new THREE.Group();
  [...world.children].filter(child => child !== hamdi.avatar).forEach(child => desk.add(child));
  world.add(desk);

  const uniforms = { uHologram: { value: 0 }, uTime: { value: 0 }, uScan: { value: 0 } };
  const materials = new Map();
  hamdi.avatar.traverse(object => {
    if (!object.isMesh) return;
    const original = object.material;
    if (!materials.has(original)) {
      const material = original.clone();
      material.transparent = true;
      material.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vHoloY;')
          .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvHoloY = (modelMatrix * vec4(transformed, 1.0)).y;');
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vHoloY; uniform float uHologram; uniform float uTime; uniform float uScan;')
          .replace('#include <dithering_fragment>', `#include <dithering_fragment>
            float rim = pow(1.0 - max(dot(normalize(normal), normalize(vViewPosition)), 0.0), 2.0);
            float lines = 0.88 + 0.12 * sin(vHoloY * 110.0 - uTime * 1.2);
            float sweep = exp(-pow((vHoloY - uScan * 4.65) * 6.0, 2.0));
            vec3 hologram = mix(gl_FragColor.rgb * 0.25, vec3(0.10, 0.76, 0.92), 0.66);
            hologram += vec3(0.10, 0.65, 0.82) * (rim * 0.75 + sweep * 0.65);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, hologram * lines, uHologram);
            gl_FragColor.a = mix(1.0, 0.80 + rim * 0.20, uHologram);`);
      };
      material.customProgramCacheKey = () => 'hamdi-hologram-v1';
      materials.set(original, material);
    }
    object.material = materials.get(original);
  });

  const platform = new THREE.Group();
  world.add(platform);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.48, 0.20, 64), new THREE.MeshStandardMaterial({ color: '#183741', metalness: 0.45, roughness: 0.4 }));
  base.position.y = 0.10;
  platform.add(base);
  function ring(radius, thickness, y, opacity = 1) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 8, 64), new THREE.MeshBasicMaterial({ color: '#5deaff', transparent: true, opacity, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    platform.add(mesh);
    return mesh;
  }
  ring(1.35, 0.024, 0.21); ring(1.17, 0.012, 0.215, 0.65); ring(1.47, 0.013, 0.04, 0.5);
  const sweep = ring(0.89, 0.012, 0.24, 0.8);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 4.2, 48, 1, true), new THREE.MeshBasicMaterial({ color: '#49dcf6', transparent: true, opacity: 0.035, side: THREE.DoubleSide, depthWrite: false }));
  beam.position.y = 2.3;
  platform.add(beam);
  const tickGeometry = new THREE.BoxGeometry(0.018, 0.012, 0.10);
  const tickMaterial = new THREE.MeshBasicMaterial({ color: '#8df0fc' });
  for (let index = 0; index < 32; index++) {
    const angle = index / 32 * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeometry, tickMaterial);
    tick.position.set(Math.sin(angle) * 1.26, 0.215, Math.cos(angle) * 1.26);
    tick.rotation.y = angle;
    platform.add(tick);
  }

  let width = 0, height = 0;
  const from = new THREE.Vector3(5.5, 4.6, 8), to = new THREE.Vector3();
  return {
    section, target,
    update(time, reduced) {
      const origin = stage.getBoundingClientRect();
      const destination = target.getBoundingClientRect();
      const bounds = section.getBoundingClientRect();
      const transition = reduced ? (bounds.top < innerHeight * 0.65 ? 1 : 0) : smooth(1 - bounds.top / (innerHeight * 0.8));
      const progress = reduced ? 1 : clamp((innerHeight * 0.25 - bounds.top) / Math.max(1, bounds.height - innerHeight * 0.75));
      const lerp = (a, b) => a + (b - a) * transition;
      const w = Math.max(1, Math.round(lerp(origin.width, destination.width)));
      const h = Math.max(1, Math.round(lerp(origin.height, destination.height)));
      if (w !== width || h !== height) {
        width = w; height = h;
        renderer.setSize(w, h, false);
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      }
      canvas.style.left = `${lerp(origin.left, destination.left)}px`;
      canvas.style.top = `${lerp(origin.top, destination.top)}px`;
      const aspect = w / h;
      const heroFit = Math.max(2.42, (innerWidth <= 700 ? 3.50 : 3.25) / aspect);
      const fit = lerp(heroFit, Math.max(2.55, 1.9 / aspect));
      camera.left = -fit * aspect; camera.right = fit * aspect;
      camera.top = fit; camera.bottom = -fit;
      const angle = reduced ? 0.25 : -0.30 + progress * 1.05;
      to.set(Math.sin(angle) * 8, 3.8, Math.cos(angle) * 8);
      camera.position.copy(from).lerp(to, transition);
      camera.lookAt(0, lerp(1.65, 2.15), 0);
      camera.updateProjectionMatrix();
      desk.scale.setScalar(Math.max(0.001, 1 - smooth(transition * 1.4)));
      desk.visible = transition < 0.995;
      platform.scale.setScalar(Math.max(0.001, smooth((transition - 0.15) / 0.85)));
      platform.visible = transition > 0.15;
      hamdi.avatar.position.set(lerp(0.32, 0), transition * 0.52, lerp(-0.27, 0));
      world.rotation.x *= 1 - transition;
      world.rotation.y *= 1 - transition;
      uniforms.uHologram.value = smooth(transition);
      uniforms.uTime.value = reduced ? 0 : time;
      uniforms.uScan.value = progress;
      sweep.position.y = 0.24 + progress * 4.1;
      sweep.visible = progress > 0 && progress < 1;
      counter.textContent = String(Math.round(progress * 100)).padStart(3, '0');
      section.style.setProperty('--scan', progress);
      target.classList.add('scene-ready');
      return transition;
    },
    fail() { target.classList.remove('scene-ready'); canvas.remove(); },
  };
}
