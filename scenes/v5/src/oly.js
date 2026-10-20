import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const W = 1280, H = 720;
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
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
scene.fog = new THREE.Fog(0x06080c, 300, 1100);
const camera = new THREE.PerspectiveCamera(38, W / H, 0.5, 3000);

scene.add(new THREE.HemisphereLight(0xfff8f0, 0x0b0d12, 0.9));
const key = new THREE.DirectionalLight(0xfff3df, 2.0);
key.position.set(180, 320, 240);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -220;
key.shadow.camera.right = 220;
key.shadow.camera.top = 220;
key.shadow.camera.bottom = -220;
key.shadow.camera.near = 1;
key.shadow.camera.far = 1200;
key.shadow.bias = -0.0005;
scene.add(key);
const fill = new THREE.DirectionalLight(0x8aa8ff, 0.75);
fill.position.set(-300, 180, -220);
scene.add(fill);
scene.add(new THREE.AmbientLight(0xffffff, 0.12));

// plaza + plinth
const plaza = new THREE.Mesh(
  new THREE.BoxGeometry(250, 1.6, 170),
  new THREE.MeshStandardMaterial({ color: 0xe9e4d8, roughness: 0.95 })
);
plaza.position.set(0, -0.8, 0);
plaza.receiveShadow = true;
scene.add(plaza);
const plinth = new THREE.Mesh(
  new THREE.BoxGeometry(290, 6, 210),
  new THREE.MeshStandardMaterial({ color: 0x0d1016, roughness: 1 })
);
plinth.position.set(0, -4.6, 0);
plinth.receiveShadow = true;
scene.add(plinth);

// ---- Bird's Nest: elliptical bowl + woven lattice ----
const bx = -45, bz = 0;
const N = 96, M = 16;
const verts = [];
for (let j = 0; j <= M; j++) {
  const v = j / M;
  for (let i = 0; i <= N; i++) {
    const u = i / N * Math.PI * 2;
    const rx = 36 * (1 - 0.13 * v);
    const rz = 31 * (1 - 0.13 * v);
    verts.push(new THREE.Vector3(bx + Math.cos(u) * rx, 1 + 17 * v + Math.sin(2 * u + 0.4) * 2.8 * v, bz + Math.sin(u) * rz));
  }
}
const bowlGeo = new THREE.BufferGeometry();
const bp = [], bi = [];
for (const v of verts) bp.push(v.x, v.y, v.z);
for (let j = 0; j < M; j++) {
  for (let i = 0; i < N; i++) {
    const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
    bi.push(a, c, b, b, c, d);
  }
}
bowlGeo.setAttribute("position", new THREE.Float32BufferAttribute(bp, 3));
bowlGeo.setIndex(bi);
bowlGeo.computeVertexNormals();
const bowl = new THREE.Mesh(bowlGeo, new THREE.MeshStandardMaterial({
  color: 0xdfd9cc, roughness: 0.95, metalness: 0, side: THREE.DoubleSide,
}));
bowl.castShadow = true;
bowl.receiveShadow = true;
scene.add(bowl);

const latticeMat = new THREE.LineBasicMaterial({ color: 0xc9a36f, transparent: true, opacity: 0.85 });
for (let k = 0; k < 40; k++) {
  const pts = [];
  const u0 = k / 40 * Math.PI * 2;
  for (let s = 0; s <= 24; s++) {
    const v = s / 24;
    const u = u0 + v * 1.15;
    const rx = 36.6 * (1 - 0.13 * v);
    const rz = 31.6 * (1 - 0.13 * v);
    pts.push(new THREE.Vector3(bx + Math.cos(u) * rx, 1.2 + 17 * v + Math.sin(2 * u + 0.4) * 2.8 * v, bz + Math.sin(u) * rz));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), latticeMat));
  const pts2 = [];
  for (let s = 0; s <= 24; s++) {
    const v = s / 24;
    const u = u0 - v * 1.15;
    const rx = 36.6 * (1 - 0.13 * v);
    const rz = 31.6 * (1 - 0.13 * v);
    pts2.push(new THREE.Vector3(bx + Math.cos(u) * rx, 1.2 + 17 * v + Math.sin(2 * u + 0.4) * 2.8 * v, bz + Math.sin(u) * rz));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), latticeMat));
}
for (let j = 1; j <= 5; j++) {
  const v = j / 6;
  const pts = [];
  const rx = 36.4 * (1 - 0.13 * v), rz = 31.4 * (1 - 0.13 * v);
  for (let i = 0; i <= N; i++) {
    const u = i / N * Math.PI * 2;
    pts.push(new THREE.Vector3(bx + Math.cos(u) * rx, 1.2 + 17 * v + Math.sin(2 * u + 0.4) * 2.8 * v, bz + Math.sin(u) * rz));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), latticeMat));
}
// field
const field = new THREE.Mesh(
  new THREE.CircleGeometry(26, 64),
  new THREE.MeshStandardMaterial({ color: 0xcfd8c8, roughness: 1 })
);
field.rotation.x = -Math.PI / 2;
field.position.set(bx, 1.9, bz);
field.scale.set(1.1, 0.95, 1);
field.receiveShadow = true;
scene.add(field);

// ---- Water Cube: box with bubble skin ----
const wc = document.createElement("canvas");
wc.width = wc.height = 512;
const wctx = wc.getContext("2d");
wctx.fillStyle = "#dceff6";
wctx.fillRect(0, 0, 512, 512);
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 8; x++) {
    const cx = 32 + x * 64 + (y % 2 ? 12 : 0);
    const cy = 32 + y * 64;
    const r = 22 + ((x * 7 + y * 13) % 9);
    wctx.beginPath();
    wctx.arc(cx, cy, r, 0, Math.PI * 2);
    wctx.fillStyle = "rgba(84,160,196,.28)";
    wctx.fill();
    wctx.lineWidth = 3;
    wctx.strokeStyle = "rgba(52,120,158,.75)";
    wctx.stroke();
    wctx.beginPath();
    wctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.28, 0, Math.PI * 2);
    wctx.fillStyle = "rgba(255,255,255,.55)";
    wctx.fill();
  }
}
const bubbleTex = new THREE.CanvasTexture(wc);
bubbleTex.wrapS = bubbleTex.wrapT = THREE.RepeatWrapping;
bubbleTex.repeat.set(2, 1);
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(34, 8, 34),
  new THREE.MeshStandardMaterial({ map: bubbleTex, roughness: 0.45, metalness: 0.08 })
);
cube.position.set(55, 4, 12);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);
const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(cube.geometry),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
);
edges.position.copy(cube.position);
scene.add(edges);

// labels
function label(text, x, y, z, cls = "") {
  const div = document.createElement("div");
  div.className = "label " + cls;
  div.innerHTML = text;
  div.style.opacity = "0";
  const obj = new CSS2DObject(div);
  obj.position.set(x, y, z);
  scene.add(obj);
  return div;
}
const lNest = label("鸟巢 <b>国家体育场</b> / 2008", bx, 24, bz);
const lCube = label("水立方 <b>国家游泳中心</b> / 2022", 55, 11, 12);
const lPark = label("奥林匹克公园", 0, 4, -55, "soft");

const posCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 95, 195),
  new THREE.Vector3(-45, 50, 110),
  new THREE.Vector3(-95, 38, 50),
  new THREE.Vector3(-40, 35, 75),
  new THREE.Vector3(55, 32, 85),
  new THREE.Vector3(95, 80, 160),
]);
const targetCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-20, 8, 0),
  new THREE.Vector3(-45, 10, 0),
  new THREE.Vector3(-45, 10, 0),
  new THREE.Vector3(10, 8, 0),
  new THREE.Vector3(55, 8, 12),
  new THREE.Vector3(0, 6, 0),
]);

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const ramp = (t, a, d) => ease((t - a) / d);

window.__duration = 14;
window.__preview = 8;
window.__seek = (t) => {
  const p = ease(clamp01(t / 14));
  camera.position.copy(posCurve.getPointAt(p));
  camera.lookAt(targetCurve.getPointAt(p));
  lNest.style.opacity = String(ramp(t, 2.0, 0.6));
  lCube.style.opacity = String(ramp(t, 6.0, 0.6));
  lPark.style.opacity = String(ramp(t, 1.0, 0.6));
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
};
const params = new URLSearchParams(location.search);
const fixedT = params.has("t") ? Number(params.get("t")) : null;
window.__ready = true;
window.__seek(fixedT == null ? 0 : fixedT);
