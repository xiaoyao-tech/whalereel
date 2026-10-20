import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const W = 1280, H = 720;
const DURATION = 30;
const stage = document.getElementById("stage");
const hud = document.getElementById("hud");
const hudTitle = document.getElementById("hud-title");
const hudLine = document.getElementById("hud-line");
const hudMeta = document.getElementById("hud-meta");

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
scene.fog = new THREE.Fog(0x06080c, 420, 1600);

const camera = new THREE.PerspectiveCamera(37, W / H, 0.5, 4000);

scene.add(new THREE.HemisphereLight(0xfff8f0, 0x0b0d12, 0.8));
const key = new THREE.DirectionalLight(0xfff3df, 2.0);
key.position.set(260, 430, 320);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -620;
key.shadow.camera.right = 620;
key.shadow.camera.top = 620;
key.shadow.camera.bottom = -620;
key.shadow.camera.near = 1;
key.shadow.camera.far = 2200;
key.shadow.bias = -0.0006;
scene.add(key);
const fill = new THREE.DirectionalLight(0x8aa8ff, 0.75);
fill.position.set(-420, 220, -320);
scene.add(fill);
scene.add(new THREE.AmbientLight(0xffffff, 0.14));

// ---- real footprints, merged into one geometry ----
const buildings = window.BJ_BUILDINGS || [];
const positions = [];
const normals = [];

function addTri(ax, ay, az, bx, by, bz, cx, cy, cz) {
  positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
  const ux = bx - ax, uy = by - ay, uz = bz - az;
  const vx = cx - ax, vy = cy - ay, vz = cz - az;
  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;
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
const mat = new THREE.MeshStandardMaterial({
  color: 0xf1f1ee, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide,
});
const model = new THREE.Mesh(geo, mat);
model.castShadow = true;
model.receiveShadow = true;
scene.add(model);

// base plate + plinth
const base = new THREE.Mesh(
  new THREE.BoxGeometry(690, 1.4, 880),
  new THREE.MeshStandardMaterial({ color: 0xe9e4d8, roughness: 0.95 })
);
base.position.set(0, -0.8, 0);
base.receiveShadow = true;
scene.add(base);
const plinth = new THREE.Mesh(
  new THREE.BoxGeometry(760, 6, 950),
  new THREE.MeshStandardMaterial({ color: 0x0d1016, roughness: 1 })
);
plinth.position.set(0, -4.4, 0);
plinth.receiveShadow = true;
scene.add(plinth);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(4000, 4000),
  new THREE.MeshStandardMaterial({ color: 0x06080c, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -7.6;
scene.add(ground);

// axis + 2nd ring, drawn on the plate
const amber = 0xe0a15e;
const axisLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.55, 388),
    new THREE.Vector3(0, 0.55, -388),
  ]),
  new THREE.LineBasicMaterial({ color: amber, transparent: true, opacity: 0.9 })
);
scene.add(axisLine);

const ringPts = [
  new THREE.Vector3(-285, 0.5, 300), new THREE.Vector3(285, 0.5, 300),
  new THREE.Vector3(285, 0.5, -300), new THREE.Vector3(-285, 0.5, -300),
];
const ring = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(ringPts),
  new THREE.LineBasicMaterial({ color: amber, transparent: true, opacity: 0.55 })
);
scene.add(ring);

// 3D-anchored labels
const labelDefs = [
  { text: "永定门", x: 0, y: 2, z: 385, start: 4.0 },
  { text: "天安门", x: 0, y: 2, z: 225, start: 8.0 },
  { text: "故宫", x: 0, y: 2, z: 95, start: 12.0 },
  { text: "景山", x: 0, y: 2, z: 22, start: 16.0 },
  { text: "鼓楼", x: 0, y: 2, z: -110, start: 20.0 },
];
const labels = [];
for (const d of labelDefs) {
  const div = document.createElement("div");
  div.className = "label";
  div.innerHTML = `<b>${d.text}</b>`;
  div.style.opacity = "0";
  const obj = new CSS2DObject(div);
  obj.position.set(d.x, d.y, d.z);
  scene.add(obj);
  labels.push({ el: div, start: d.start });
}


// ---- light ripples around mentioned places ----
const glowCanvas = document.createElement("canvas");
glowCanvas.width = glowCanvas.height = 128;
const gctx = glowCanvas.getContext("2d");
const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
grad.addColorStop(0, "rgba(255,214,158,1)");
grad.addColorStop(0.35, "rgba(255,180,110,.42)");
grad.addColorStop(1, "rgba(255,180,110,0)");
gctx.fillStyle = grad;
gctx.fillRect(0, 0, 128, 128);
const glowTex = new THREE.CanvasTexture(glowCanvas);

const rippleDefs = [
  { x: 0, z: 385, trigger: 4.0 },   // 永定门
  { x: 0, z: 225, trigger: 8.0 },   // 天安门
  { x: 0, z: 95, trigger: 12.0 },   // 故宫
  { x: 0, z: 22, trigger: 16.0 },   // 景山
  { x: 0, z: -110, trigger: 20.0 }, // 鼓楼
];
const ripples = [];
for (const d of rippleDefs) {
  const group = new THREE.Group();
  group.position.set(d.x, 1.0, d.z);
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.94, 1.0, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffc47a, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = i * 0.08;
    m.visible = false;
    group.add(m);
    rings.push(m);
  }
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex, color: 0xffc47a, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(10, 10, 1);
  glow.position.y = 2;
  group.add(glow);
  const light = new THREE.PointLight(0xffc47a, 0, 90, 2);
  light.position.set(0, 6, 0);
  group.add(light);
  scene.add(group);
  ripples.push({ rings, glow, light, trigger: d.trigger });
}

// camera path: wide south -> down the axis -> pull back north
const posCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(260, 340, 650),
  new THREE.Vector3(90, 240, 400),
  new THREE.Vector3(20, 150, 220),
  new THREE.Vector3(0, 100, 80),
  new THREE.Vector3(-8, 110, -60),
  new THREE.Vector3(50, 210, -240),
  new THREE.Vector3(150, 300, -360),
]);
const targetCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 160),
  new THREE.Vector3(0, 4, 120),
  new THREE.Vector3(0, 8, 60),
  new THREE.Vector3(0, 10, 0),
  new THREE.Vector3(0, 8, -50),
  new THREE.Vector3(0, 4, -100),
  new THREE.Vector3(0, 0, -140),
]);

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const ramp = (t, a, d) => ease((t - a) / d);

const HUD = [
  { t: 0.0, title: "北京老城", line: "1:2000 · OSM footprint", meta: `${used.toLocaleString()} 栋真实 footprint · 高度部分示意 · OSM ODbL` },
  { t: 7.0, title: "中轴", line: "7.8 km · 15 处遗产", meta: "永定门 → 天安门 → 故宫 → 景山 → 鼓楼" },
  { t: 12.0, title: "故宫", line: "明清皇宫 · 中轴核心", meta: "模型为 OSM footprint，非测绘" },
  { t: 16.0, title: "景山", line: "老城最高点", meta: "南望故宫，北望鼓楼" },
  { t: 20.0, title: "鼓楼", line: "中轴线北端", meta: "钟鼓楼 · 元明清都城报时中心" },
  { t: 24.5, title: "2,183 万", line: "2024 年末常住人口", meta: "1949: 420.1 万 · 北京市 2024 统计公报" },
];

window.__duration = DURATION;
window.__preview = 22;

window.__seek = (t) => {
  const p = ease(clamp01(t / DURATION));
  camera.position.copy(posCurve.getPointAt(p));
  const target = targetCurve.getPointAt(p);
  camera.lookAt(target);

  for (const l of labels) {
    const q = ramp(t, l.start, 0.6) * (1 - ramp(t, 27.3, 0.6));
    l.el.style.opacity = String(q);
  }

  let h = HUD[0];
  for (const k of HUD) if (t >= k.t) h = k;
  hudTitle.textContent = h.title;
  hudLine.textContent = h.line;
  hudMeta.textContent = h.meta;

  for (const r of ripples) {
    const age = t - r.trigger;
    if (age >= 0 && age < 3.4) {
      const q = age / 3.4;
      r.rings.forEach((m, i) => {
        const p = Math.min(1, Math.max(0, (age - i * 0.22) / 2.7));
        const sc = 1 + p * 38;
        m.scale.set(sc, sc, 1);
        m.material.opacity = 0.8 * Math.pow(1 - p, 1.5) * (1 - i * 0.22);
        m.visible = p > 0 && p < 1;
      });
      r.glow.material.opacity = 0.9 * Math.pow(1 - q, 1.6);
      const gs = 8 + 18 * q;
      r.glow.scale.set(gs, gs, 1);
      r.light.intensity = 4.0 * Math.pow(1 - q, 2.2);
    } else {
      for (const m of r.rings) { m.material.opacity = 0; m.visible = false; }
      r.glow.material.opacity = 0;
      r.light.intensity = 0;
    }
  }

  const endcard = document.getElementById("endcard");
  if (endcard) endcard.style.opacity = String(ramp(t, 28.6, 0.6));

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
};

const params = new URLSearchParams(location.search);
const fixedT = params.has("t") ? Number(params.get("t")) : null;
window.__ready = true;
window.__seek(fixedT == null ? 0 : fixedT);
