'use client';
// @refresh reset
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sampleCycle, cycleDuration, loadingPose, hangingPose } from '@/lib/laundry-cycle.mjs';

export type CareStage = 'loading' | 'washing' | 'drying' | 'ready';
type SceneProps = { playing: boolean; onStage: (stage: CareStage) => void; onBubbles: (active: boolean) => void };
const ease = (v: number) => THREE.MathUtils.smoothstep(v, 0, 1);

function makePanel(title: string, digits: string, accent: string) {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#061d2d'; ctx.fillRect(0, 0, 640, 160);
  ctx.fillStyle = '#bacbd0'; ctx.font = '500 19px Arial'; ctx.fillText('FABRIC CARE', 22, 40);
  ctx.fillStyle = accent; ctx.font = '600 24px Arial'; ctx.fillText(title, 22, 100);
  ctx.font = '500 67px monospace'; ctx.fillText(digits, 360, 110);
  ctx.fillStyle = '#e9d39e'; ctx.fillRect(22, 125, 245, 3);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function Garment({ color }: { color: string }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-.14, .28); s.lineTo(-.36, .15); s.lineTo(-.27, -.035); s.lineTo(-.17, .025);
    s.lineTo(-.19, -.29); s.quadraticCurveTo(0, -.34, .19, -.29); s.lineTo(.17, .025);
    s.lineTo(.27, -.035); s.lineTo(.36, .15); s.lineTo(.14, .28); s.quadraticCurveTo(0, .12, -.14, .28); return s;
  }, []);
  return <group><mesh castShadow><extrudeGeometry args={[shape, { depth: .035, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .02, bevelThickness: .015 }]} /><meshPhysicalMaterial color={color} roughness={.88} sheen={.75} sheenRoughness={.8} /></mesh>
    <mesh position={[0, -.02, .064]} rotation={[0, 0, -.08]}><boxGeometry args={[.012, .42, .004]} /><meshStandardMaterial color={color} roughness={1} /></mesh>
  </group>;
}

function FabricBundle({ color }: { color: string }) {
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(.29, 28, 20), points = g.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      const folds = 1 + Math.sin(x * 26 + y * 17) * .1 + Math.cos(z * 24 - y * 12) * .07;
      points.setXYZ(i, x * folds, y * folds * .73, z * folds * .82);
    }
    g.computeVertexNormals(); return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshPhysicalMaterial color={color} roughness={.9} sheen={.9} sheenRoughness={.8} /></mesh>;
}

function Perforations() {
  const holes = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!holes.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 96; i++) {
      const ring = Math.floor(i / 24), angle = i % 24 * Math.PI / 12 + ring * .11;
      dummy.position.set(Math.cos(angle) * (.17 + ring * .13), Math.sin(angle) * (.17 + ring * .13), -.305);
      dummy.updateMatrix(); holes.current.setMatrixAt(i, dummy.matrix);
    }
    holes.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={holes} args={[undefined, undefined, 96]}><circleGeometry args={[.015, 8]} /><meshStandardMaterial color="#223642" roughness={.6} /></instancedMesh>;
}

function Machine({ playing, onStage, onBubbles }: SceneProps) {
  const root = useRef<THREE.Group>(null), hinge = useRef<THREE.Group>(null), drum = useRef<THREE.Group>(null);
  const loading = useRef<THREE.Group>(null), unloading = useRef<THREE.Group>(null), rack = useRef<THREE.Group>(null);
  const folded = useRef<THREE.Group>(null), contents = useRef<THREE.Group>(null), water = useRef<THREE.Group>(null), steam = useRef<THREE.Group>(null);
  const panel = useRef<THREE.MeshBasicMaterial>(null), windowLight = useRef<THREE.PointLight>(null), bubbles = useRef<THREE.Group>(null);
  const time = useRef(0), cycle = useRef(0), lastStage = useRef(-1), lastBubbles = useRef(false);
  const { size, camera, invalidate } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const mobile = size.width < 450;
      const aspect = Math.max(.5, size.width / Math.max(1, size.height));
      const horizontalFov = mobile ? 38 : 46;
      const fittedFov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(horizontalFov / 2)) / aspect));
      camera.fov = Math.max(mobile ? 35 : 27.5, fittedFov);
      camera.updateProjectionMatrix(); invalidate();
    }
  }, [camera, size.width, size.height, invalidate]);
  const displays = useMemo(() => [makePanel('LOAD & CARE', 'OPEN', '#e7d29f'), makePanel('GENTLE WASH', '30:00', '#61d9fa'), makePanel('SOFT AIR DRY', '40:00', '#f1c581'), makePanel('FRESH FINISH', 'DONE', '#95e8d2')], []);
  const face = useMemo(() => {
    const shape = new THREE.Shape(); const x = 1.25, y = 1.52, r = .12;
    shape.moveTo(-x + r, -y); shape.lineTo(x - r, -y); shape.quadraticCurveTo(x, -y, x, -y + r);
    shape.lineTo(x, y - r); shape.quadraticCurveTo(x, y, x - r, y); shape.lineTo(-x + r, y);
    shape.quadraticCurveTo(-x, y, -x, y - r); shape.lineTo(-x, -y + r); shape.quadraticCurveTo(-x, -y, -x + r, -y);
    const opening = new THREE.Path(); opening.absarc(0, -.15, .86, 0, Math.PI * 2, true); shape.holes.push(opening); return shape;
  }, []);
  const waterShape = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-.67, -.05); s.quadraticCurveTo(-.3, .02, 0, -.04); s.quadraticCurveTo(.3, -.1, .67, -.05);
    s.absarc(0, 0, .672, -.075, -Math.PI + .075, true); s.closePath(); return s;
  }, []);
  useEffect(() => () => displays.forEach(texture => texture.dispose()), [displays]);
  useFrame((state, delta) => {
    const dt = playing ? Math.min(delta, .05) : 0;
    if (playing) { time.current += dt; cycle.current = (cycle.current + dt) % cycleDuration; }
    const frame = sampleCycle(cycle.current), t = frame.t;
    if (frame.index !== lastStage.current) { lastStage.current = frame.index; onStage(frame.stage); }
    if (frame.bubbles !== lastBubbles.current) { lastBubbles.current = frame.bubbles; onBubbles(frame.bubbles); }
    // Close framing for the drum; widen smoothly before the door/rack choreography.
    // Reserve that extra space only while the garments and open door need it.
    if (camera instanceof THREE.PerspectiveCamera) {
      const mobile = size.width < 450;
      const aspect = Math.max(.5, size.width / Math.max(1, size.height));
      const choreography = t < 6 ? 1 - ease((t - 4.8) / 1.2) : t >= 19 ? ease((t - 19) / 1) * (1 - ease((t - 27) / 1.5)) : 0;
      const horizontal = (mobile ? 33 : 35) + choreography * (mobile ? 5 : 11);
      const fitted = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(horizontal / 2)) / aspect));
      const targetFov = Math.max(mobile ? 32 : 24.5 + choreography * 3, fitted);
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 7, Math.min(delta, .05));
      camera.updateProjectionMatrix();
    }
    if (root.current) { root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -.03 + state.pointer.x * .035, 5, Math.min(delta, .05)); root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, state.pointer.y * .012, 5, Math.min(delta, .05)); root.current.position.x = size.width < 450 ? -.25 : -.1; root.current.scale.setScalar(size.width < 450 ? .86 : 1); }
    if (hinge.current) hinge.current.rotation.y = -1.83 * frame.door;
    if (drum.current && playing) drum.current.rotation.z += dt * frame.drumSpeed;
    if (panel.current && panel.current.map !== displays[frame.index]) { panel.current.map = displays[frame.index]; panel.current.needsUpdate = true; }
    if (windowLight.current) { windowLight.current.color.set(frame.drying ? '#ffc680' : '#78dcff'); windowLight.current.intensity = frame.washing ? .8 : frame.drying ? .9 : .2; }
    if (contents.current) {
      contents.current.visible = t >= 3.2 && t < 22.2;
      contents.current.children.forEach((item, i) => {
        const loadedAt = 3.4 + i * .55;
        const exitsAt = 21.5 + i * .3;
        item.visible = t >= loadedAt - .12 && t < exitsAt + .1;
        item.scale.setScalar(ease((t - loadedAt + .12) / .2) * (1 - ease((t - exitsAt) / .1)));
      });
    }
    if (loading.current) {
      loading.current.visible = t >= 1.7 && t < 4.8;
      loading.current.children.forEach((item, i) => {
        const pose = loadingPose(t, i);
        item.visible = pose.visible;
        item.position.set(pose.x, pose.y, pose.z);
        item.rotation.set(pose.tilt, pose.tilt, -.08 * (1 - pose.x / 2.05));
        item.scale.setScalar(pose.scale);
      });
    }
    if (water.current) { water.current.visible = frame.washing; water.current.position.y = -.15 + Math.sin(time.current * 3) * .025; }
    if (steam.current) {
      steam.current.visible = frame.drying;
      steam.current.children.forEach((item, i) => { item.position.y = .1 + ((time.current * .3 + i * .22) % .75); item.scale.setScalar(.7 + Math.sin(time.current + i) * .1); });
    }
    if (rack.current) {
      const railScale = ease((t - 20) / 1.2) * (1 - ease((t - 25.65) / .65));
      rack.current.visible = t >= 20 && t < 26.3;
      rack.current.scale.setScalar(railScale);
      rack.current.position.y = -1.72 + 1.52 * railScale;
    }
    if (unloading.current) {
      unloading.current.visible = t >= 21.5 && t < 25.65;
      unloading.current.children.forEach((item, i) => {
        const pose = hangingPose(t, i);
        item.visible = pose.visible;
        item.position.set(pose.x, pose.y, pose.z);
        item.rotation.set(0, 0, pose.swing);
        item.scale.setScalar(pose.scale);
      });
    }
    if (folded.current) { folded.current.visible = frame.folded > 0; folded.current.scale.setScalar(Math.max(.001, frame.folded)); }
    if (bubbles.current) {
      bubbles.current.visible = frame.bubbles;
      bubbles.current.children.forEach((item, i) => { item.position.set(Math.sin(i * 3 + time.current * .6) * (i < 6 ? .45 : 1.8), -1.5 + ((time.current * .38 + i * .37) % 4), i < 6 ? 1 : .4); });
    }
  });
  const colors = ['#f7f5ee', '#1393d0', '#063f79'];
  return <group ref={root} position={[-.1, .14, 0]}>
    {/* Hollow cabinet: the front panel has an actual opening, not a circle on a box. */}
    {[-1.19, 1.19].map(x => <RoundedBox key={x} args={[.12, 3.16, 1.72]} radius={.055} position={[x, 0, .03]} castShadow><meshPhysicalMaterial color="#eeeef0" metalness={.25} roughness={.26} clearcoat={1} /></RoundedBox>)}
    <RoundedBox args={[2.5, .13, 1.76]} radius={.055} position={[0, 1.56, .03]} castShadow><meshPhysicalMaterial color="#faf9f6" metalness={.2} roughness={.24} clearcoat={1} /></RoundedBox>
    <RoundedBox args={[2.5, .15, 1.72]} radius={.05} position={[0, -1.55, .03]}><meshStandardMaterial color="#e1e4e5" metalness={.4} roughness={.3} /></RoundedBox>
    <mesh position={[0, 0, -.79]}><boxGeometry args={[2.38, 3.1, .09]} /><meshStandardMaterial color="#c9cfd1" metalness={.5} roughness={.35} /></mesh>
    <mesh position={[0, 0, .85]} castShadow receiveShadow><extrudeGeometry args={[face, { depth: .09, bevelEnabled: true, bevelSegments: 3, bevelSize: .015, bevelThickness: .015, steps: 1 }]} /><meshPhysicalMaterial color="#f7f7f3" metalness={.19} roughness={.26} clearcoat={.9} /></mesh>
    <RoundedBox args={[2.22, .44, .075]} radius={.045} position={[0, 1.13, .97]}><meshStandardMaterial color="#09263c" metalness={.5} roughness={.22} /></RoundedBox>
    <mesh position={[.25, 1.13, 1.016]}><planeGeometry args={[1.57, .32]} /><meshBasicMaterial ref={panel} map={displays[0]} toneMapped={false} /></mesh>
    <mesh position={[-.82, 1.13, 1.035]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.145, .145, .09, 64]} /><meshStandardMaterial color="#c8c6bd" metalness={.98} roughness={.2} /></mesh>
    <mesh position={[-.82, 1.225, 1.086]}><boxGeometry args={[.018, .055, .008]} /><meshStandardMaterial color="#c79a42" metalness={.8} /></mesh>
    <RoundedBox args={[.7, .17, .04]} radius={.025} position={[-.65, .69, .97]}><meshStandardMaterial color="#eeeae2" metalness={.3} /></RoundedBox>
    <mesh position={[-.65, .67, .998]}><boxGeometry args={[.42, .013, .006]} /><meshStandardMaterial color="#b9944d" metalness={.8} roughness={.3} /></mesh>
    <mesh position={[0, -.15, .97]}><torusGeometry args={[.845, .045, 20, 96]} /><meshStandardMaterial color="#384958" metalness={.8} roughness={.25} /></mesh>
    <group ref={drum} position={[0, -.15, .53]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.745, .745, .65, 80, 1, true]} /><meshStandardMaterial color="#a9b8be" metalness={1} roughness={.3} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0, -.32]}><circleGeometry args={[.745, 80]} /><meshStandardMaterial color="#afbec5" metalness={1} roughness={.35} /></mesh>
      <Perforations />
      {[0, 1, 2].map(i => <group key={i} rotation={[0, 0, i * Math.PI * 2 / 3]}><RoundedBox args={[.085, .17, .57]} radius={.035} position={[0, .64, 0]}><meshStandardMaterial color="#c2ced1" metalness={.95} roughness={.24} /></RoundedBox></group>)}
      <group ref={contents}>{colors.map((color, i) => <group key={color} position={[Math.sin(i * 2.1) * .29, Math.cos(i * 2.1) * .29, .13]} rotation={[.2, .2, i * 2.1]}><FabricBundle color={color} /></group>)}</group>
    </group>
    <pointLight ref={windowLight} position={[0, -.2, .9]} color="#78dcff" intensity={.8} distance={1.4} />
    <group ref={water} position={[0, -.15, .94]}><mesh><shapeGeometry args={[waterShape, 40]} /><meshPhysicalMaterial color="#1393d0" transparent opacity={.3} roughness={.12} metalness={.2} depthWrite={false} /></mesh></group>
    <group ref={hinge} position={[-.9, -.15, 1.035]}>
      <group position={[.9, 0, 0]}>
        <mesh castShadow><torusGeometry args={[.83, .105, 24, 112]} /><meshStandardMaterial color="#142e41" metalness={.88} roughness={.18} /></mesh>
        <mesh position={[0, 0, .052]}><torusGeometry args={[.855, .027, 16, 112]} /><meshStandardMaterial color="#d2b369" metalness={.92} roughness={.18} /></mesh>
        <mesh position={[0, 0, -.008]} scale={[1, 1, .18]}><sphereGeometry args={[.735, 56, 36]} /><meshPhysicalMaterial color="#c9e7ed" transparent opacity={.24} metalness={.08} roughness={.055} clearcoat={1} envMapIntensity={.65} depthWrite={false} /></mesh>
        <RoundedBox args={[.115, .36, .12]} radius={.04} position={[.77, .04, .1]}><meshStandardMaterial color="#c6ccd0" metalness={1} roughness={.21} /></RoundedBox>
      </group>
    </group>
    <RoundedBox args={[2.05, .14, .045]} radius={.035} position={[0, -1.29, .975]}><meshStandardMaterial color="#dee3e3" metalness={.4} roughness={.4} /></RoundedBox>
    <mesh position={[.86, -1.31, 1.01]}><circleGeometry args={[.075, 32]} /><meshStandardMaterial color="#c9d0d0" metalness={.55} roughness={.4} /></mesh>
    {[-.97, .97].map(x => <mesh key={x} position={[x, -1.69, .28]}><cylinderGeometry args={[.095, .1, .12, 24]} /><meshStandardMaterial color="#25333b" roughness={.9} /></mesh>)}
    <group ref={loading}>{colors.map(color => <group key={color}><Garment color={color} /></group>)}</group>
    <group ref={steam} position={[0, 0, 1.03]}>{[-.25, 0, .25].map((x, i) => <mesh key={x} position={[x, i * .2, 0]}><tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0, 0), new THREE.Vector3(x + .06, .15, 0), new THREE.Vector3(x - .02, .35, 0)]), 16, .009, 6, false]} /><meshBasicMaterial color="#d8b777" transparent opacity={.45} depthWrite={false} /></mesh>)}</group>
    <group ref={rack} position={[2.16, -.2, .25]}>
      {[-.72, .72].map(x => <mesh key={x} position={[x, -.1, 0]}><cylinderGeometry args={[.017, .017, 2.8, 12]} /><meshStandardMaterial color="#a0aeb5" metalness={1} roughness={.2} /></mesh>)}
      <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.018, .018, 1.48, 16]} /><meshStandardMaterial color="#c7ac68" metalness={.85} roughness={.2} /></mesh>
      {[-.48, 0, .48].map(x => <group key={x} position={[x, 0, 0]}>
        <mesh position={[0, 1.27, 0]}><torusGeometry args={[.035, .006, 6, 18, Math.PI * 1.6]} /><meshStandardMaterial color="#aebdc2" metalness={1} roughness={.2} /></mesh>
        <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.23, 0), new THREE.Vector3(-.19, 1.04, 0), new THREE.Vector3(.19, 1.04, 0), new THREE.Vector3(0, 1.23, 0)]), 24, .006, 6, false]} /><meshStandardMaterial color="#b9c4c8" metalness={1} roughness={.2} /></mesh>
      </group>)}
      {[-.72, .72].map(x => <mesh key={x} position={[x, -1.52, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.02, .02, .55, 12]} /><meshStandardMaterial color="#9baab3" metalness={.9} roughness={.3} /></mesh>)}
    </group>
    <group ref={unloading}>{colors.map(color => <group key={color}><Garment color={color} /></group>)}</group>
    <group ref={folded} position={[1.8, -1.72, 1.2]}>{[...colors].reverse().map((color, i) => <RoundedBox key={color} args={[1.18, .2, .72]} radius={.065} position={[0, i * .21 + .1, 0]} castShadow><meshPhysicalMaterial color={color} roughness={.95} sheen={.85} /></RoundedBox>)}</group>
    <group ref={bubbles}>{Array.from({ length: 12 }, (_, i) => <mesh key={i}><sphereGeometry args={[.025 + i % 4 * .025, 20, 14]} /><meshPhysicalMaterial color="#74ccec" transparent opacity={.35} roughness={.08} metalness={.1} clearcoat={1} depthWrite={false} /></mesh>)}</group>
  </group>;
}

export default function LaundryMachineScene(props: SceneProps) {
  return <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 1.5]} camera={{ position: [.8, .7, 9.3], fov: 27 }} frameloop={props.playing ? 'always' : 'demand'} gl={{ antialias: true, alpha: true }} aria-label="Interactive washing machine: hinged door, clothes loading, washing, warm-air drying and folded laundry">
    <ambientLight intensity={.65} /><hemisphereLight args={['#fffdf7', '#bacbd5', .85]} />
    <directionalLight position={[-3, 5, 5]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-.0001} shadow-normalBias={.025} />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} color="#fffaf1" position={[-3, 4, 5]} scale={[4, 6, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={2} color="#cbefff" position={[4, 2, 3]} scale={[2, 5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.5} color="#f2e1b9" position={[0, 4, -3]} scale={[4, 2, 1]} target={[0, 0, 0]} />
    </Environment>
    <Machine {...props} /><ContactShadows position={[0, -1.58, 0]} scale={11} opacity={.28} blur={2.6} far={6} />
  </Canvas>;
}
