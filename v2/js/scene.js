// Procedural architecture: one long building the camera travels through.
// Every structure is generated from the same primitives (slabs, columns, frames, glass, nodes, paths).
import * as THREE from '../vendor/three.module.min.js';

const COL = { bg: 0xF6F4EE, ink: 0x151513, surf: 0xFCFBF7, accent: 0xB56D43, green: 0x858C72, gray: 0xD9D6CE };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;

export function createScene(canvas, { mobile, reduced, idx }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(COL.bg);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COL.bg, 15, 50);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 150);

  /* ── materials ── */
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, ...o });
  const M = {
    white: std({ color: COL.surf }),
    concrete: std({ color: 0xE3E0D6, roughness: 1 }),
    glass: std({ color: 0xE9ECE4, roughness: 0.2, transparent: true, opacity: 0.3, depthWrite: false }),
    ink: std({ color: 0x2B2A26, roughness: 0.75 }),
    accent: std({ color: COL.accent, roughness: 0.6, emissive: COL.accent, emissiveIntensity: 0.3 }),
    green: std({ color: COL.green, roughness: 0.7, emissive: COL.green, emissiveIntensity: 0.2 }),
    paper: std({ color: 0xEFECE3 }),
  };
  const LM = new THREE.LineBasicMaterial({ color: COL.ink, transparent: true, opacity: 0 });
  const UNIT = new THREE.BoxGeometry(1, 1, 1);
  const EDGE = new THREE.EdgesGeometry(UNIT);

  /* ── static primitives: instanced boxes + one merged edge buffer ── */
  const stat = { white: [], concrete: [], glass: [], ink: [], accent: [] };
  const edgePts = [];
  const CORN = [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, .5, -.5], [-.5, .5, -.5], [-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]];
  const EDG = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];
  const Q0 = new THREE.Quaternion();
  function B(kind, w, h, d, x, y, z, edges = true) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), Q0, new THREE.Vector3(w, h, d));
    stat[kind].push(m);
    if (edges) {
      const v = CORN.map((c) => new THREE.Vector3(c[0], c[1], c[2]).applyMatrix4(m));
      for (const i of EDG) edgePts.push(v[i].x, v[i].y, v[i].z);
    }
  }
  function frameCube(cx, cy, cz, w, h, d, t = 0.07, kind = 'ink') {
    for (const a of [-1, 1]) for (const b of [-1, 1]) {
      B(kind, t, t, d, cx + a * w / 2, cy + b * h / 2, cz, false);
      B(kind, t, h, t, cx + a * w / 2, cy, cz + b * d / 2, false);
      B(kind, w, t, t, cx, cy + a * h / 2, cz + b * d / 2, false);
    }
  }

  /* ── dynamic primitives ── */
  function mesh(mat, w, h, d, x, y, z, parent, edges = false) {
    const o = new THREE.Mesh(UNIT, mat);
    o.scale.set(w, h, d); o.position.set(x, y, z);
    o.castShadow = !mat.transparent; o.receiveShadow = !mat.transparent;
    if (edges) o.add(new THREE.LineSegments(EDGE, LM));
    parent.add(o);
    return o;
  }
  function path(pts, color, parent, opacity = 1) {
    const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    l.userData.o = opacity;
    parent.add(l);
    return l;
  }
  const pop = (o, s, k) => { const v = Math.max(0.0001, k); o.scale.set(s[0] * v, s[1] * v, s[2] * v); o.visible = k > 0.001; };

  /* ════════ 1. THE HOUSE (hero / about) ════════ */
  const HX = 3.2;
  B('concrete', 17, 0.3, 12, HX, 0.15, 0);
  B('white', 11, 0.22, 7.4, HX - 1, 2.5, 0.3);
  B('white', 8.2, 0.22, 9, HX + 1.9, 4.8, -0.6);
  B('white', 13, 0.18, 5.2, HX - 1.4, 7, 0.9);
  B('concrete', 1.7, 9.4, 1.7, HX + 4.9, 5, -2.8);
  for (const [x, z] of [[-5.6, 3], [-5.6, -2.4], [-1.8, 3.4], [2.2, 3.4], [3.6, -3.6], [-2, -3], [5.4, 3.2]]) B('white', 0.18, 6.7, 0.18, HX + x, 3.65, z);
  B('glass', 4.2, 2.08, 3.2, HX - 3, 1.35, 1.2);
  B('glass', 3.6, 2.08, 4.6, HX + 2.6, 3.65, -1.2);
  B('glass', 5.4, 2.0, 2.6, HX - 2.2, 5.9, 1.2);
  B('white', 0.16, 2.08, 5.2, HX + 0.6, 3.65, -0.8);
  B('white', 4.4, 2.0, 0.16, HX - 4.6, 5.9, -0.6);
  for (let i = 0; i < 9; i++) B('white', 0.46, 0.1, 1.5, HX + 8.4 - i * 0.46, 0.5 + i * 0.25, 2.2, false);
  B('accent', 0.05, 0.05, 9, 0, 0.06, -10.5, false);
  B('accent', 8, 0.05, 0.05, -2.2, 2.66, 3, false);

  /* ════════ 2. THE HALL (how I think) ════════ */
  const hall = new THREE.Group(); scene.add(hall);
  const frames = [], strips = [], panels = [], lamps = [], hallNodes = [];
  const zig = [];
  for (let i = 0; i < 12; i++) {
    const z = -13 - 3.2 * i;
    const g = new THREE.Group(); g.position.z = z; hall.add(g);
    mesh(M.white, 0.24, 4.6, 0.24, -2.6, 2.3, 0, g, true);
    mesh(M.white, 0.24, 4.6, 0.24, 2.6, 2.3, 0, g, true);
    mesh(M.white, 5.44, 0.24, 0.24, 0, 4.72, 0, g, true);
    frames.push(g);
    strips.push(mesh(M.concrete, 3.4, 0.08, 2.5, 0, 0.04, z - 1.6, hall));
    const side = i % 2 ? 1 : -1;
    if (i % 3 !== 2) panels.push(mesh(M.glass, 0.05, 3.1, 2.7, side * 2.6, 1.75, z - 1.6, hall));
    lamps.push(mesh(M.accent, 1.3, 0.035, 0.035, 0, 4.56, z, hall));
    const p = [side * 2.6, 4.72, z];
    zig.push(p); if (i % 2 === 0) zig.push([side * 2.6, 0.1, z], p);
    hallNodes.push(mesh(M.accent, 0.13, 0.13, 0.13, p[0], p[1], p[2], hall));
  }
  const zigLine = path(zig, COL.accent, hall, 0.9);

  /* ════════ 3. PROJECT ROOMS ════════ */
  const ROOM_Z = (i) => -68 - 24 * i;
  const SIDE = (i) => (i % 2 === 0 ? 1 : -1);
  const rooms = [];
  for (let i = 0; i < 5; i++) {
    const cx = SIDE(i) * 4.7, cz = ROOM_Z(i);
    B('concrete', 8.6, 0.2, 8.6, cx, 0.1, cz);
    frameCube(cx, 2.8, cz, 7.4, 5.2, 7.4);
    const g = new THREE.Group(); g.position.set(cx, 0.2, cz); scene.add(g);
    rooms.push({ g, cx, cz, update: null });
  }

  // 01 — AI Software House: a manager node dispatches to specialist agents; QA feeds back.
  (() => {
    const g = rooms[0].g;
    const P = [[0, 4.1, 0], [-2.4, 1.5, 1.3], [-0.8, 1.5, -1.3], [0.8, 1.5, 1.3], [2.4, 1.5, -1.3]];
    const nodes = P.map((p, k) => mesh(k ? M.white : M.ink, k ? 0.72 : 0.9, k ? 0.72 : 0.9, k ? 0.72 : 0.9, p[0], p[1], p[2], g, !!k));
    const stems = P.slice(1).map((p) => mesh(M.ink, 0.04, p[1] - 0.36, 0.04, p[0], (p[1] - 0.36) / 2, p[2], g));
    const grid = [];
    for (let k = -3; k <= 3; k++) grid.push(path([[k, 0.02, -3], [k, 0.02, 3]], COL.ink, g, 0.12), path([[-3, 0.02, k], [3, 0.02, k]], COL.ink, g, 0.12));
    const links = P.slice(1).map((p) => path([P[0], p], COL.accent, g, 0.9));
    const chain = path(P.slice(1), COL.ink, g, 0.35);
    const back = path([P[4], [3.1, 3.3, -1.3], [1.4, 4.4, -0.6], P[0]], COL.green, g, 0.9);
    const pulses = P.slice(1).map(() => mesh(M.accent, 0.13, 0.13, 0.13, 0, 0, 0, g));
    rooms[0].update = (t, time) => {
      nodes.forEach((n, k) => pop(n, k ? [.72, .72, .72] : [.9, .9, .9], sm(k * 0.1, k * 0.1 + 0.3, t)));
      stems.forEach((s, k) => { s.visible = t > 0.1 + k * 0.1; });
      const lo = sm(0.4, 0.8, t);
      [...links, chain, back, ...grid].forEach((l) => { l.material.opacity = l.userData.o * lo; });
      pulses.forEach((p, k) => {
        const a = P[0], b = P[k + 1], u = (time * 0.00028 + k * 0.23) % 1;
        p.visible = t > 0.85;
        p.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
      });
    };
  })();

  // 02 — StellenPortal: streams pass between a candidate side and an employer side through the portal.
  (() => {
    const g = rooms[1].g, r = rng(11);
    const walls = [-2.5, 0, 2.5].map((x, k) => mesh(k === 1 ? M.white : M.glass, 0.08, 3.6, 4.6, x, 2.1, 0, g, k === 1));
    const bits = [];
    for (let k = 0; k < (mobile ? 16 : 26); k++) {
      const m = mesh(k % 4 === 0 ? M.accent : M.ink, 0.26, 0.045, 0.045, 0, 0, 0, g);
      m.userData = { y: 0.6 + r() * 3, z: -2 + r() * 4, row: 0.9 + (k % 4) * 0.8, lane: -1.5 + (k % 5) * 0.75, sp: 0.00012 + r() * 0.00014, ph: r(), dir: k % 2 ? 1 : -1 };
      bits.push(m);
    }
    rooms[1].update = (t, time) => {
      walls.forEach((w, k) => { const e = sm(k * 0.15, k * 0.15 + 0.45, t); w.scale.y = Math.max(0.001, 3.6 * e); w.position.y = 0.3 + 1.8 * e; w.visible = e > 0.01; });
      bits.forEach((b) => {
        const d = b.userData, u = (time * d.sp + d.ph) % 1, x = (u * 2 - 1) * 3.5 * d.dir;
        const o = sm(-0.4, 0.5, x * d.dir);
        b.visible = t > 0.6;
        b.position.set(x, lerp(d.y, d.row, o), lerp(d.z, d.lane, o));
      });
    };
  })();

  // 03 — AI Job Assistant: document pages break into tiles and settle as measured, structured bars.
  (() => {
    const g = rooms[2].g, r = rng(29), tiles = [];
    const qa = new THREE.Quaternion(), ea = new THREE.Euler();
    for (let s = 0; s < 3; s++) {
      ea.set(-1.15 + s * 0.12, 0.35 - s * 0.3, 0.12 * (s - 1)); qa.setFromEuler(ea);
      const base = new THREE.Vector3(-1.7 + s * 1.7, 3.4 - s * 0.35, -0.8 + s * 0.8);
      for (let k = 0; k < 16; k++) {
        const n = s * 16 + k, col = n % 12, row = Math.floor(n / 12), h = 0.25 + r() * 1.7;
        const local = new THREE.Vector3(((k % 4) - 1.5) * 0.47, 0, (Math.floor(k / 4) - 1.5) * 0.6).applyQuaternion(qa).add(base);
        const m = mesh(r() < 0.6 ? M.accent : M.paper, 0.44, 0.03, 0.56, 0, 0, 0, g);
        m.userData = { a: local, qa: qa.clone(), b: new THREE.Vector3(-2.75 + col * 0.5, h / 2, -0.9 + row * 0.6), h, d: r() * 0.35 };
        tiles.push(m);
      }
    }
    rooms[2].update = (t, time) => {
      tiles.forEach((m, n) => {
        const d = m.userData, e = sm(0.15 + d.d, 0.65 + d.d, t);
        m.position.lerpVectors(d.a, d.b, e);
        if (e < 1) m.position.y += Math.sin(time * 0.0006 + n) * 0.03 * (1 - e);
        m.quaternion.copy(d.qa).slerp(Q0, e);
        m.scale.set(lerp(0.44, 0.36, e), lerp(0.03, d.h, e), lerp(0.56, 0.36, e));
        m.visible = t > 0.02;
      });
    };
  })();

  // 04 — DataOps Framework: independent services, a discovery hub above them, events moving through.
  (() => {
    const g = rooms[3].g;
    const S = [[-2.2, 1.7, -1.2], [0, 1.7, -1.2], [2.2, 1.7, -1.2], [2.2, 1.7, 1.2], [0, 1.7, 1.2], [-2.2, 1.7, 1.2]];
    const cubes = S.map((p) => mesh(M.white, 0.95, 0.95, 0.95, p[0], p[1], p[2], g, true));
    const legs = S.map((p) => mesh(M.ink, 0.05, 1.2, 0.05, p[0], 0.6, p[2], g));
    const ring = path([...S, S[0]], COL.ink, g, 0.55);
    const hub = mesh(M.ink, 0.5, 0.5, 0.5, 0, 4.0, 0, g);
    const spokes = S.map((p) => path([[0, 4, 0], p], COL.green, g, 0.55));
    const twin = mesh(M.glass, 0.95, 0.95, 0.95, 3.4, 1.7, -1.2, g, true);
    const ev = []; for (let k = 0; k < (mobile ? 6 : 10); k++) ev.push(mesh(M.accent, 0.15, 0.15, 0.15, 0, 0, 0, g));
    rooms[3].update = (t, time) => {
      cubes.forEach((c, k) => pop(c, [.95, .95, .95], sm(k * 0.08, k * 0.08 + 0.3, t)));
      legs.forEach((l, k) => { l.visible = t > k * 0.08 + 0.05; });
      const lo = sm(0.45, 0.8, t);
      ring.material.opacity = 0.55 * lo; spokes.forEach((s) => { s.material.opacity = 0.55 * lo; });
      pop(hub, [.5, .5, .5], sm(0.4, 0.7, t));
      pop(twin, [.95, .95, .95], t > 0.9 ? sm(0.1, 0.5, Math.sin(time * 0.0005) * 0.5 + 0.5) : 0);
      ev.forEach((e, k) => {
        const u = ((time * 0.00016 + k / ev.length) % 1) * 6, i = Math.floor(u), f = u - i, a = S[i % 6], b = S[(i + 1) % 6];
        e.visible = t > 0.8;
        e.position.set(lerp(a[0], b[0], f), 1.7, lerp(a[2], b[2], f));
      });
    };
  })();

  // 05 — Neuro Tracker: scattered symptom points settle onto a decision tree; one path resolves and reaches a doctor.
  (() => {
    const g = rooms[4].g, r = rng(53);
    const N = [[0, 4.3, 0], [-1.7, 3, 0], [1.7, 3, 0], [-2.5, 1.7, 0.7], [-0.9, 1.7, -0.7], [0.9, 1.7, 0.7], [2.5, 1.7, -0.7]];
    const E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    const tree = E.map(([a, b]) => path([N[a], N[b]], COL.ink, g, 0.45));
    const nodes = N.map((p, k) => mesh(k === 0 ? M.ink : M.white, 0.34, 0.34, 0.34, p[0], p[1], p[2], g, k > 0));
    const result = path([N[0], N[2], N[5]], COL.accent, g, 1);
    const doctor = mesh(M.green, 0.5, 0.5, 0.5, 2.7, 0.45, 1.9, g);
    const refer = path([N[5], [2.7, 0.45, 1.9]], COL.green, g, 1);
    const pts = [];
    for (let k = 0; k < (mobile ? 20 : 32); k++) {
      const [a, b] = E[k % 6], u = r();
      const m = mesh(M.ink, 0.09, 0.09, 0.09, 0, 0, 0, g);
      m.userData = { a: new THREE.Vector3((r() - .5) * 6.4, 0.6 + r() * 4, (r() - .5) * 6.4), b: new THREE.Vector3(lerp(N[a][0], N[b][0], u), lerp(N[a][1], N[b][1], u), lerp(N[a][2], N[b][2], u)), d: r() * 0.3 };
      pts.push(m);
    }
    rooms[4].update = (t, time) => {
      pts.forEach((m, n) => {
        const d = m.userData, e = sm(0.2 + d.d, 0.7 + d.d, t);
        m.position.lerpVectors(d.a, d.b, e);
        m.position.y += Math.sin(time * 0.0007 + n * 1.7) * 0.06 * (1 - e);
        m.visible = t > 0.02;
      });
      const lo = sm(0.35, 0.7, t);
      tree.forEach((l) => { l.material.opacity = 0.45 * lo; });
      nodes.forEach((n, k) => pop(n, [.34, .34, .34], sm(0.3 + k * 0.04, 0.6 + k * 0.04, t)));
      result.material.opacity = sm(0.78, 0.95, t);
      refer.material.opacity = sm(0.88, 1, t);
      pop(doctor, [.5, .5, .5], sm(0.86, 1, t));
    };
  })();

  /* ════════ 4. THE STACK ════════ */
  const SX = mobile ? 0 : 4.6, SZ = -192, TH = 1.75;
  const tierMat = [0, 1, 2, 3].map(() => M.white.clone());
  tierMat.forEach((m) => { m.emissive = new THREE.Color(COL.accent); m.emissiveIntensity = 0; });
  const tierGlow = [0, 0, 0, 0];
  let tierTarget = null;
  B('concrete', 10, 0.3, 7.8, SX, 0.15, SZ);
  const stack = new THREE.Group(); stack.position.set(SX, 0.3, SZ); scene.add(stack);
  for (let k = 0; k < 4; k++) {
    const w = 8.6 - k * 0.7, d = 6.4 - k * 0.5, y0 = k * TH;
    mesh(tierMat[k], w, 0.2, d, (k % 2 ? 0.5 : -0.3), y0 + TH - 0.1, 0, stack, true);
    for (const a of [-1, 1]) for (const b of [-1, 1]) mesh(tierMat[k], 0.16, TH - 0.2, 0.16, a * (w / 2 - 0.5) + (k % 2 ? 0.5 : -0.3), y0 + (TH - 0.2) / 2, b * (d / 2 - 0.5), stack);
  }
  mesh(tierMat[0], 7.2, 1.3, 0.3, -0.3, 0.65, -2.2, stack, true);                      // foundation: load-bearing wall
  mesh(tierMat[0], 0.3, 1.3, 3.6, -3.2, 0.65, -0.3, stack, true);
  for (let k = 0; k < 3; k++) mesh(tierMat[1], 1.3, 1.0, 1.3, -2 + k * 2.3, TH + 0.5, 0.4, stack, true); // services: blocks
  const brain = [[-2.2, 0.5], [-0.6, -0.7], [0.9, 0.6], [2.4, -0.4]];
  brain.forEach(([x, z]) => mesh(M.accent, 0.3, 0.3, 0.3, x - 0.2, TH * 2 + 0.75, z, stack));          // intelligence: linked nodes
  path(brain.map(([x, z]) => [x - 0.2, TH * 2 + 0.75, z]), COL.accent, stack, 0.9);
  mesh(M.glass, 5.4, 1.5, 3.8, 0.4, TH * 3 + 0.75, 0, stack, true);                                      // interface: the window

  /* ════════ 5. EXPERIENCE BEAM ════════ */
  const EX = mobile ? 0 : 4.4, EZ = -218;
  B('concrete', 5.4, 0.2, 5.4, EX, 0.1, EZ);
  const beam = mesh(M.ink, 0.24, 15, 0.24, EX, 7.5, EZ, scene);
  [[3.4, 1], [8.2, -1]].forEach(([y, s]) => {
    frameCube(EX + s * 1.8, y, EZ, 3.3, 2.5, 3.3);
    B('white', 3.3, 0.14, 3.3, EX + s * 1.8, y - 1.25, EZ);
    B('accent', 0.34, 0.34, 0.34, EX, y, EZ, false);
  });

  /* ════════ 6. EDUCATION ════════ */
  const DX = mobile ? 0 : -3.2;
  B('concrete', 7.4, 0.16, 3.6, DX, 0.08, -244);
  B('white', 0.46, 3.4, 1.5, DX - 1.5, 1.86, -244);
  B('white', 0.46, 2.6, 1.5, DX + 0.4, 1.46, -244);
  B('white', 0.3, 1.0, 0.9, DX + 1.9, 0.66, -244);

  /* flush statics */
  for (const kind in stat) {
    const arr = stat[kind]; if (!arr.length) continue;
    const im = new THREE.InstancedMesh(UNIT, M[kind], arr.length);
    arr.forEach((m, i) => im.setMatrixAt(i, m));
    im.castShadow = im.receiveShadow = kind !== 'glass';
    im.frustumCulled = false;
    scene.add(im);
  }
  const eg = new THREE.BufferGeometry();
  eg.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
  const edges = new THREE.LineSegments(eg, LM); edges.frustumCulled = false; scene.add(edges);

  /* ── light ── */
  const hemi = new THREE.HemisphereLight(0xFFFFFF, 0xD8D0BE, 3.05);
  const sun = new THREE.DirectionalLight(0xFFF5E8, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.05;
  const lamp = new THREE.PointLight(0xFFEBD6, 0, 18, 1.7);   // the pointer is light
  const hot = new THREE.PointLight(0xFFE2C2, 0, 16, 1.6);    // hovered project
  scene.add(hemi, sun, sun.target, lamp, hot);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.ShadowMaterial({ color: 0x5E513F, opacity: 0.17 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  /* ── camera path: one keyframe per anchor in the page ── */
  const KF = {
    hero: [[-3.5, 3.4, 21], [3.4, 3.7, 0]],
    about: [[-8.2, 2.0, 9.5], [3.4, 4.3, -1]],
    p1: [[0, 1.9, -9.5], [0, 2.4, -30]],
    p2: [[0.9, 1.7, -19], [-0.4, 2.5, -40]],
    p3: [[-0.9, 2.4, -28], [0.5, 2.2, -48]],
    p4: [[0, 1.9, -37.5], [0, 2.3, -60]],
    gate: [[0, 2.4, -49.5], [3.4, 2.7, -68]],
    stack: [[-2.8, 4.4, SZ + 17.5], [SX - 4, 3.4, SZ]],
    exp: [[-3.2, 5.2, EZ + 15], [EX - 3.5, 5.8, EZ]],
    edu: [[1.6, 1.9, -229.5], [DX, 1.8, -244]],
    exit: [[3, 17, -221], [DX, 0, -247]],
  };
  for (let i = 0; i < 5; i++) { const s = i % 2 === 0 ? 1 : -1; KF['w' + (i + 1)] = [[-s * 2.4, 2.9, ROOM_Z(i) + 13.5], [s * 2.0, 2.5, ROOM_Z(i)]]; }
  if (mobile) {
    KF.hero = [[0, 4.4, 30], [HX - 2.6, 1.2, 0]];
    KF.about = [[7, 2.2, 15], [2.4, 2.6, 0]];
    for (let i = 0; i < 5; i++) KF['w' + (i + 1)] = [[SIDE(i) * 4.7, 4.4, ROOM_Z(i) + 23], [SIDE(i) * 4.7, -3.6, ROOM_Z(i)]];
    KF.gate = [[0, 2.6, -47], [0, 1.6, -68]];
    KF.stack = [[0, 6, SZ + 30], [0, -4.5, SZ]];
    KF.exp = [[0, 6, EZ + 24], [0, 2.4, EZ]];
    KF.edu = [[0, 2.4, -227], [0, 0.2, -244]];
  }
  const names = Object.keys(idx).sort((a, b) => idx[a] - idx[b]);
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const posCurve = new THREE.CatmullRomCurve3(names.map((n) => V(KF[n][0])), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(names.map((n) => V(KF[n][1])), false, 'centripetal');
  const last = names.length - 1;

  /* ── state ── */
  const P = new THREE.Vector3(), T = new THREE.Vector3(), ray = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
  let fS = -1, prev = 0, t0 = 0, hotI = -1, hotK = 0;
  const state = { white: 0 };
  const R = (name, a, b) => sm(idx[name] + a, idx[name] + b, fS);

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 56 : camera.aspect < 1.25 ? 46 : 38;
    camera.updateProjectionMatrix();
  }
  resize();

  function update(fT, time) {
    if (!t0) { t0 = time; prev = time; }
    const dt = Math.min(0.05, (time - prev) / 1000); prev = time;
    fS = fS < 0 || reduced ? fT : fS + (fT - fS) * (1 - Math.exp(-dt * 4));
    const k = reduced ? 1 : 1 - Math.exp(-dt * 5);
    const now = reduced ? 0 : time;

    // arrival: the model is nearly invisible, then daylight finds it
    const intro = reduced ? 1 : sm(0.2, 3.2, (time - t0) / 1000);
    const white = R('exit', -0.6, 0);
    state.white = white;
    hemi.intensity = lerp(3.05, 2.42, intro) + white * 0.6;
    sun.intensity = lerp(0, 1.05, intro) * (1 - white * 0.6);
    LM.opacity = lerp(0, 0.24, intro);
    scene.fog.near = lerp(15, 1.5, white); scene.fog.far = lerp(50, 16, white);

    // camera
    const u = clamp(fS / last);
    posCurve.getPoint(u, P); tgtCurve.getPoint(u, T);
    ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k; ptr.on += (ptr.ton - ptr.on) * k * 0.6;
    camera.position.copy(P); camera.lookAt(T);
    right.setFromMatrixColumn(camera.matrix, 0); up.setFromMatrixColumn(camera.matrix, 1);
    camera.position.addScaledVector(right, ptr.x * 0.4 + Math.sin(now * 0.00021) * 0.07).addScaledVector(up, ptr.y * 0.24 + Math.sin(now * 0.00017 + 1) * 0.05);
    camera.lookAt(T);

    // pointer light, placed on the pointer ray in front of the camera
    ray.set(ptr.x, ptr.y, 0.5).unproject(camera).sub(camera.position).normalize();
    lamp.position.copy(camera.position).addScaledVector(ray, 8);
    lamp.intensity = ptr.on * 20;

    // daylight follows the traveller
    sun.target.position.set(Math.round(T.x), 0, Math.round(lerp(P.z, T.z, 0.6)));
    sun.position.copy(sun.target.position).add(ray.set(10, 17, 8));
    floor.position.set(sun.target.position.x, 0, sun.target.position.z);

    // hall: assemble → become functional → connect
    const asm = R('p1', -1.05, 0.2), fun = R('p1', 0.45, 1.05), con = R('p2', 0.45, 1.1);
    frames.forEach((g, i) => { const e = sm(i * 0.05, i * 0.05 + 0.4, asm); g.scale.y = Math.max(0.001, e); g.visible = e > 0.002; });
    strips.forEach((s, i) => { const e = sm(i * 0.05, i * 0.05 + 0.4, fun); s.scale.x = Math.max(0.001, 3.4 * e); s.visible = e > 0.002; });
    panels.forEach((p, i) => { const e = sm(i * 0.06, i * 0.06 + 0.4, fun); p.scale.y = Math.max(0.001, 3.1 * e); p.position.y = 0.2 + 1.55 * e; p.visible = e > 0.002; });
    lamps.forEach((l, i) => { const e = sm(i * 0.05 + 0.2, i * 0.05 + 0.6, fun); l.scale.x = Math.max(0.001, 1.3 * e); l.visible = e > 0.002; });
    zigLine.geometry.setDrawRange(0, Math.floor(zig.length * con));
    hallNodes.forEach((n, i) => pop(n, [.13, .13, .13], sm(i / 12, i / 12 + 0.1, con)));

    // rooms assemble as the camera approaches
    rooms.forEach((r, i) => { const t = reduced ? 1 : R('w' + (i + 1), -0.9, -0.06); r.g.visible = t > 0.001; if (r.g.visible) r.update(t, now); });
    hotK += ((hotI >= 0 ? 1 : 0) - hotK) * k;
    if (hotI >= 0) hot.position.set(rooms[hotI].cx, 3.4, rooms[hotI].cz + 2.5);
    hot.intensity = hotK * 46;

    // stack: hovered layers warm up
    for (let i = 0; i < 4; i++) {
      tierGlow[i] += ((tierTarget && tierTarget.has(i) ? 1 : 0) - tierGlow[i]) * k;
      tierMat[i].emissiveIntensity = tierGlow[i] * 0.42;
    }

    // experience: the line becomes a beam
    const grow = reduced ? 1 : R('exp', -0.7, 0.15);
    beam.scale.y = Math.max(0.001, 15 * grow); beam.position.y = 7.5 * grow;

    renderer.render(scene, camera);
  }

  return {
    update, resize, state,
    pointer(x, y, on) { ptr.tx = x; ptr.ty = y; ptr.ton = on ? 1 : 0; },
    setTiers(set) { tierTarget = set; },
    setHot(i) { hotI = i; },
  };
}
