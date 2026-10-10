/* Saathi in 3D: a low-poly doctor figure rendered with Three.js in place of the flat icon.

   Loaded lazily as a module by app.js and site.js. One renderer and one canvas are shared;
   the canvas is moved into whichever guide element is on screen (the floating button, or
   the panel header when the panel is open). If WebGL, the model or Three.js is unavailable,
   nothing happens and the flat icon stays. Model: "Doctor" by jeremy, CC-BY 3.0 (see
   models/CREDITS.md). The figure is a character; the guide's label still says "Not a doctor". */
import * as THREE from '/vendor/three.module.js';
import { GLTFLoader } from '/vendor/GLTFLoader.js';

const TARGETS = ['#pet .pet-head', '#pet .pet-btn', '.saathi .sa-head', '.saathi > button', '.saathi-btn'];
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

function start(gltf) {
  const canvas = document.createElement('canvas');
  canvas.className = 'saathi3d';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8fa6a2, 1.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2.5, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x2db5a6, 1.1);
  rim.position.set(-3, 2, -4);
  scene.add(rim);

  // centre the figure on its feet and scale it to two units tall
  const figure = gltf.scene;
  const box = new THREE.Box3().setFromObject(figure);
  const size = box.getSize(new THREE.Vector3());
  const scale = 2 / (size.y || 1);
  figure.scale.setScalar(scale);
  box.setFromObject(figure);
  const centre = box.getCenter(new THREE.Vector3());
  figure.position.x -= centre.x;
  figure.position.z -= centre.z;
  figure.position.y -= box.min.y;
  const pivot = new THREE.Group();
  pivot.add(figure);
  scene.add(pivot);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  let host = null, w = 0, h = 0, pointerX = 0, running = false, last = 0;

  function frame(bust) {
    // the floating button shows the whole figure; the small panel header shows head and shoulders
    if (bust) { camera.position.set(0, 1.62, 2.3); camera.lookAt(0, 1.6, 0); }
    else { camera.position.set(0, 1.06, 4.25); camera.lookAt(0, 1.02, 0); }
  }
  function fit() {
    if (!host) return;
    const r = host.getBoundingClientRect();
    const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  function draw(t) {
    fit();
    const s = t / 1000;
    pivot.rotation.y = (reduce ? 0.35 : Math.sin(s * 0.6) * 0.22 + 0.25) + pointerX * 0.45;
    pivot.position.y = reduce ? 0 : Math.sin(s * 1.6) * 0.025;
    renderer.render(scene, camera);
  }
  function loop(t) {
    if (!running) return;
    if (t - last > 32) { last = t; draw(t); }   // about 30 frames a second is plenty for an idle sway
    requestAnimationFrame(loop);
  }
  function setRunning(on) {
    on = on && !!host && !document.hidden;
    if (on === running) return;
    running = on;
    if (on && !reduce) requestAnimationFrame(loop);
  }

  function mount() {
    let target = null;
    for (const sel of TARGETS) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) { target = el; break; }
    }
    if (!target) { host = null; setRunning(false); return; }
    if (canvas.parentNode !== target) {
      Array.from(target.querySelectorAll('svg')).forEach(svg => { svg.style.display = 'none'; });
      target.appendChild(canvas);
      target.classList.add('has3d');
      host = target; w = h = 0;
      frame(target.matches('.pet-head, .sa-head'));
      if (reduce) requestAnimationFrame(draw);
    }
    setRunning(true);
  }

  new MutationObserver(mount).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
  document.addEventListener('visibilitychange', () => setRunning(true));
  window.addEventListener('resize', () => { w = h = 0; if (reduce && host) requestAnimationFrame(draw); });
  window.addEventListener('pointermove', e => { pointerX = (e.clientX / (window.innerWidth || 1)) - 0.5; }, { passive: true });
  mount();
}

try {
  const probe = document.createElement('canvas');
  if (probe.getContext('webgl2') || probe.getContext('webgl')) {
    new GLTFLoader().load('/models/doctor.glb', start, undefined, () => { /* keep the flat icon */ });
  }
} catch (e) { /* keep the flat icon */ }
