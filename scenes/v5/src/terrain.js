import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const W = 1280, H = 720;
const params = new URLSearchParams(location.search);
const chapter = params.get("chapter") || "geo";

const CONFIG = {
  geo: {
    duration: 19,
    kicker: "BEIJING / 01 GEOGRAPHY",
    title: "山与平原",
    line: "16,410 km²",
    meta: "西、北、东北三面环山 · 东南平原 · DEM: SRTM / Mapzen",
    labels: ["燕山", "太行山", "华北平原", "永定河", "潮白河", "北京"],
  },
  history: {
    duration: 13,
    kicker: "BEIJING / 02 ORIGINS",
    title: "三千年",
    line: "70 万年人居 / 3000 年建城",
    meta: "周口店 · 琉璃河 · 燕",
    labels: ["周口店", "琉璃河", "北京"],
  },
  new: {
    duration: 9,
    kicker: "BEIJING / 06 NEW CITY",
    title: "新北京",
    line: "16 区 / 2,183 万",
    meta: "中关村 · 首钢园 · 城市副中心",
    labels: ["中关村", "首钢园", "副中心", "北京"],
  },
  close: {
    duration: 15,
    kicker: "BEIJING / 07",
    title: "北京",
    line: "三千年建城 · 八百年建都",
    meta: "山、平原与两千多万人的日常",
    labels: ["北京"],
  },
};
const cfg = CONFIG[chapter] || CONFIG.geo;

const stage = document.getElementById("stage");
const hudKicker = document.getElementById("hud-kicker");
const hudTitle = document.getElementById("hud-title");
const hudLine = document.getElementById("hud-line");
const hudMeta = document.getElementById("hud-meta");
const endtitle = document.getElementById("endtitle");

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
scene.background = new THREE.Color(0x07090d);
scene.fog = new THREE.Fog(0x07090d, 320, 1300);

const camera = new THREE.PerspectiveCamera(38, W / H, 0.5, 3000);

scene.add(new THREE.HemisphereLight(0xfff8f0, 0x0b0d12, 0.9));
const key = new THREE.DirectionalLight(0xfff3df, 1.9);
key.position.set(180, 300, 220);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -300;
key.shadow.camera.right = 300;
key.shadow.camera.top = 300;
key.shadow.camera.bottom = -300;
key.shadow.camera.near = 1;
key.shadow.camera.far = 1200;
key.shadow.bias = -0.0005;
scene.add(key);
const fill = new THREE.DirectionalLight(0x8aa8ff, 0.7);
fill.position.set(-300, 160, -220);
scene.add(fill);
scene.add(new THREE.AmbientLight(0xffffff, 0.12));

// --- real DEM: Beijing (SRTM / Mapzen Terrarium), 240x200 ---
const HM = window.BJ_HEIGHTMAP;
const [LON0, LAT0, LON1, LAT1] = HM.bbox;
const TERRAIN_W = 260, TERRAIN_D = 220;

function project(lon, lat) {
  return [
    (lon - LON0) / (LON1 - LON0) * TERRAIN_W - TERRAIN_W / 2,
    (LAT1 - lat) / (LAT1 - LAT0) * TERRAIN_D - TERRAIN_D / 2,
  ];
}

function heightAt(x, z) {
  const lon = LON0 + (x + TERRAIN_W / 2) / TERRAIN_W * (LON1 - LON0);
  const lat = LAT1 - (z + TERRAIN_D / 2) / TERRAIN_D * (LAT1 - LAT0);
  const fx = (lon - LON0) / (LON1 - LON0) * (HM.w - 1);
  const fy = (LAT1 - lat) / (LAT1 - LAT0) * (HM.h - 1);
  const x0 = Math.max(0, Math.min(HM.w - 1, Math.floor(fx)));
  const y0 = Math.max(0, Math.min(HM.h - 1, Math.floor(fy)));
  const x1 = Math.min(HM.w - 1, x0 + 1);
  const y1 = Math.min(HM.h - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  const d = HM.data;
  const h00 = d[y0 * HM.w + x0], h10 = d[y0 * HM.w + x1];
  const h01 = d[y1 * HM.w + x0], h11 = d[y1 * HM.w + x1];
  const m = (h00 * (1 - tx) + h10 * tx) * (1 - ty) + (h01 * (1 - tx) + h11 * tx) * ty;
  return Math.max(0, m) * 0.013;
}

const plate = new THREE.Mesh(
  new THREE.BoxGeometry(286, 5, 246),
  new THREE.MeshStandardMaterial({ color: 0x0c0f15, roughness: 1 })
);
plate.position.set(0, -3.6, 0);
plate.receiveShadow = true;
scene.add(plate);

const underlay = new THREE.Mesh(
  new THREE.BoxGeometry(266, 1.2, 226),
  new THREE.MeshStandardMaterial({ color: 0xe9e4d8, roughness: 0.95 })
);
underlay.position.set(0, -1.0, 0);
underlay.receiveShadow = true;
scene.add(underlay);

const terrainGeo = new THREE.PlaneGeometry(260, 220, 170, 150);
terrainGeo.rotateX(-Math.PI / 2);
const pos = terrainGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), z = pos.getZ(i);
  pos.setY(i, heightAt(x, z));
}
terrainGeo.computeVertexNormals();
const terrainMat = new THREE.MeshStandardMaterial({
  color: 0xf1f1ee, roughness: 0.94, metalness: 0, flatShading: false,
});
const terrain = new THREE.Mesh(terrainGeo, terrainMat);
terrain.castShadow = true;
terrain.receiveShadow = true;
scene.add(terrain);

// rivers
function riverLine(points, color) {
  const v = points.map(([lon, lat]) => {
    const [x, z] = project(lon, lat);
    return new THREE.Vector3(x, heightAt(x, z) + 0.6, z);
  });
  const curve = new THREE.CatmullRomCurve3(v);
  const geo = new THREE.TubeGeometry(curve, 100, 0.55, 6, false);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
}
riverLine([[115.55,40.35],[115.85,40.05],[116.05,39.82],[116.30,39.60],[116.65,39.38]], 0x6fa3b8);
riverLine([[116.55,40.75],[116.68,40.45],[116.70,40.15],[116.82,39.82],[117.00,39.52]], 0x6fa3b8);

// city marker
const [cityX, cityZ] = project(116.40, 39.90);
const cityY = heightAt(cityX, cityZ);
const cityRing = new THREE.Mesh(
  new THREE.RingGeometry(2.4, 3.4, 64),
  new THREE.MeshBasicMaterial({ color: 0xe0a15e, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
);
cityRing.rotation.x = -Math.PI / 2;
cityRing.position.set(cityX, cityY + 0.8, cityZ);
scene.add(cityRing);

// glow sprite for points
const glowCanvas = document.createElement("canvas");
glowCanvas.width = glowCanvas.height = 128;
const gctx = glowCanvas.getContext("2d");
const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
grad.addColorStop(0, "rgba(255,214,158,1)");
grad.addColorStop(0.35, "rgba(255,180,110,.4)");
grad.addColorStop(1, "rgba(255,180,110,0)");
gctx.fillStyle = grad;
gctx.fillRect(0, 0, 128, 128);
const glowTex = new THREE.CanvasTexture(glowCanvas);

const labelDefs = {
  "燕山": [116.62, 40.66, "mountain"],
  "太行山": [115.72, 40.02, "mountain"],
  "华北平原": [116.86, 39.55, "plain"],
  "永定河": [116.05, 39.84, "river"],
  "潮白河": [116.74, 40.14, "river"],
  "北京": [116.40, 39.90, "city"],
  "周口店": [115.93, 39.68, "point"],
  "琉璃河": [116.03, 39.60, "point"],
  "中关村": [116.31, 39.98, "point"],
  "首钢园": [116.18, 39.91, "point"],
  "副中心": [116.66, 39.91, "point"],
};
const labels = [];
for (const [text, [lon, lat, kind]] of Object.entries(labelDefs)) {
  const [x, z] = project(lon, lat);
  const div = document.createElement("div");
  div.className = "label " + kind;
  div.textContent = text;
  div.style.opacity = "0";
  const obj = new CSS2DObject(div);
  const y = heightAt(x, z) + (kind === "mountain" ? 10 : 3);
  obj.position.set(x, y, z);
  scene.add(obj);
  labels.push({ text, el: div, kind });
  if (kind === "point" || kind === "city") {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffc47a, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    sp.scale.set(kind === "city" ? 14 : 9, kind === "city" ? 14 : 9, 1);
    sp.position.set(x, y + 1.5, z);
    scene.add(sp);
    labels[labels.length - 1].glow = sp;
  }
}

// camera paths per chapter
const PATHS = {
  geo: {
    pos: [[-130, 320, 330], [-40, 300, 290], [40, 285, 260], [110, 270, 240]],
    target: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
  history: {
    pos: [[0, 330, 290], [0, 300, 245], [0, 275, 215]],
    target: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
  new: {
    pos: [[0, 310, 250], [20, 290, 215], [40, 270, 195]],
    target: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
  close: {
    pos: [[160, 250, 290], [200, 270, 330], [230, 290, 360]],
    target: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
};
const path = PATHS[chapter] || PATHS.geo;
const posCurve = new THREE.CatmullRomCurve3(path.pos.map(p => new THREE.Vector3(...p)));
const targetCurve = new THREE.CatmullRomCurve3(path.target.map(p => new THREE.Vector3(...p)));

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const ramp = (t, a, d) => ease((t - a) / d);

const active = new Set(cfg.labels);
hudKicker.textContent = cfg.kicker;
hudTitle.textContent = cfg.title;
hudLine.textContent = cfg.line;
hudMeta.textContent = cfg.meta;

window.__duration = cfg.duration;
window.__preview = Math.min(cfg.duration - 1, chapter === "geo" ? 10 : chapter === "history" ? 6 : chapter === "new" ? 5 : 8);

window.__seek = (t) => {
  const p = ease(clamp01(t / cfg.duration));
  camera.position.copy(posCurve.getPointAt(p));
  camera.lookAt(targetCurve.getPointAt(p));

  for (const l of labels) {
    const isActive = active.has(l.text);
    let op = isActive ? ramp(t, 0.8, 0.9) : 0;
    if (chapter === "geo" && l.kind === "point") op = 0;
    if (chapter === "history" && !["周口店", "琉璃河", "北京"].includes(l.text)) op = 0;
    if (chapter === "new" && !["中关村", "首钢园", "副中心", "北京"].includes(l.text)) op = 0;
    if (chapter === "close" && l.text !== "北京") op = 0;
    l.el.style.opacity = String(op);
    if (l.glow) l.glow.material.opacity = 0.85 * op * (0.65 + 0.35 * Math.sin(t * 2.2));
  }

  if (endtitle) {
    endtitle.style.opacity = chapter === "close" ? String(ramp(t, 7.5, 0.8)) : "0";
  }

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
};

const fixedT = params.has("t") ? Number(params.get("t")) : null;
window.__ready = true;
window.__seek(fixedT == null ? 0 : fixedT);
