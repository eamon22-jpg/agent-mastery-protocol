'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, RoundedBox } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

type Point = [number, number];

const DESKTOP_ZOOM = 78;
const MOBILE_ZOOM = 62;
const MIN_ZOOM = 48;

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    camera.zoom = size.width <= 600 ? MOBILE_ZOOM : DESKTOP_ZOOM;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

const steel = new THREE.MeshStandardMaterial({
  color: '#eef1f0', metalness: 0.52, roughness: 0.34, flatShading: true,
});
const edgeSteel = new THREE.MeshStandardMaterial({
  color: '#ffffff', metalness: 0.42, roughness: 0.22,
});
const darkSteel = new THREE.MeshStandardMaterial({
  color: '#263036', metalness: 0.48, roughness: 0.38, flatShading: true,
});
const gripSteel = new THREE.MeshStandardMaterial({
  color: '#e3e7e6', metalness: 0.4, roughness: 0.38,
});
const leather = new THREE.MeshStandardMaterial({
  color: '#6b4a32', metalness: 0.02, roughness: 0.84,
  side: THREE.DoubleSide,
});
const black = new THREE.MeshStandardMaterial({
  color: '#11171b', metalness: 0.34, roughness: 0.46,
});
const gold = new THREE.MeshStandardMaterial({
  color: '#ffd36a', emissive: '#ff9f0a', emissiveIntensity: 2.25,
  metalness: 0.08, roughness: 0.16, toneMapped: false,
});
const goldGlass = new THREE.MeshStandardMaterial({
  color: '#fff1ad', emissive: '#e2b34c', emissiveIntensity: 0.9,
  transparent: true, opacity: 0.64, metalness: 0.12, roughness: 0.2,
});

function makeShape(points: Point[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
}

function makeExtrusion(points: Point[], depth: number, bevel: number, hole?: Point[]) {
  const shape = makeShape(points);
  if (hole) {
    const path = new THREE.Path();
    hole.forEach(([x, y], index) => {
      if (index === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
    shape.holes.push(path);
  }
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSegments: 2,
    bevelSize: bevel,
    bevelThickness: bevel,
  });
}

function Extrusion({
  points, depth, bevel = 0.035, hole, material, z = 0,
}: {
  points: Point[];
  depth: number;
  bevel?: number;
  hole?: Point[];
  material: THREE.Material;
  z?: number;
}) {
  const geometry = useMemo(
    () => makeExtrusion(points, depth, bevel, hole),
    [points, depth, bevel, hole],
  );
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, 0, z - depth / 2]}
      castShadow
      receiveShadow
    />
  );
}

const darkInlay: Point[] = [
  [0, 3.26], [-0.25, 2.62], [-0.48, 1.65], [-0.57, 0.96],
  [-0.42, 0.56], [0, 0.42], [0.42, 0.56], [0.57, 0.96],
  [0.48, 1.65], [0.25, 2.62],
];

const bladeHole: Point[] = [
  [0, 1.55], [-0.19, 1.16], [0, 0.84], [0.19, 1.16],
];

type SurfaceRow = { y: number; outer: number; inner: number; ridge: number };
const surfaceRows: SurfaceRow[] = [
  { y: 4.5, outer: 0, inner: 0, ridge: 0.02 },
  { y: 4.16, outer: 0.22, inner: 0.01, ridge: 0.14 },
  { y: 3.76, outer: 0.45, inner: 0.03, ridge: 0.25 },
  { y: 3.3, outer: 0.63, inner: 0.07, ridge: 0.29 },
  { y: 2.8, outer: 0.8, inner: 0.13, ridge: 0.31 },
  { y: 2.28, outer: 0.92, inner: 0.2, ridge: 0.31 },
  { y: 1.76, outer: 1.01, inner: 0.28, ridge: 0.29 },
  { y: 1.34, outer: 1, inner: 0.38, ridge: 0.25 },
  { y: 1.02, outer: 0.96, inner: 0.46, ridge: 0.2 },
  { y: 0.67, outer: 0.67, inner: 0.48, ridge: 0.14 },
];

function smoothBladeRows(): SurfaceRow[] {
  const profile = new THREE.CatmullRomCurve3(
    surfaceRows.map((row) => new THREE.Vector3(row.outer, row.y, row.inner)),
    false,
    'centripetal',
  );
  const ridge = new THREE.CatmullRomCurve3(
    surfaceRows.map((row) => new THREE.Vector3(row.ridge, row.y, 0)),
    false,
    'centripetal',
  );

  return Array.from({ length: 29 }, (_, index) => {
    const t = index / 28;
    const profilePoint = profile.getPoint(t);
    const ridgePoint = ridge.getPoint(t);
    return {
      y: profilePoint.y,
      outer: Math.max(0, profilePoint.x),
      inner: Math.max(0, profilePoint.z),
      ridge: Math.max(0.018, ridgePoint.x),
    };
  });
}

const smoothRows = smoothBladeRows();
const smoothBladeOutline: Point[] = [
  ...smoothRows.map((row): Point => [-row.outer, row.y]),
  ...[...smoothRows].reverse().map((row): Point => [row.outer, row.y]),
];

function createBladeFace(side: 1 | -1, back: boolean) {
  const positions: number[] = [];
  const indices: number[] = [];
  const zDirection = back ? -1 : 1;

  smoothRows.forEach((row) => {
    positions.push(
      row.inner * side, row.y, row.ridge * zDirection,
      row.outer * side, row.y, 0.024 * zDirection,
    );
  });

  for (let index = 0; index < smoothRows.length - 1; index += 1) {
    const current = index * 2;
    const next = current + 2;
    if ((side === 1) !== back) {
      indices.push(current, current + 1, next + 1, current, next + 1, next);
    } else {
      indices.push(current, next + 1, current + 1, current, next, next + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createBladeEdge(side: 1 | -1) {
  const positions: number[] = [];
  const indices: number[] = [];

  smoothRows.forEach((row) => {
    positions.push(
      row.outer * side, row.y, 0.024,
      row.outer * side, row.y, -0.024,
    );
  });

  for (let index = 0; index < smoothRows.length - 1; index += 1) {
    const current = index * 2;
    const next = current + 2;
    if (side === 1) indices.push(current, current + 1, next + 1, current, next + 1, next);
    else indices.push(current, next + 1, current + 1, current, next, next + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function BladeEdge({ side }: { side: 1 | -1 }) {
  const geometry = useMemo(() => createBladeEdge(side), [side]);
  return <mesh geometry={geometry} material={edgeSteel} castShadow receiveShadow />;
}

function BladeFace({ side, back = false }: { side: 1 | -1; back?: boolean }) {
  const geometry = useMemo(() => createBladeFace(side, back), [side, back]);
  return <mesh geometry={geometry} material={edgeSteel} castShadow receiveShadow />;
}

function Blade() {
  return (
    <group>
      <Extrusion
        points={smoothBladeOutline}
        hole={bladeHole}
        depth={0.18}
        bevel={0.008}
        material={steel}
      />
      <Extrusion
        points={darkInlay}
        hole={bladeHole}
        depth={0.026}
        bevel={0.006}
        z={0.112}
        material={darkSteel}
      />
      <Extrusion
        points={darkInlay}
        hole={bladeHole}
        depth={0.026}
        bevel={0.006}
        z={-0.112}
        material={darkSteel}
      />
      <BladeFace side={1} />
      <BladeFace side={-1} />
      <BladeFace side={1} back />
      <BladeFace side={-1} back />
      <BladeEdge side={1} />
      <BladeEdge side={-1} />
    </group>
  );
}

const handleOutline: Point[] = [
  [-0.36, -0.42], [-0.52, -0.66], [-0.55, -2.38], [-0.43, -2.67],
  [0.43, -2.67], [0.55, -2.38], [0.52, -0.66], [0.36, -0.42],
];

const handlePanel: Point[] = [
  [-0.32, -0.65], [-0.39, -2.28], [-0.31, -2.48], [0.31, -2.48],
  [0.39, -2.28], [0.32, -0.65],
];

function createLeatherWrap() {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 180;
  const turns = 4.45;

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const theta = t * turns * Math.PI * 2;
    const cosine = Math.cos(theta);
    const sine = Math.sin(theta);
    const halfWidth = 0.64 - t * 0.04;
    const halfDepth = 0.37;
    const squareX = Math.sign(cosine) * Math.sqrt(Math.abs(cosine));
    const squareZ = Math.sign(sine) * Math.sqrt(Math.abs(sine));
    const irregular = Math.sin(theta * 1.7) * 0.018 + Math.sin(theta * 3.9) * 0.009;
    const faceSlope = squareX * (0.075 + Math.sin(theta * 0.43) * 0.018);
    const y = -0.69 - t * 1.43 + irregular + faceSlope;
    const broadMiddleTurn = Math.exp(-Math.pow((t - 0.31) / 0.115, 2)) * 0.042;
    const bandHalf = 0.064 + broadMiddleTurn
      + Math.sin(theta * 1.3) * 0.012
      + Math.sin(theta * 0.57) * 0.008;
    const innerX = halfWidth * squareX;
    const innerZ = halfDepth * squareZ;
    const outerScale = 1.075 + Math.sin(theta * 2.1) * 0.006;
    const outerX = innerX * outerScale;
    const outerZ = innerZ * outerScale;

    positions.push(
      outerX, y + bandHalf, outerZ,
      outerX, y - bandHalf, outerZ,
      innerX, y + bandHalf, innerZ,
      innerX, y - bandHalf, innerZ,
    );
  }

  for (let index = 0; index < segments; index += 1) {
    const current = index * 4;
    const next = current + 4;
    indices.push(
      current, current + 1, next + 1, current, next + 1, next,
      current + 2, next + 3, current + 3, current + 2, next + 2, next + 3,
      current, next, next + 2, current, next + 2, current + 2,
      current + 1, current + 3, next + 3, current + 1, next + 3, next + 1,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function LeatherWrap() {
  const geometry = useMemo(() => createLeatherWrap(), []);
  return <mesh geometry={geometry} material={leather} castShadow receiveShadow />;
}

function Handle() {
  return (
    <group>
      <Extrusion points={handleOutline} depth={0.48} bevel={0.065} material={gripSteel} />
      <Extrusion points={handlePanel} depth={0.045} bevel={0.018} z={0.29} material={steel} />
      <Extrusion points={handlePanel} depth={0.045} bevel={0.018} z={-0.29} material={darkSteel} />
      <LeatherWrap />
      <RoundedBox
        args={[0.84, 0.16, 0.52]}
        radius={0.035}
        smoothness={2}
        position={[0, -2.69, 0]}
        material={black}
        castShadow
      />
    </group>
  );
}

function Hub() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={gripSteel} castShadow>
        <cylinderGeometry args={[0.74, 0.74, 0.46, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={goldGlass}>
        <cylinderGeometry args={[0.43, 0.43, 0.51, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={gold}>
        <cylinderGeometry args={[0.29, 0.29, 0.55, 48]} />
      </mesh>
      {[0.255, -0.255].map((z) => (
        <mesh key={z} position={[0, 0, z]} material={steel}>
          <ringGeometry args={[0.44, 0.72, 48]} />
        </mesh>
      ))}
      <pointLight position={[0, 0, 0.65]} intensity={2.35} color="#ffb629" distance={3} />
    </group>
  );
}

function KunaiModel() {
  return (
    <group position={[0.28, -0.55, 0]} rotation={[0, 0, 0]} scale={0.7}>
      <Handle />
      <Blade />
      <Hub />
    </group>
  );
}

export function KunaiViewer() {
  const controls = useRef<OrbitControlsImpl>(null);
  const adjustZoom = (factor: number) => {
    const camera = controls.current?.object as THREE.OrthographicCamera | undefined;
    if (!camera) return;
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, MIN_ZOOM, 145);
    camera.updateProjectionMatrix();
  };
  const resetView = () => {
    controls.current?.reset();
    const camera = controls.current?.object as THREE.OrthographicCamera | undefined;
    if (!camera) return;
    camera.zoom = window.matchMedia('(max-width: 600px)').matches ? MOBILE_ZOOM : DESKTOP_ZOOM;
    camera.updateProjectionMatrix();
  };
  return (
    <div className="viewer-wrap">
      <div className="viewer-canvas" aria-label="Interactive 3D model of the throwing knife">
        <Canvas
          orthographic
          camera={{ position: [0, 0.1, 10], zoom: DESKTOP_ZOOM, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <color attach="background" args={['#e8e9e6']} />
          <fog attach="fog" args={['#e8e9e6', 10, 18]} />
          <ResponsiveCamera />
          <ambientLight intensity={0.7} />
          <directionalLight position={[-5, 7, 8]} intensity={2.8} castShadow />
          <directionalLight position={[5, 2, 5]} intensity={1.05} color="#dce6e5" />
          <directionalLight position={[0, -3, -5]} intensity={0.55} color="#7e969b" />
          <Suspense fallback={null}>
            <KunaiModel />
            <ContactShadows position={[0.28, -2.52, 0]} opacity={0.18} scale={7} blur={2.7} far={5} />
            <Environment preset="warehouse" environmentIntensity={0.25} />
          </Suspense>
          <OrbitControls
            ref={controls}
            makeDefault
            enablePan={false}
            enableZoom={false}
            minZoom={MIN_ZOOM}
            maxZoom={145}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.8}
          />
        </Canvas>
      </div>
      <div className="viewer-instructions">
        <span className="drag-icon" aria-hidden="true">↔</span>
        <span>Drag to rotate</span>
      </div>
      <div className="model-controls">
        <button type="button" onClick={() => adjustZoom(0.88)} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => adjustZoom(1.14)} aria-label="Zoom in">+</button>
        <button type="button" onClick={resetView} aria-label="Reset the model view">
          <RotateCcw aria-hidden="true" size={14} />
        </button>
      </div>
    </div>
  );
}
