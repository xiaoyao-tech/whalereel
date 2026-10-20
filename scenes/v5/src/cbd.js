import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const W = 1280, H = 720;
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(W, H);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.left = "0";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.zIndex = "5";
stage.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06080c);
scene.fog = new THREE.Fog(0x06080c, 300, 1200);
const camera = new THREE.PerspectiveCamera(38, W / H, 0.5, 3000);

scene.add(new THREE.HemisphereLight(0xfff8f0, 0x0b0d12, 0.85));
const key = new THREE.DirectionalLight(0xfff3df, 2.1);
key.position.set(220, 400, 260);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -300;
key.shadow.camera.right = 300;
key.shadow.camera.top = 300;
key.shadow.camera.bottom = -300;
key.shadow.camera.near = 1;
key.shadow.camera.far = 1500;
key.shadow.bias = -0.0005;
scene.add(key);
const fill = new THREE.DirectionalLight(0x8aa8ff, 0.7);
fill.position.set(-350, 200, -260);
scene.add(fill);
scene.add(new THREE.AmbientLight(0xffffff, 0.12));

const buildings = window.BJ_BUILDINGS || [];
const positions = [], normals = [];
function addTri(ax, ay, az, bx, by, bz, cx, cy, cz) {
  positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
  const ux = bx - ax, uy = by - ay, uz = bz - az;
  const vx = cx - ax, vy = cy - ay, vz = cz - az;
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz) || 1;
  nx /= l; ny /= l; nz /= l;
  normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
}
let used = 0;
for (const b of buildings) {
  const pts = b.p;
  if (!pts || pts.length < 3) continue;
  const h = b.h;
  const contour = pts.map(([x, z]) => new THREE.Vector2(x, z));
  let tris = [];
  try { tris = THREE.ShapeUtils.triangulateShape(contour, []); } catch (e) { tris = []; }
  if (!tris.length) continue;
  for (const [i, j, k] of tris) {
    const A = pts[i], B = pts[j], C = pts[k];
    addTri(A[0], h, A[1], B[0], h, B[1], C[0], h, C[1]);
  }
  for (let i = 0; i < pts.length; i++) {
    const A = pts[i], B = pts[(i + 1) % pts.length];
    addTri(A[0], 0, A[1], B[0], 0, B[1], B[0], h, B[1]);
    addTri(A[0], 0, A[1], B[0], h, B[1], A[0], h, A[1]);
  }
  used++;
}
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
geo.computeBoundingSphere();
const model = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
  color: 0xf1f1ee, roughness: 0.9, metalness: 0, side: THREE.DoubleSide,
}));
model.castShadow = true;
model.receiveShadow = true;
scene.add(model);

const base = new THREE.Mesh(
  new THREE.BoxGeometry(400, 1.4, 400),
  new THREE.MeshStandardMaterial({ color: 0xe9e4d8, roughness: 0.95 })
);
base.position.set(0, -0.8, 0);
base.receiveShadow = true;
scene.add(base);
const plinth = new THREE.Mesh(
  new THREE.BoxGeometry(450, 6, 450),
  new THREE.MeshStandardMaterial({ color: 0x0d1016, roughness: 1 })
);
plinth.position.set(0, -4.4, 0);
plinth.receiveShadow = true;
scene.add(plinth);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(3000, 3000),
  new THREE.MeshStandardMaterial({ color: 0x06080c, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -7.6;
scene.add(ground);

// China Zun marker
const zx = 1.2, zz = 37.9, zh = 52.8;
const line = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(zx, zh + 2, zz),
    new THREE.Vector3(zx, zh + 14, zz),
    new THREE.Vector3(zx + 34, zh + 14, zz + 10),
  ]),
  new THREE.LineBasicMaterial({ color: 0xe0a15e, transparent: true, opacity: 0.85 })
);
scene.add(line);
const div = document.createElement("div");
div.className = "label";
div.innerHTML = "中国尊 <b>528 m</b>";
const obj = new CSS2DObject(div);
obj.position.set(zx + 36, zh + 14, zz + 10);
scene.add(obj);

const cbdDiv = document.createElement("div");
cbdDiv.className = "label soft";
cbdDiv.textContent = "北京 CBD";
const cbdObj = new CSS2DObject(cbdDiv);
cbdObj.position.set(-10, 4, 0);
scene.add(cbdObj);

const posCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(260, 190, 320),
  new THREE.Vector3(155, 125, 225),
  new THREE.Vector3(85, 85, 160),
  new THREE.Vector3(45, 72, 110),
  new THREE.Vector3(85, 105, 45),
  new THREE.Vector3(165, 155, -60),
]);
const targetCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(1, 30, 38),
  new THREE.Vector3(1, 32, 38),
  new THREE.Vector3(1, 34, 38),
  new THREE.Vector3(1, 34, 38),
  new THREE.Vector3(1, 30, 38),
  new THREE.Vector3(1, 24, 38),
]);

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const ramp = (t, a, d) => ease((t - a) / d);

window.__duration = 16;
window.__preview = 8;
window.__seek = (t) => {
  const p = ease(clamp01(t / 16));
  camera.position.copy(posCurve.getPointAt(p));
  camera.lookAt(targetCurve.getPointAt(p));
  div.style.opacity = String(ramp(t, 2.0, 0.6));
  cbdDiv.style.opacity = String(ramp(t, 1.0, 0.6));
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
};
const params = new URLSearchParams(location.search);
const fixedT = params.has("t") ? Number(params.get("t")) : null;
window.__ready = true;
window.__seek(fixedT == null ? 0 : fixedT);
