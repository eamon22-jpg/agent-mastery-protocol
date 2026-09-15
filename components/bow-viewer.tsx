'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Line, OrbitControls } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

type Point = [number, number];

const DESKTOP_ZOOM = 72;
const MOBILE_ZOOM = 50;
const MIN_ZOOM = 40;

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    camera.zoom = size.width <= 600 ? MOBILE_ZOOM : DESKTOP_ZOOM;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

const materials = {
  armor: new THREE.MeshStandardMaterial({ color: '#8e918f', metalness: 0.7, roughness: 0.24 }),
  armorLight: new THREE.MeshStandardMaterial({ color: '#c3c5c0', metalness: 0.62, roughness: 0.2 }),
  armorDark: new THREE.MeshStandardMaterial({ color: '#555957', metalness: 0.82, roughness: 0.25 }),
  graphite: new THREE.MeshStandardMaterial({ color: '#707471', metalness: 0.86, roughness: 0.2 }),
  black: new THREE.MeshStandardMaterial({ color: '#343735', metalness: 0.76, roughness: 0.29 }),
  energy: new THREE.MeshStandardMaterial({
    color: '#ffd36a',
    emissive: '#ff9f0a',
    emissiveIntensity: 2.6,
    metalness: 0.72,
    roughness: 0.13,
    toneMapped: false,
  }),
  pivot: new THREE.MeshStandardMaterial({ color: '#d89a2b', metalness: 0.94, roughness: 0.12 }),
};

function EnergyPulse() {
  useFrame(({ clock }) => {
    materials.energy.emissiveIntensity = 2.45 + Math.sin(clock.elapsedTime * 1.35) * 0.28;
  });
  return null;
}

function createExtrusion(points: Point[], depth: number, bevel = 0.045) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSegments: 2,
    bevelSize: bevel,
    bevelThickness: bevel,
  });
}

function ShapePart({
  points,
  depth = 0.28,
  z = 0,
  material = materials.armor,
}: {
  points: Point[];
  depth?: number;
  z?: number;
  material?: THREE.Material;
}) {
  const geometry = useMemo(() => createExtrusion(points, depth), [points, depth]);
  return <mesh geometry={geometry} material={material} position={[0, 0, z - depth / 2]} castShadow receiveShadow />;
}

function FacePair({ points, material, depth = 0.045, offset = 0.39 }: {
  points: Point[];
  material: THREE.Material;
  depth?: number;
  offset?: number;
}) {
  return (
    <>
      <ShapePart points={points} material={material} depth={depth} z={offset} />
      <ShapePart points={points} material={material} depth={depth} z={-offset} />
    </>
  );
}

function PivotFace({ x, y, z, scale = 1 }: { x: number; y: number; z: number; scale?: number }) {
  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.armorDark} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.15, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]} material={materials.armorLight}>
        <cylinderGeometry args={[0.2, 0.2, 0.08, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} material={materials.graphite}>
        <cylinderGeometry args={[0.075, 0.075, 0.05, 24]} />
      </mesh>
      <mesh position={[0, 0, 0.184]} rotation={[Math.PI / 2, 0, 0]} material={materials.pivot}>
        <torusGeometry args={[0.135, 0.018, 8, 32]} />
      </mesh>
    </group>
  );
}

function Pivot(props: { x: number; y: number; scale?: number }) {
  return (
    <>
      <PivotFace {...props} z={0.19} />
      <PivotFace {...props} z={-0.55} />
    </>
  );
}

const upperOuter: Point[] = [
  [-1.95, 0.28], [-2.5, 0.1], [-2.08, 0.56], [-1.82, 0.88], [-1.72, 1.42],
  [-1.42, 1.98], [-0.82, 2.54], [-0.14, 3.3], [0.74, 4.13], [1.14, 4.35],
  [1.43, 4.25], [1.52, 4.02], [1.34, 3.86], [1.08, 3.88], [0.62, 3.58],
  [0.02, 2.78], [-0.64, 1.98], [-0.98, 1.4], [-1.12, 0.92], [-1.5, 0.54],
];

const upperPlate: Point[] = [
  [-1.76, 0.4], [-1.95, 0.72], [-1.82, 1.25], [-1.47, 1.83], [-0.8, 2.48],
  [-0.1, 3.28], [0.73, 4.02], [1.06, 4.16], [1.18, 4.04], [0.84, 3.76],
  [0.36, 3.36], [-0.26, 2.54], [-0.92, 1.72], [-1.28, 1.08], [-1.32, 0.68],
];

const upperInset: Point[] = [
  [-1.98, 0.33], [-2.3, 0.24], [-1.94, 0.56], [-1.71, 0.96], [-1.61, 1.43],
  [-1.43, 1.65], [-1.42, 1.22], [-1.52, 0.75],
];

const upperGold: Point[] = [
  [-1.79, 0.48], [-1.88, 0.68], [-1.67, 1.05], [-1.49, 1.58], [-1.04, 2.08],
  [-0.45, 2.7], [0.19, 3.49], [0.34, 3.52], [-0.23, 2.68], [-0.88, 1.92],
  [-1.35, 1.42], [-1.5, 0.89],
];

const upperFork: Point[] = [
  [-1.7, 1.25], [-1.95, 2.03], [-1.84, 2.72], [-1.67, 2.08], [-1.48, 1.58],
];

const upperSpike: Point[] = [
  [-0.56, 1.76], [-0.46, 2.66], [-0.28, 1.88], [-0.28, 1.38],
];

function HalfBow({ mirror = false }: { mirror?: boolean }) {
  const scaleY = mirror ? -1 : 1;
  return (
    <group scale={[1, scaleY, 1]}>
      <ShapePart points={upperOuter} material={materials.armorDark} depth={0.34} />
      <FacePair points={upperPlate} material={materials.armor} depth={0.1} offset={0.25} />
      <FacePair points={upperInset} material={materials.graphite} depth={0.07} offset={0.34} />
      <FacePair points={upperGold} material={materials.energy} />
      <FacePair points={upperFork} material={materials.armorLight} depth={0.1} offset={0.26} />
      <ShapePart points={upperSpike} material={materials.armorDark} depth={0.2} z={0.05} />
      <Pivot x={-0.42} y={1.72} />

      <group position={[1.32, 4.09, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.graphite}>
          <torusGeometry args={[0.24, 0.052, 12, 36]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={materials.pivot}>
          <torusGeometry args={[0.17, 0.018, 8, 32]} />
        </mesh>
      </group>

    </group>
  );
}

const centerBridge: Point[] = [
  [0.45, 0.34], [1.55, 0.34], [1.96, 0.5], [2.18, 0.3], [1.94, 0.08],
  [1.52, 0.02], [0.45, 0.03],
];

const gripCore: Point[] = [
  [1.08, -0.18], [1.62, -0.18], [1.57, -0.55], [1.47, -0.78], [1.48, -1.22],
  [1.63, -1.47], [1.5, -1.7], [1.04, -1.68], [0.91, -1.46], [1.04, -1.2],
  [1.05, -0.76], [0.91, -0.51],
];

const gripPanel: Point[] = [
  [1.17, -0.42], [1.48, -0.42], [1.37, -0.79], [1.38, -1.25], [1.48, -1.48],
  [1.12, -1.48], [1.2, -1.2], [1.2, -0.76],
];

function CenterAssembly() {
  return (
    <group>
      <ShapePart points={centerBridge} material={materials.armorDark} depth={0.36} />
      <FacePair points={centerBridge} material={materials.armor} depth={0.06} offset={0.26} />

      <mesh position={[0.92, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.armorLight} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.02, 20]} />
      </mesh>
      <mesh position={[0.92, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.graphite}>
        <cylinderGeometry args={[0.19, 0.19, 1.12, 20]} />
      </mesh>
      <mesh position={[0.92, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.armorLight}>
        <cylinderGeometry args={[0.14, 0.14, 1.19, 20]} />
      </mesh>

      <ShapePart points={gripCore} material={materials.black} depth={0.36} />
      <FacePair points={gripPanel} material={materials.armorDark} depth={0.055} offset={0.27} />

      {[-0.64, -0.86, -1.08, -1.3].flatMap((y) =>
        [0.31, -0.31].map((z) => (
          <mesh key={`${y}-${z}`} position={[1.25, y, z]} material={materials.armorLight}>
            <boxGeometry args={[0.27, 0.045, 0.04]} />
          </mesh>
        )),
      )}

      {[0.04, 0.27].map((y) => (
        <mesh key={y} position={[-0.04, y, 0]} rotation={[0, 0, Math.PI / 2]} material={y > 0.1 ? materials.armorLight : materials.graphite}>
          <cylinderGeometry args={[0.035, 0.035, 1.55, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function BowModel() {
  return (
    <group position={[-0.15, 0.25, 0]} rotation={[0, 0, 0]} scale={0.7}>
      <group scale={[-1, 1, 1]}>
        <HalfBow />
        <HalfBow mirror />
      </group>
      <CenterAssembly />

      <Line points={[[-1.32, 4.08, 0], [-1.32, -4.08, 0]]} color="#ffb52e" lineWidth={5} transparent opacity={0.16} />
      <Line points={[[-1.32, 4.08, 0], [-1.32, -4.08, 0]]} color="#ffd66f" lineWidth={1.45} />
    </group>
  );
}

export function BowViewer() {
  const controls = useRef<OrbitControlsImpl>(null);
  const adjustZoom = (factor: number) => {
    const camera = controls.current?.object as THREE.OrthographicCamera | undefined;
    if (!camera) return;
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, MIN_ZOOM, 140);
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
      <div className="viewer-canvas" aria-label="Interactive 3D model of the Trueflight bow">
        <Canvas orthographic camera={{ position: [0, 0.15, 10], zoom: DESKTOP_ZOOM, near: 0.1, far: 100 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} shadows>
          <color attach="background" args={['#e8e9e6']} />
          <fog attach="fog" args={['#e8e9e6', 10, 17]} />
          <ResponsiveCamera />
          <ambientLight intensity={0.62} />
          <directionalLight position={[4, 6, 8]} intensity={2.8} castShadow />
          <directionalLight position={[-4, 1, 4]} intensity={0.75} color="#e8ebee" />
          <pointLight position={[-0.4, 1.5, 3]} intensity={4.5} color="#ffb52e" distance={6} />
          <pointLight position={[1.1, -1.7, -2]} intensity={2.2} color="#ffd36a" distance={5} />
          <Suspense fallback={null}>
            <EnergyPulse />
            <Float speed={1} rotationIntensity={0.025} floatIntensity={0.1}>
              <BowModel />
            </Float>
            <ContactShadows position={[0, -3.45, 0]} opacity={0.18} scale={9} blur={2.8} far={5} />
            <Environment preset="studio" environmentIntensity={0.34} />
          </Suspense>
          <OrbitControls
            ref={controls}
            makeDefault
            enablePan={false}
            enableZoom={false}
            minZoom={MIN_ZOOM}
            maxZoom={140}
            minPolarAngle={Math.PI * 0.22}
            maxPolarAngle={Math.PI * 0.78}
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
