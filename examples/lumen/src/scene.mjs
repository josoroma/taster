import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** A completely procedural, physically lit garden. World units are meters. */
export function createScene(canvas, { quality = 'high', reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#93b4a8');
  scene.fog = new THREE.FogExp2('#93b4a8', 0.0045);
  const camera = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.1, 180);
  const cameraTarget = new THREE.Vector3(0, 0.25, -0.4);
  const baseCamera = new THREE.Vector3(20, 23, 28);
  camera.position.copy(baseCamera);
  camera.lookAt(cameraTarget);
  let cameraMode = 'isometric', mobileActive = false;
  let width = 1, height = 1, currentQuality = quality, disposed = false;
  let seed = 192416;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const between = (a, b) => a + random() * (b - a);
  const geometries = new Set(), materials = new Set(), textures = new Set();
  const ownGeometry = (g) => { geometries.add(g); return g; };
  const ownMaterial = (m) => { materials.add(m); return m; };
  const material = (color, roughness = 0.8, metalness = 0, extra = {}) => ownMaterial(new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra }));
  const stone = material('#b4af96');
  const paleStone = material('#cbc5a8');
  const stoneDark = material('#737b6c');
  const stoneWet = material('#747f73', 0.42);
  const foundation = material('#5b6f63');
  const moss = material('#687c46');
  const mossDark = material('#394e34');
  const copper = material('#8a6441', 0.36, 0.76);
  const bronze = material('#c2a15e', 0.3, 0.72);
  const patina = material('#4d887b', 0.55, 0.58);
  const darkMetal = material('#344645', 0.35, 0.65);
  const black = material('#162f31', 0.27, 0.35);
  const ivory = material('#f0e6c9', 0.4, 0.18);
  const green = material('#5c7943', 0.92, 0, { side: THREE.DoubleSide });
  const lightGreen = material('#9aab61', 0.9, 0, { side: THREE.DoubleSide });
  const fernMat = material('#416e48', 0.95, 0, { side: THREE.DoubleSide });
  const reedMat = material('#a5a163');
  const flowerMat = material('#f3e9af', 0.8);
  const glowGold = material('#ffe6a0', 0.3, 0.1, { emissive: '#ffbd55', emissiveIntensity: 2.3 });
  const glowMint = material('#b5fff0', 0.25, 0.05, { emissive: '#5ce9cc', emissiveIntensity: 2.4 });
  const geo = {
    cube: ownGeometry(new RoundedBoxGeometry(1, 1, 1, 2, 0.035)),
    plain: ownGeometry(new THREE.BoxGeometry(1, 1, 1)),
    cylinder: ownGeometry(new THREE.CylinderGeometry(1, 1, 1, 18)),
    taper: ownGeometry(new THREE.CylinderGeometry(0.72, 1, 1, 12)),
    sphere: ownGeometry(new THREE.SphereGeometry(1, 16, 10)),
    rock: ownGeometry(new THREE.IcosahedronGeometry(1, 1)),
    crystal: ownGeometry(new THREE.OctahedronGeometry(1)),
  };
  const sharedGeometries = new Map();
  function torus(radius, tube, segments = 48) {
    const key = `${radius}/${tube}/${segments}`;
    if (!sharedGeometries.has(key)) sharedGeometries.set(key, ownGeometry(new THREE.TorusGeometry(radius, tube, 8, segments)));
    return sharedGeometries.get(key);
  }
  const fixed = new Map();
  const pose = new THREE.Object3D();
  const color = new THREE.Color();
  const detailGroups = [];
  function stamp(g, m, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, tint = null, detail = false, shadow = true) {
    const key = `${g.uuid}/${m.uuid}/${detail}/${shadow}`;
    if (!fixed.has(key)) fixed.set(key, { g, m, matrices: [], colors: [], detail, shadow });
    pose.position.set(x, y, z); pose.scale.set(sx, sy, sz); pose.rotation.set(rx, ry, rz); pose.updateMatrix();
    const batch = fixed.get(key);
    batch.matrices.push(pose.matrix.clone());
    batch.colors.push(tint || '#ffffff');
  }
  const box = (x, y, z, w, h, d, m = stone, ry = 0, tint = null, detail = false) => stamp(geo.cube, m, x, y, z, w, h, d, 0, ry, 0, tint, detail);
  const cylinder = (x, y, z, r, h, m, ry = 0) => stamp(geo.cylinder, m, x, y, z, r, h, r, 0, ry);
  const ring = (x, y, z, r, tube, m, rx = Math.PI / 2) => stamp(torus(r, tube), m, x, y, z, 1, 1, 1, rx);
  function mesh(g, m, group, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const item = new THREE.Mesh(g, m); item.position.set(x, y, z); item.scale.set(sx, sy, sz);
    item.castShadow = true; item.receiveShadow = true; group.add(item); return item;
  }

  // Soft sky fill, low amber sunlight and a reflected mint fill from the water.
  scene.add(new THREE.HemisphereLight('#dbead7', '#30453b', 0.7));
  const sun = new THREE.DirectionalLight('#ffe1a2', 3.6);
  sun.position.set(-18, 27, -12); sun.castShadow = true;
  sun.shadow.camera.left = -25; sun.shadow.camera.right = 25; sun.shadow.camera.top = 25; sun.shadow.camera.bottom = -25;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 80;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.045;
  sun.shadow.radius = 3; scene.add(sun);
  const bounce = new THREE.DirectionalLight('#98d6cb', 0.3); bounce.position.set(10, 8, 16); scene.add(bounce);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.4;
  room.dispose(); pmrem.dispose();

  // Mineral grain, darkened edges and soft lichen stains are baked once into a tiny shared map.
  const stoneCanvas=document.createElement('canvas');stoneCanvas.width=stoneCanvas.height=128;
  const stoneContext=stoneCanvas.getContext('2d');stoneContext.fillStyle='#e0ddd0';stoneContext.fillRect(0,0,128,128);
  for(let i=0;i<2200;i++){
    stoneContext.fillStyle=`rgba(66,62,46,${between(.025,.14)})`;
    stoneContext.fillRect(random()*128,random()*128,between(.4,2),between(.4,2));
  }
  for(let i=0;i<25;i++){
    const x=between(0,128),y=between(0,128),r=between(3,16),gradient=stoneContext.createRadialGradient(x,y,0,x,y,r);
    gradient.addColorStop(0,`rgba(75,87,49,${between(.025,.13)})`);gradient.addColorStop(1,'rgba(75,87,49,0)');
    stoneContext.fillStyle=gradient;stoneContext.fillRect(x-r,y-r,r*2,r*2);
  }
  const edge=stoneContext.createLinearGradient(0,0,128,128);edge.addColorStop(0,'rgba(47,51,38,.2)');edge.addColorStop(.12,'rgba(47,51,38,0)');edge.addColorStop(.86,'rgba(47,51,38,0)');edge.addColorStop(1,'rgba(47,51,38,.16)');stoneContext.fillStyle=edge;stoneContext.fillRect(0,0,128,128);
  const stoneTexture=new THREE.CanvasTexture(stoneCanvas);stoneTexture.colorSpace=THREE.SRGBColorSpace;stoneTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(stoneTexture);
  for(const mat of [stone,paleStone,stoneDark,stoneWet,foundation]){mat.map=stoneTexture;mat.needsUpdate=true;}

  // The masonry island is a real layered structure, including submerged courses.
  box(0, -1.1, 0, 20.8, 1.8, 16.9, foundation);
  box(0, -0.31, 0, 20.4, 0.35, 16.5, stoneDark);
  box(0, -0.06, 0, 20.0, 0.27, 16.1, stone);
  for (let row = 0; row < 3; row++) {
    const y = -1.55 + row * 0.49;
    for (let i = 0; i < 21; i++) {
      const x = -10 + i + (row % 2) * 0.15;
      box(x, y, 8.36, 0.96, 0.44, 0.33, row === 2 ? stoneDark : foundation, 0, new THREE.Color().setHSL(0.18, 0.04, between(0.78, 1)).getStyle());
      box(x, y, -8.36, 0.96, 0.44, 0.33, foundation);
    }
    for (let i = 0; i < 16; i++) for (const side of [-1, 1]) box(side * 10.36, y, -7.5 + i, 0.33, 0.44, 0.96, foundation);
  }
  // Staggered stone pavers: small bevels catch the late light, with restrained variation.
  for (let row = 0; row < 15; row++) {
    for (let column = 0; column < 20; column++) {
      const x = -9.5 + column, z = -7 + row;
      const shade = between(0.77, 1.08);
      color.setRGB(shade, shade * between(0.97, 1.01), shade * between(0.92, 1.0));
      box(x, 0.095 + between(-0.016, 0.016), z, 0.965, 0.13, 0.965, stone, 0, color.clone());
      if (random() < 0.12 && (Math.abs(x) > 7 || Math.abs(z) > 5)) box(x + between(-0.2, 0.2), 0.166, z + between(-0.35, 0.35), between(0.2, 0.6), 0.012, 0.12, mossDark, between(-1, 1), null, true);
    }
  }
  // A sun dial inlaid flush into the court makes the empty play space feel intentional.
  cylinder(0, 0.174, 0, 2.7, 0.016, stoneWet);
  ring(0, 0.189, 0, 2.69, 0.022, bronze);
  ring(0, 0.193, 0, 2.38, 0.018, copper);
  ring(0, 0.195, 0, 0.65, 0.023, bronze);
  for (let i = 0; i < 32; i++) {
    const a = i * Math.PI / 16;
    box(Math.sin(a) * 2.54, 0.194, Math.cos(a) * 2.54, i % 4 === 0 ? 0.075 : 0.035, 0.012, i % 4 === 0 ? 0.2 : 0.1, bronze, a);
  }
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    box(Math.sin(a) * 1.42, 0.196, Math.cos(a) * 1.42, 0.034, 0.01, 1.28, copper, a);
  }
  // Borders frame the traversable rectangle; planting and water are outside it.
  for (const z of [-7.65, 7.65]) for (let x = -9.5; x <= 9.5; x += 1) box(x, 0.23, z, 0.97, 0.27, 0.55, paleStone);
  for (const x of [-9.75, 9.75]) for (let z = -7; z <= 7; z++) box(x, 0.23, z, 0.5, 0.27, 0.96, paleStone);
  // External terraced strips create substantial soil beds, not floating greenery.
  for (const x of [-11.1, 11.1]) {
    box(x, -0.52, -0.5, 2.4, 1.3, 16.2, foundation);
    box(x, 0.13, -0.5, 2.35, 0.23, 16.0, stoneDark);
    box(x, 0.26, -0.5, 2.12, 0.15, 15.75, mossDark);
  }
  box(0, 0.2, -9.05, 23.4, 0.65, 2.6, foundation);
  box(0, 0.52, -9.05, 23.5, 0.15, 2.6, mossDark);

  // Three ruined gateways use actual radial voussoirs, fluted piers and capitals.
  function arch(cx, z, radius, spring, broken = false) {
    const depth = 0.92, thickness = 0.5;
    for (const side of [-1, 1]) {
      const x = cx + side * (radius + thickness / 2);
      box(x, 0.61, z, 1.25, 0.34, 1.45, stoneDark);
      box(x, 0.88, z, 1.1, 0.2, 1.22, paleStone);
      const courses = Math.floor((spring - 0.8) / 0.51);
      for (let n = 0; n < courses; n++) {
        box(x, 1.16 + n * 0.51, z, 0.78 + (n % 2) * 0.04, 0.48, depth, stone, 0, new THREE.Color().setScalar(between(0.84, 1.03)));
        for (const off of [-0.23, 0, 0.23]) box(x + off, 1.16 + n * 0.51, z + depth * 0.5, 0.045, 0.43, 0.04, paleStone);
      }
      box(x, spring - 0.08, z, 1.14, 0.24, 1.24, paleStone);
      box(x, spring + 0.1, z, 1.02, 0.15, 1.1, stone);
    }
    const segments = 15;
    const step = Math.PI / segments;
    for (let n = 0; n < segments; n++) {
      if (broken && n > 5 && n < 10) continue;
      const a0 = n * step + 0.013, a1 = (n + 1) * step - 0.013;
      const shape = new THREE.Shape();
      shape.moveTo(Math.cos(a0) * radius, Math.sin(a0) * radius);
      shape.lineTo(Math.cos(a0) * (radius + thickness), Math.sin(a0) * (radius + thickness));
      shape.absarc(0, 0, radius + thickness, a0, a1, false);
      shape.lineTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
      shape.absarc(0, 0, radius, a1, a0, true);
      shape.closePath();
      const wedge = ownGeometry(new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 3 }));
      stamp(wedge, n === 7 ? paleStone : stone, cx, spring, z - depth / 2, 1, 1, 1, 0, 0, 0, new THREE.Color().setScalar(between(0.86, 1.04)));
    }
    for (const side of [-1, 1]) {
      const x = cx + side * (radius + thickness / 2);
      box(x, spring + 0.31, z, 0.88, 0.14, 1.03, moss, 0, null, true);
    }
  }
  arch(-6.8, -8.75, 1.75, 3.45, true);
  arch(-0.65, -9.05, 2.35, 4.2, false);
  arch(6.4, -8.8, 1.8, 3.4, true);
  // The conservatory's suspended heliostat gives the ruin a recognizable purpose.
  const sunWheel=new THREE.Group();sunWheel.position.set(-.65,3.67,-9.03);scene.add(sunWheel);
  mesh(torus(1.55,.065,64),copper,sunWheel);
  mesh(torus(1.43,.025,64),bronze,sunWheel,0,0,.035);
  mesh(torus(.54,.065),bronze,sunWheel,0,0,.025);
  const heliostatMat=material('#517e72',.22,.7,{emissive:'#76e5bb',emissiveIntensity:0});
  const mirror=mesh(geo.cylinder,heliostatMat,sunWheel,0,0,0,.49,.065,.49);mirror.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const spoke=mesh(geo.cube,i%3?copper:bronze,sunWheel,Math.sin(a)*1.02,Math.cos(a)*1.02,0,i%3?.035:.075,.9,.055);spoke.rotation.z=-a;
    mesh(geo.sphere,bronze,sunWheel,Math.sin(a)*1.55,Math.cos(a)*1.55,.025,.07,.07,.05);
  }
  for(const x of [-1.72,.42]){
    cylinder(x,5.54,-9.03,.025,1.55,darkMetal);
    ring(x,4.81,-9.03,.1,.025,bronze,0);
  }
  const restorationGems=[];
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    const gemMat=material('#788d73',.25,.4,{emissive:'#7affd0',emissiveIntensity:0});
    const gem=mesh(geo.crystal,gemMat,sunWheel,Math.sin(a)*1.1,Math.cos(a)*1.1,.09,.16,.22,.11);gem.rotation.z=-a;restorationGems.push(gem);
  }
  // Fragmented wall shoulders, ledges and fallen stones.
  for (const x of [-11.1, -9.7, 9.1, 10.5]) {
    const count = x < 0 ? 5 : 4;
    for (let row = 0; row < count; row++) {
      box(x + (row % 2) * 0.11, 0.84 + row * 0.62, -9.2, 1.35, 0.57, 1.28, stoneDark, 0, new THREE.Color().setScalar(between(0.8, 1.15)));
    }
    box(x, 0.76 + count * 0.62, -9.2, 1.47, 0.22, 1.37, moss);
  }
  for (let i = 0; i < 29; i++) {
    const x = between(-11, 11), z = between(-10, -7.95);
    box(x, between(0.45, 0.67), z, between(0.35, 0.9), between(0.35, 0.75), between(0.45, 0.85), stone, between(-0.8, 0.8));
  }
  // Small marble stairs descend toward the water at the front.
  for (let step = 0; step < 5; step++) {
    box(-1.7, -0.01 - step * 0.21, 8.1 + step * 0.45, 4.0, 0.27, 0.57, stoneWet);
    for (const x of [-3.8, 0.4]) box(x, 0.05 - step * 0.2, 8.1 + step * 0.45, 0.25, 0.4, 0.58, paleStone);
  }
  // A pair of ruined pillars punctuates the foreground without masking the player.
  for (const [x, z] of [[-9.8, 6.9], [10.0, 6.6]]) {
    cylinder(x, 0.42, z, 0.74, 0.32, stoneDark);
    cylinder(x, 0.68, z, 0.62, 0.18, paleStone);
    cylinder(x, 1.2, z, 0.46, 0.92, stone);
    ring(x, 1.61, z, 0.47, 0.055, paleStone);
    cylinder(x, 1.69, z, 0.59, 0.16, paleStone);
    box(x, 1.83, z, 1.13, 0.12, 1.13, moss, 0.08);
  }

  // Hand shaped blades, fern fronds, and plants are drawn in a handful of instanced batches.
  const bladeGeometry = ownGeometry(new THREE.BufferGeometry());
  bladeGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -.04,0,0, .04,0,0, -.028,.36,-.015, .04,0,0, .032,.36,-.015, -.028,.36,-.015,
    -.028,.36,-.015, .032,.36,-.015, .05,.76,-.13, .032,.36,-.015, .105,1,-.29, .05,.76,-.13,
  ], 3)); bladeGeometry.computeVertexNormals();
  const fernGeometry = ownGeometry(new THREE.BufferGeometry());
  const fernVertices = [];
  for (let i = 0; i < 8; i++) {
    const t = i / 8, y = 0.12 + t * 0.55, z = -t * 0.9;
    const reach = 0.24 * Math.sin((t + 0.13) * Math.PI);
    for (const side of [-1, 1]) fernVertices.push(0,y,z, side * reach,y + .09,z - .12, 0,y + .055,z - .13);
  }
  fernGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fernVertices, 3)); fernGeometry.computeVertexNormals();
  function tuft(x, y, z, size = 1, detail = false) {
    for (let i = 0; i < 5; i++) stamp(bladeGeometry, i % 3 === 0 ? lightGreen : green, x + between(-.12,.12), y, z + between(-.12,.12), size * between(.65, 1), size * between(.55, 1.2), size, 0, between(0, Math.PI * 2), between(-.2,.2), null, detail, false);
  }
  function fern(x, y, z, size = 1) {
    for (let i = 0; i < 7; i++) stamp(fernGeometry, fernMat, x, y, z, size, size, size, 0, i * Math.PI * 2 / 7 + between(-.15,.15), 0, null, false, false);
  }
  for (let i = 0; i < 630; i++) {
    const side = random() < 0.5 ? -1 : 1;
    const rear = i % 3 === 0;
    const x = rear ? between(-11.5, 11.5) : side * between(10.15, 12.05);
    const z = rear ? between(-10.1, -8.0) : between(-7.7, 7.2);
    tuft(x, rear ? 0.62 : 0.34, z, between(0.45, 1.03), i % 2 === 0);
    if (i % 19 === 0) fern(x, 0.36, z, between(.8, 1.5));
    if (i % 13 === 0) {
      const h = between(.7, 1.3);
      stamp(geo.cylinder, reedMat, x, .35 + h * .5, z, .018, h, .018, 0, 0, between(-.12,.12), null, false, false);
      stamp(geo.sphere, flowerMat, x, .35 + h, z, .1, .055, .1, 0, 0, 0, null, false, false);
    }
  }
  // Plants growing out of the top of the ruins and hanging vines establish age.
  for (const [x, y, z] of [[-8.8,3.72,-8.7],[-4.8,3.72,-8.7],[-3.2,4.52,-9.1],[1.95,4.52,-9.1],[4.4,3.72,-8.8],[8.45,3.72,-8.8],[-10,3.8,-9.1]]) {
    for (let i = 0; i < 9; i++) tuft(x + between(-.4,.4), y, z + between(-.4,.4), between(.35,.65), true);
    for (let i = 0; i < 15; i++) {
      const vineY = y - i * 0.12;
      stamp(geo.sphere, i % 2 ? green : mossDark, x + Math.sin(i * .6) * .12, vineY, z + .65, .09, .14, .035, 0, 0, between(-.7,.7), null, true, false);
    }
  }
  // Gnarled waterside trees: tapering branches support thousands of individual leaves.
  const bark=material('#4d4830',.94),treeLeaf=material('#49683c',.9,0,{side:THREE.DoubleSide}),treeLeafLight=material('#80964b',.9,0,{side:THREE.DoubleSide});
  const leafGeometry=ownGeometry(new THREE.BufferGeometry());
  leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute([
    0,0,0,-.115,.17,0,0,.2,.035, 0,0,0,0,.2,.035,.115,.17,0,
    -.115,.17,0,-.085,.32,0,0,.2,.035, .115,.17,0,0,.2,.035,.085,.32,0,
    -.085,.32,0,0,.43,0,0,.2,.035, .085,.32,0,0,.2,.035,0,.43,0,
  ],3));leafGeometry.computeVertexNormals();
  function branch(points,startRadius,endRadius){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments=12,sides=9,frames=curve.computeFrenetFrames(segments,false),vertices=[],indices=[];
    for(let i=0;i<=segments;i++){
      const p=curve.getPointAt(i/segments),r=THREE.MathUtils.lerp(startRadius,endRadius,i/segments);
      for(let j=0;j<=sides;j++){
        const a=j/sides*Math.PI*2,n=frames.normals[i],b=frames.binormals[i];
        vertices.push(p.x+r*(Math.cos(a)*n.x+Math.sin(a)*b.x),p.y+r*(Math.cos(a)*n.y+Math.sin(a)*b.y),p.z+r*(Math.cos(a)*n.z+Math.sin(a)*b.z));
        if(i<segments&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
      }
    }
    const geometry=ownGeometry(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();stamp(geometry,bark,0,0,0);
  }
  function tree(x,z,mirror=1,scale=1){
    // Tree islands and shallow exposed roots anchor the tree to the water bed.
    stamp(geo.rock,stoneDark,x,-.45,z,2.2,.75,1.8,0,.5,0);
    stamp(geo.rock,mossDark,x,.1,z,1.55,.4,1.35,0,.5,0);
    const convert=([px,py,pz])=>[x+px*scale*mirror,py*scale,z+pz*scale];
    const trunk=[[0,.05,0],[-.17,1.6,.1],[.38,3.4,.03],[.2,5.2,-.2],[.65,6.5,-.45]].map(convert);
    branch(trunk,.43*scale,.1*scale);
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      branch([[0,.6,0],[Math.sin(a)*.55,.23,Math.cos(a)*.55],[Math.sin(a)*1.3,.05,Math.cos(a)*1.3]].map(convert),.17*scale,.035*scale);
    }
    const ends=[[-1.8,5.7,.4],[2.1,6.3,.7],[-.9,7.0,-1.5],[1.8,7.4,-1.4],[.2,8,.25],[-1.9,7.4,1.4]];
    ends.forEach((end,i)=>{
      const join=[.22,3.4+(i%3)*.65,-.07],middle=[end[0]*.65,end[1]-.8,end[2]*.7];
      branch([join,middle,end].map(convert),.14*scale,.025*scale);
      const centre=convert(end);
      for(let j=0;j<220;j++){
        const a=between(0,Math.PI*2),u=between(-1,1),r=Math.cbrt(random())*1.35*scale,s=Math.sqrt(1-u*u);
        const px=centre[0]+Math.cos(a)*s*r,py=centre[1]+u*r*.65,pz=centre[2]+Math.sin(a)*s*r;
        stamp(leafGeometry,j%4===0?treeLeafLight:treeLeaf,px,py,pz,between(.8,1.35)*scale,between(.8,1.4)*scale,scale,between(-1.3,1.3),between(0,Math.PI*2),between(-1.4,1.4),null,j%3===0,false);
      }
    });
  }
  tree(-13.8,-7.5,1,.95);tree(12.8,-10.8,-1,.85);
  // Water lilies and low outcrops make the water feel like a living place.
  const lilyGeometry = ownGeometry(new THREE.CircleGeometry(1, 18, 0.15, Math.PI * 2 - 0.35));
  const lilyMat = material('#72925a', .55, .05, { side: THREE.DoubleSide });
  for (let i = 0; i < 40; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * between(13, 20), z = between(-10, 14);
    if (i % 4 === 0) {
      stamp(geo.rock, stoneDark, x, -1.15, z, between(.7, 1.8), between(.8, 1.5), between(.8, 1.6), .1, between(0,6), .1);
      tuft(x, -.05, z, .6, true);
    } else {
      const size = between(.25,.65);
      stamp(lilyGeometry, lilyMat, x, -.724, z, size, size, size, -Math.PI / 2, 0, between(0,6), null, true, false);
      if (i % 7 === 0) stamp(geo.sphere, flowerMat, x, -.66, z, .13, .075, .13, 0, 0, 0, null, true, false);
    }
  }

  // Copper irrigation machinery, with housings, flanges, ribs, pipes and flywheels.
  function pump(x, z, mirrored = 1) {
    box(x, .46, z, 1.7, .52, 1.6, stoneDark);
    box(x, .76, z, 1.32, .13, 1.2, bronze);
    cylinder(x, 1.35, z, .5, 1.07, patina);
    cylinder(x, 1.92, z, .57, .14, copper);
    cylinder(x, 1.97, z, .25, .08, bronze);
    ring(x, 1.01, z, .52, .055, bronze);
    ring(x, 1.65, z, .51, .045, copper);
    for (let n = 0; n < 12; n++) {
      const a = n * Math.PI / 6;
      cylinder(x + Math.sin(a) * .505, 1.34, z + Math.cos(a) * .505, .024, .53, copper);
    }
    const pipeX = x + mirrored * .9;
    cylinder(pipeX, .96, z, .13, 1.0, copper);
    stamp(geo.cylinder, copper, x + mirrored * .52, 1.45, z, .13, .8, .13, 0, 0, Math.PI / 2);
    stamp(geo.sphere, copper, pipeX, 1.44, z, .135, .135, .135);
    cylinder(pipeX, .49, z, .22, .09, bronze);
    const wheelZ = z + .65;
    ring(x, 1.45, wheelZ, .38, .045, bronze, 0);
    stamp(geo.cylinder, copper, x, 1.45, z + .5, .09, .4, .09, Math.PI / 2);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      stamp(geo.cube, copper, x + Math.sin(a) * .19, 1.45 + Math.cos(a) * .19, wheelZ, .035, .36, .04, 0, 0, -a);
    }
    for (const dx of [-.54,.54]) for (const dz of [-.48,.48]) cylinder(x+dx,.85,z+dz,.045,.06,darkMetal);
  }
  pump(-10.85, -3.3); pump(10.7, 0.5, -1);
  // Lamps are warm pockets against the blue-green water and stone.
  const lampFlames = [];
  function lantern(x, z, h = 0.55) {
    cylinder(x, .26, z, .28, .18, stoneDark);
    cylinder(x, .33 + h / 2, z, .065, h, darkMetal);
    const y = .43 + h;
    box(x, y, z, .39, .08, .39, bronze);
    const lamp = mesh(geo.cylinder, glowGold, scene, x, y + .25, z, .12, .38, .12); lamp.castShadow = false; lampFlames.push(lamp);
    for (const dx of [-.16,.16]) for (const dz of [-.16,.16]) box(x + dx, y + .25, z + dz, .035, .45, .035, darkMetal);
    stamp(geo.taper, darkMetal, x, y + .52, z, .31, .16, .31);
    cylinder(x, y + .65, z, .04, .11, bronze);
  }
  for (const [x,z,h] of [[-10,-6.5,.4],[10,-6.45,.4],[-10,5.5,.4],[10,5.5,.4],[-2.95,-7.65,1.0],[1.7,-7.65,1.0]]) lantern(x,z,h);

  // Beacons are miniature armillary instruments. The rings, lenses and cores are separate parts.
  const beacons = [];
  function createBeacon(x, z) {
    const group = new THREE.Group(); group.position.set(x, .17, z); scene.add(group);
    mesh(geo.cylinder, stoneDark, group, 0,.12,0,.67,.24,.67);
    mesh(geo.cylinder, paleStone, group, 0,.29,0,.55,.12,.55);
    mesh(geo.cylinder, copper, group, 0,.49,0,.33,.3,.33);
    mesh(geo.cylinder, bronze, group, 0,.69,0,.46,.09,.46);
    const coreMat = material('#ffe0a1', .27, .16, { emissive: '#e7a34a', emissiveIntensity: 1.1 });
    const core = mesh(geo.crystal, coreMat, group, 0,1.38,0,.23,.43,.23);
    const armature = new THREE.Group(); group.add(armature); armature.position.y = 1.38;
    for (let i = 0; i < 2; i++) {
      const orbit = mesh(torus(.59 + i * .1,.032), i ? patina : bronze, armature);
      orbit.rotation.set(i ? Math.PI / 2 : .5, i ? .3 : .4, .35);
    }
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const stem = mesh(geo.cylinder, bronze, group, Math.sin(a)*.38,1.02,Math.cos(a)*.38,.035,.61,.035);
      stem.rotation.z = Math.sin(a) * .1;
      mesh(geo.sphere, patina, group, Math.sin(a)*.38,1.34,Math.cos(a)*.38,.07,.07,.07);
    }
    const groundRingMat = ownMaterial(new THREE.MeshBasicMaterial({ color: '#c6ae71', transparent: true, opacity: .5, depthWrite: false }));
    const groundRing = mesh(torus(.92,.023), groundRingMat, group, 0,.04,0);
    groundRing.rotation.x = Math.PI / 2; groundRing.castShadow = false;
    const haloMat = ownMaterial(new THREE.MeshBasicMaterial({ color: '#92ffe1', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    const halo = mesh(ownGeometry(new THREE.CylinderGeometry(.35,.7,2.7,24,1,true)), haloMat, group, 0,1.65,0);
    halo.castShadow = false; halo.receiveShadow = false;
    const light = new THREE.PointLight('#6df1d2', 0, 4.5, 2); light.position.set(0,1.35,0); group.add(light);
    const chargeLenses=[];
    for(let i=0;i<3;i++){
      const a=i*Math.PI*2/3;
      const lensMat=material('#57766a',.3,.35,{emissive:'#78ffd1',emissiveIntensity:0});
      const lens=mesh(geo.sphere,lensMat,group,Math.sin(a)*.43,.75,Math.cos(a)*.43,.09,.045,.09);
      chargeLenses.push(lens);
    }
    const bloomMat=material('#7b9154',.65,.05,{emissive:'#91eab7',emissiveIntensity:0});
    const blooms=new THREE.InstancedMesh(geo.sphere,bloomMat,48);
    const bedX=x<0?-11.05:11.05;
    for(let i=0;i<48;i++){
      const bx=bedX+between(-.8,.8),bz=z+between(-1.6,1.6),by=between(.75,1.2);
      pose.position.set(bx,by,bz);pose.scale.set(.07,.045,.07);pose.rotation.set(0,0,0);pose.updateMatrix();blooms.setMatrixAt(i,pose.matrix);
    }
    scene.add(blooms);
    const beacon = { group, core, coreMat, armature, groundRingMat, halo, haloMat, light, chargeLenses, bloomMat, blooms, lit: false };
    beacons.push(beacon); return beacon;
  }
  createBeacon(-6,-3); createBeacon(5,-4); createBeacon(5,4);

  // The return gate is an inset brass compass, becoming a warm column of light.
  const exit = new THREE.Group(); exit.position.set(-6,.19,4); scene.add(exit);
  mesh(geo.cylinder, stoneDark, exit, 0,.025,0,1.04,.045,1.04);
  const exitMat = material('#a28c57', .38, .55, { emissive: '#4bc9a5', emissiveIntensity: 0 });
  for (const radius of [.68,.96]) { const r = mesh(torus(radius,.035),exitMat,exit,0,.055,0); r.rotation.x = Math.PI / 2; }
  for (let i=0;i<8;i++) { const a=i*Math.PI/4; const bar=mesh(geo.cube,exitMat,exit,Math.sin(a)*.82,.055,Math.cos(a)*.82,.04,.025,.2); bar.rotation.y=a; }
  const exitCore=mesh(geo.crystal,glowMint,exit,0,.75,0,.15,.28,.15); exitCore.visible=false;
  const exitLight=new THREE.PointLight('#a0ffe2',0,5,2); exitLight.position.set(0,1,0);exit.add(exitLight);

  // A friendly, distinctly readable little maintenance automaton.
  const robot = new THREE.Group(); scene.add(robot);
  const body = new THREE.Group(); robot.add(body); body.position.y = .55;
  mesh(geo.cube, ivory, body, 0,.12,0,.63,.58,.43);
  mesh(geo.cube, copper, body, 0,-.17,0,.52,.11,.4);
  mesh(geo.cube, patina, body, 0,.13,-.255,.42,.4,.13);
  mesh(geo.cylinder, copper, body, 0,.43,0,.12,.12,.12);
  const head = new THREE.Group(); head.position.y = .65; body.add(head);
  mesh(geo.cube, ivory, head, 0,0,0,.75,.46,.49);
  mesh(geo.cube, black, head, 0,-.015,.255,.59,.255,.055);
  for (const x of [-.16,.16]) { const eye=mesh(geo.sphere,glowMint,head,x,.015,.29,.075,.08,.023);eye.castShadow=false; }
  for (const x of [-.4,.4]) { const ear=mesh(geo.cylinder,bronze,head,x,.01,0,.115,.09,.115);ear.rotation.z=Math.PI/2; }
  mesh(geo.cylinder, copper, head, .23,.36,-.06,.019,.29,.019);
  mesh(geo.sphere,glowGold,head,.23,.515,-.06,.055,.055,.055);
  const robotLimbs=[];
  for (const side of [-1,1]) {
    const leg=new THREE.Group();leg.position.set(side*.18,.37,0);robot.add(leg);
    mesh(geo.cylinder,darkMetal,leg,0,-.12,0,.075,.27,.075);
    mesh(geo.cube,ivory,leg,0,-.25,.035,.21,.14,.32);
    mesh(geo.sphere,bronze,leg,0,0,0,.1,.1,.1);
    const arm=new THREE.Group();arm.position.set(side*.4,.28,0);body.add(arm);
    mesh(geo.sphere,bronze,arm,0,0,0,.105,.105,.105);
    mesh(geo.cube,ivory,arm,side*.025,-.18,0,.15,.29,.17);
    mesh(geo.sphere,darkMetal,arm,side*.025,-.35,.02,.09,.09,.09);
    robotLimbs.push({leg,arm,side});
  }
  const playerRingMat=ownMaterial(new THREE.MeshBasicMaterial({color:'#d6fff0',transparent:true,opacity:.5,depthWrite:false}));
  const playerRing=mesh(torus(.49,.018),playerRingMat,scene,0,.205,4);playerRing.rotation.x=Math.PI/2;playerRing.castShadow=false;
  const pulseMat=ownMaterial(new THREE.MeshBasicMaterial({color:'#bdffe6',transparent:true,opacity:0,depthWrite:false}));
  const pulseRing=mesh(torus(1,.022),pulseMat,scene,0,.21,0);pulseRing.rotation.x=Math.PI/2;pulseRing.castShadow=false;

  // Soft amber sentries follow the exact positions from the deterministic game model.
  const hazardVisuals=[];
  function createHazard() {
    const group=new THREE.Group();scene.add(group);
    const core=mesh(geo.sphere,glowGold,group,0,.72,0,.15,.15,.15);
    const frame=mesh(torus(.29,.026),copper,group,0,.72,0);frame.rotation.x=.5;
    const frame2=mesh(torus(.24,.018),bronze,group,0,.72,0);frame2.rotation.y=Math.PI/2;
    const mat=ownMaterial(new THREE.MeshBasicMaterial({color:'#ffb65d',transparent:true,opacity:.32,depthWrite:false}));
    const warning=mesh(torus(.55,.018),mat,group,0,.025,0);warning.rotation.x=Math.PI/2;warning.castShadow=false;
    const trail=[];
    for(let i=0;i<12;i++){const dot=mesh(geo.sphere,mat,scene,0,-20,0,.035,.035,.035);dot.castShadow=false;trail.push(dot);}
    const visual={group,core,frame,frame2,warning,trail,history:[],lastTime:-1};hazardVisuals.push(visual);return visual;
  }
  for(let i=0;i<3;i++)createHazard();

  // Water uses analytic waves and sun glints; the court is never cut by a fake river.
  const waterUniforms={uTime:{value:0},uColor:{value:new THREE.Color('#286d67')},uSun:{value:new THREE.Vector3(-.5,.7,-.4).normalize()},uFog:{value:scene.fog.color},uCamera:{value:camera.position}};
  const waterMat=ownMaterial(new THREE.ShaderMaterial({
    uniforms:waterUniforms,
    vertexShader:`varying vec3 vWorld; void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`
      uniform float uTime;uniform vec3 uColor,uSun,uFog,uCamera;varying vec3 vWorld;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float wave(vec2 p){float n=noise(p*.8+vec2(uTime*.07,-uTime*.09));return sin(p.x*2.2+p.y*.53+n*3.+uTime*.55)*.24+sin(p.y*3.4+p.x*.91+n*4.-uTime*.45)*.17+noise(p*3.1+uTime*.04)*.16;}
      void main(){
        vec2 p=vWorld.xz;float w=wave(p);float dx=wave(p+vec2(.03,0.))-w;float dz=wave(p+vec2(0.,.03))-w;
        vec3 n=normalize(vec3(-dx*1.9,1.,-dz*1.9));vec3 view=normalize(uCamera-vWorld);
        float fres=pow(1.-max(dot(n,view),0.),3.);vec3 col=mix(uColor*.64,uColor*1.2,.5+w*.3);
        col=mix(col,vec3(.59,.73,.65),fres*.65);
        float caustic=pow(max(0.,sin(p.x*3.5+sin(p.y*2.8+uTime*.22))*sin(p.y*4.2+sin(p.x*2.9-uTime*.18))),9.);
        col+=vec3(.13,.24,.16)*caustic*.3;
        float spec=pow(max(dot(reflect(-uSun,n),view),0.),250.);col+=vec3(1.,.8,.43)*spec*.65*smoothstep(.35,.75,noise(p*2.));
        float ripple=pow(max(sin(p.x*8.+p.y*4.+uTime*.9)*sin(p.y*7.-p.x*3.-uTime*.7),0.),22.);
        col+=vec3(.7,.86,.64)*ripple*.075;
        float dist=length(uCamera-vWorld);col=mix(col,uFog,1.-exp(-.000045*dist*dist));
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const water=new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(250,250)),waterMat);water.rotation.x=-Math.PI/2;water.position.y=-.75;scene.add(water);
  // Fine edge ripples give the temple a convincing contact with the water.
  const rippleMat=ownMaterial(new THREE.MeshBasicMaterial({color:'#c8e8c4',transparent:true,opacity:.18,depthWrite:false}));
  for(let i=0;i<45;i++){
    const side=i%2?-1:1,x=side*between(10.55,12.6),z=between(-8,8),r=between(.12,.55);
    stamp(torus(r,.012,28),rippleMat,x,-.73,z,1,1,1,Math.PI/2,0,0,null,true,false);
  }
  // Atmospheric particles, rendered as soft circular points.
  const particleCount=140, positions=new Float32Array(particleCount*3), phases=new Float32Array(particleCount), origins=new Float32Array(particleCount*3);
  for(let i=0;i<particleCount;i++){origins[i*3]=between(-14,14);origins[i*3+1]=between(.4,7.5);origins[i*3+2]=between(-11,10);phases[i]=between(0,Math.PI*2);}
  positions.set(origins);
  const particlesGeo=ownGeometry(new THREE.BufferGeometry());particlesGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const particlesMat=ownMaterial(new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uPixel:{value:1}},
    vertexShader:`uniform float uPixel;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uPixel*3.;}`,
    fragmentShader:`void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d);gl_FragColor=vec4(1.,.89,.49,a*.7);}`
  }));
  const particles=new THREE.Points(particlesGeo,particlesMat);scene.add(particles);

  // Collapse all static geometry into material/shape batches for predictable draw counts.
  for(const batch of fixed.values()){
    const instanced=new THREE.InstancedMesh(batch.g,batch.m,batch.matrices.length);
    batch.matrices.forEach((matrix,i)=>{instanced.setMatrixAt(i,matrix);instanced.setColorAt(i,color.set(batch.colors[i]));});
    instanced.castShadow=batch.shadow;instanced.receiveShadow=true;instanced.instanceMatrix.needsUpdate=true;
    if(instanced.instanceColor)instanced.instanceColor.needsUpdate=true;
    instanced.computeBoundingSphere();scene.add(instanced);if(batch.detail)detailGroups.push(instanced);
  }
  fixed.clear();
  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(), floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.18), hit=new THREE.Vector3();
  let lastPulse=-1, pulseAge=10, lastTime=0, visualTime=0;
  const mintColor=new THREE.Color('#82edca'),goldColor=new THREE.Color('#e7a34a');
  function resize(){
    if(disposed)return;
    const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    renderer.setSize(width,height,false);
    const aspect=width/height;
    // Portrait retains the entire game area and puts the sky behind the HUD.
    let viewHeight=aspect<.85?(mobileActive?25:30)/aspect:27;
    if(cameraMode==='close'||cameraMode==='cinematic')viewHeight*=.88;
    if(cameraMode==='wide')viewHeight*=1.12;
    camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;
    camera.updateProjectionMatrix();
  }
  function setQuality(value){
    currentQuality=value==='low'?'low':'high';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,currentQuality==='high'?1.8:1));
    renderer.shadowMap.enabled=currentQuality==='high';
    for(const group of detailGroups)group.visible=currentQuality==='high';
    particles.visible=currentQuality==='high';
    particlesMat.uniforms.uPixel.value=renderer.getPixelRatio();
    resize();
  }
  function setCamera(mode){cameraMode=mode||'isometric';resize();}
  function setReducedMotion(value){reducedMotion=!!value;}
  function pick(clientX,clientY){
    const rect=canvas.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    if(!raycaster.ray.intersectPlane(floorPlane,hit))return null;
    if(Math.abs(hit.x)>9.15||Math.abs(hit.z)>7.15)return null;
    return {x:THREE.MathUtils.clamp(hit.x,-9,9),z:THREE.MathUtils.clamp(hit.z,-7,7)};
  }
  function render(state,dt=1/60){
    if(disposed)return;
    const time=Number.isFinite(state.time)?state.time:lastTime+dt;lastTime=time;visualTime+=dt;
    const anim=reducedMotion?0:visualTime,player=state.player||{x:0,z:4,heading:0,moving:false,hp:3};
    const nextMobileActive=state.mode!=='ready';
    if(nextMobileActive!==mobileActive){mobileActive=nextMobileActive;resize();}
    const mobileFollow=width/height<.85&&mobileActive;
    const cameraEase=reducedMotion?1:Math.min(1,dt*3.5);
    cameraTarget.x+=(mobileFollow?player.x*.67-cameraTarget.x:-cameraTarget.x)*cameraEase;
    cameraTarget.z+=((mobileFollow?player.z*.6-.4:-.4)-cameraTarget.z)*cameraEase;
    camera.position.copy(baseCamera).add(cameraTarget);camera.lookAt(cameraTarget);camera.updateMatrixWorld();
    robot.position.set(player.x,.17,player.z);
    const targetHeading=Number.isFinite(player.heading)?player.heading:0;
    const difference=Math.atan2(Math.sin(targetHeading-robot.rotation.y),Math.cos(targetHeading-robot.rotation.y));
    robot.rotation.y+=difference*Math.min(1,dt*12);
    const step=player.moving&&!reducedMotion?Math.sin(time*13):0;
    body.position.y=.55+Math.abs(step)*.035;
    body.rotation.z=step*.025;
    head.rotation.y=reducedMotion?0:Math.sin(anim*.7)*.07;
    for(const {leg,arm,side} of robotLimbs){leg.rotation.x=step*.36*side;arm.rotation.x=-step*.3*side;}
    playerRing.position.set(player.x,.205,player.z);playerRingMat.opacity=state.mode==='playing'?.5:.25;
    playerRingMat.color.set(player.invulnerable>0?'#9dffe0':'#f1d9a0');playerRing.scale.setScalar(player.dashRemaining>0?1.3:1);
    const beaconState=state.beacons||[];
    let litCount=0;
    for(let i=0;i<beacons.length;i++){
      const b=beacons[i],s=beaconState[i]||{};const lit=!!s.lit;if(lit)litCount++;
      if(Number.isFinite(s.x))b.group.position.x=s.x;if(Number.isFinite(s.z))b.group.position.z=s.z;
      if(b.lit!==lit){b.lit=lit;b.coreMat.color.set(lit?'#c1ffe5':'#ffe0a1');b.coreMat.emissive.copy(lit?mintColor:goldColor);b.groundRingMat.color.set(lit?'#98ffda':'#c6ae71');}
      b.core.rotation.y=anim*.42+i;b.core.position.y=1.38+Math.sin(anim*1.7+i)*.07;
      b.armature.rotation.y=anim*(lit?.3:.12)+i;
      const charge=Math.max(0,Math.min(3,s.charge??(lit?3:0)));
      b.coreMat.emissiveIntensity=lit?2:1.1+charge*.25;
      for(let n=0;n<3;n++){b.chargeLenses[n].material.emissiveIntensity=n<charge?2:0;b.chargeLenses[n].material.color.set(n<charge?'#b5ffe5':'#57766a');}
      b.groundRingMat.opacity=lit?.76:.42;
      b.haloMat.opacity=lit?.028:0;
      b.light.intensity=lit&&currentQuality==='high'?1.5:0;
      b.bloomMat.color.set(lit?'#daffe1':'#7b9154');b.bloomMat.emissiveIntensity=lit?1.2:0;
      const gem=restorationGems[i];gem.material.color.set(lit?'#a7ffdc':'#788d73');gem.material.emissiveIntensity=lit?1.7:0;
    }
    heliostatMat.emissiveIntensity=litCount*.21;
    const unlocked=litCount===3;exitMat.emissiveIntensity=unlocked?1.4:0;exitCore.visible=unlocked;
    exitCore.position.y=.75+Math.sin(anim*1.5)*.11;exitCore.rotation.y=anim*.5;exitLight.intensity=unlocked&&currentQuality==='high'?1.5:0;
    const hazards=state.hazards||[];
    while(hazardVisuals.length<hazards.length)createHazard();
    for(let i=0;i<hazardVisuals.length;i++){
      const v=hazardVisuals[i],h=hazards[i];v.group.visible=!!h;
      if(!h){for(const dot of v.trail)dot.visible=false;continue;}
      v.group.position.set(h.x,.18,h.z);v.core.position.y=.72+Math.sin(anim*2+i)*.09;v.frame.rotation.z=anim*.65;v.frame2.rotation.x=anim*.4;
      v.warning.scale.setScalar(1+Math.sin(anim*2+i)*.08);
      if(time-v.lastTime>.055||time<v.lastTime){v.history.unshift({x:h.x,z:h.z});if(v.history.length>12)v.history.pop();v.lastTime=time;}
      for(let n=0;n<v.trail.length;n++){const dot=v.trail[n],p=v.history[n];dot.visible=!!p&&!reducedMotion;if(p){dot.position.set(p.x,.89,p.z);dot.scale.setScalar(.045*(1-n/13));}}
    }
    if(state.pulse!=null&&state.pulse!==lastPulse){lastPulse=state.pulse;pulseAge=0;pulseRing.position.set(player.x,.215,player.z);}
    pulseAge+=dt;const pulseScale=.6+pulseAge*7;pulseRing.scale.setScalar(pulseScale);pulseMat.opacity=reducedMotion?0:Math.max(0,.5-pulseAge*.6);
    waterUniforms.uTime.value=anim;
    if(!reducedMotion&&currentQuality==='high'){
      for(let i=0;i<particleCount;i++){const a=i*3;positions[a]=origins[a]+Math.sin(anim*.2+phases[i])*.6;positions[a+1]=origins[a+1]+Math.sin(anim*.3+phases[i])* .28;positions[a+2]=origins[a+2]+Math.cos(anim*.17+phases[i])*.45;}
      particlesGeo.attributes.position.needsUpdate=true;
    }
    renderer.render(scene,camera);
  }
  function dispose(){
    if(disposed)return;disposed=true;
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());envTarget.dispose();renderer.dispose();
  }
  setQuality(quality);
  return {render,pick,resize,setQuality,setCamera,setReducedMotion,dispose,stats:()=>({drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,quality:currentQuality,pixelRatio:renderer.getPixelRatio()})};
}
