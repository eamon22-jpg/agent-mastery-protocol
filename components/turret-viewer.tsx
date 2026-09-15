'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Float, OrbitControls, RoundedBox } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

const DESKTOP_ZOOM = 82;
const MOBILE_ZOOM = 64;
const MIN_ZOOM = 50;

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    camera.zoom = size.width <= 600 ? MOBILE_ZOOM : DESKTOP_ZOOM;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

const material = {
  white: new THREE.MeshStandardMaterial({ color: '#8e918f', metalness: 0.7, roughness: 0.24 }),
  whiteLight: new THREE.MeshStandardMaterial({ color: '#c3c5c0', metalness: 0.62, roughness: 0.2 }),
  gray: new THREE.MeshStandardMaterial({ color: '#696d6b', metalness: 0.76, roughness: 0.25 }),
  grayDark: new THREE.MeshStandardMaterial({ color: '#454947', metalness: 0.82, roughness: 0.27 }),
  black: new THREE.MeshStandardMaterial({ color: '#101214', metalness: 0.94, roughness: 0.18 }),
  orange: new THREE.MeshStandardMaterial({ color: '#e2b34c', emissive: '#6f4105', emissiveIntensity: 0.18, metalness: 0.94, roughness: 0.11 }),
  yellow: new THREE.MeshStandardMaterial({ color: '#e2b34c', emissive: '#6f4105', emissiveIntensity: 0.18, metalness: 0.94, roughness: 0.11 }),
  lens: new THREE.MeshStandardMaterial({ color: '#e2b34c', emissive: '#ff9f0a', emissiveIntensity: 2.1, metalness: 0.58, roughness: 0.1, toneMapped: false }),
};

function Beam({
  from,
  to,
  width,
  depth,
  color = material.gray,
}: {
  from: [number, number, number];
  to: [number, number, number];
  width: number;
  depth: number;
  color?: THREE.Material;
}) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );

  return (
    <RoundedBox
      args={[width, length, depth]}
      radius={0.07}
      smoothness={2}
      position={midpoint}
      quaternion={quaternion}
      material={color}
      castShadow
    />
  );
}

function Axle({ position, radius = 0.17 }: { position: [number, number, number]; radius?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={material.grayDark} castShadow>
        <cylinderGeometry args={[radius, radius, 0.34, 24]} />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]} material={material.gray}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, 0.08, 24]} />
      </mesh>
      <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={material.gray}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, 0.08, 24]} />
      </mesh>
    </group>
  );
}

function Muzzle() {
  return (
    <group position={[-1.72, 1.2, 0]}>
      <RoundedBox args={[0.64, 0.68, 0.82]} radius={0.12} smoothness={3} material={material.gray} castShadow />
      <RoundedBox args={[0.57, 0.51, 0.63]} radius={0.1} smoothness={3} position={[-0.24, 0, 0]} material={material.black} castShadow />
      <mesh position={[-0.535, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={material.black}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
      </mesh>
      <mesh position={[-0.58, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={material.black}>
        <circleGeometry args={[0.105, 20]} />
      </mesh>

      <RoundedBox args={[0.17, 1.08, 1.06]} radius={0.055} smoothness={2} position={[0.28, 0, 0]} material={material.orange} castShadow />
      <RoundedBox args={[0.31, 0.18, 0.94]} radius={0.04} smoothness={2} position={[0.22, 0.55, 0]} material={material.orange} />
      <RoundedBox args={[0.31, 0.18, 0.94]} radius={0.04} smoothness={2} position={[0.22, -0.55, 0]} material={material.orange} />
      <RoundedBox args={[0.14, 0.42, 0.19]} radius={0.03} smoothness={2} position={[0.25, 0.81, 0]} material={material.grayDark} />
    </group>
  );
}

function WeaponHead() {
  return (
    <group>
      <RoundedBox args={[2.4, 0.92, 1.02]} radius={0.12} smoothness={3} position={[-0.27, 1.2, 0]} material={material.white} castShadow />
      <RoundedBox args={[1.62, 0.26, 0.92]} radius={0.06} smoothness={2} position={[-0.05, 1.65, 0]} material={material.gray} castShadow />
      <RoundedBox args={[0.62, 0.32, 1.08]} radius={0.05} smoothness={2} position={[-0.82, 0.74, 0]} material={material.grayDark} />
      <Muzzle />

      {[0.54, -0.54].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <RoundedBox
            args={[1.92, 0.105, 0.034]}
            radius={0.018}
            smoothness={2}
            position={[-0.27, 1.2, z > 0 ? 0.003 : -0.003]}
            material={material.black}
          />
          <RoundedBox
            args={[1.82, 0.055, 0.04]}
            radius={0.014}
            smoothness={2}
            position={[-0.27, 1.2, z > 0 ? 0.008 : -0.008]}
            material={material.lens}
          />
        </group>
      ))}
    </group>
  );
}

function RearCanister() {
  return (
    <group position={[1.25, 1.34, 0]}>
      <mesh material={material.grayDark} castShadow>
        <cylinderGeometry args={[0.57, 0.57, 0.38, 16]} />
      </mesh>
      <mesh position={[0, 0.44, 0]} material={material.white} castShadow>
        <cylinderGeometry args={[0.62, 0.57, 0.52, 12]} />
      </mesh>
      <mesh position={[0, 0.93, 0]} material={material.whiteLight} castShadow>
        <cylinderGeometry args={[0.56, 0.62, 0.47, 12]} />
      </mesh>
      <mesh position={[0, 1.31, 0]} material={material.yellow} castShadow>
        <cylinderGeometry args={[0.46, 0.59, 0.46, 8]} />
      </mesh>
      <RoundedBox args={[0.42, 0.15, 0.52]} radius={0.035} smoothness={2} position={[0, 1.65, 0]} material={material.grayDark} />
      <RoundedBox args={[0.22, 0.34, 0.12]} radius={0.02} smoothness={2} position={[-0.22, 1.53, 0]} material={material.grayDark} />
      <RoundedBox args={[0.22, 0.34, 0.12]} radius={0.02} smoothness={2} position={[0.22, 1.53, 0]} material={material.grayDark} />
      {[0.61, -0.61].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <RoundedBox args={[0.65, 0.35, 0.05]} radius={0.02} smoothness={2} position={[0, 0.66, 0]} material={material.whiteLight} />
          <RoundedBox args={[0.35, 0.3, 0.055]} radius={0.02} smoothness={2} position={[0, 0.23, 0]} material={material.black} />
        </group>
      ))}
    </group>
  );
}

function CenterChassis() {
  return (
    <group>
      <RoundedBox args={[1.12, 0.66, 1.12]} radius={0.13} smoothness={3} position={[0.38, -0.38, 0]} material={material.grayDark} castShadow />
      <RoundedBox args={[1.05, 0.45, 1.2]} radius={0.11} smoothness={3} position={[-0.02, -0.17, 0]} material={material.white} castShadow />
      {[0.63, -0.63].map((z) => (
        <group key={z} position={[0.35, -0.38, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={material.whiteLight} castShadow>
            <cylinderGeometry args={[0.59, 0.59, 0.25, 32]} />
          </mesh>
          <mesh position={[0, 0, z > 0 ? 0.15 : -0.15]} rotation={[Math.PI / 2, 0, 0]} material={material.gray}>
            <cylinderGeometry args={[0.34, 0.34, 0.08, 32]} />
          </mesh>
          <mesh position={[0, 0, z > 0 ? 0.21 : -0.21]} rotation={[Math.PI / 2, 0, 0]} material={material.grayDark}>
            <cylinderGeometry args={[0.16, 0.16, 0.05, 24]} />
          </mesh>
          <RoundedBox args={[0.18, 0.08, 0.04]} radius={0.015} smoothness={2} position={[-0.35, 0, z > 0 ? 0.27 : -0.27]} material={material.orange} />
        </group>
      ))}
    </group>
  );
}

function UpperSupports() {
  return (
    <group>
      {[0.39, -0.39].map((z) => (
        <group key={z}>
          <Beam from={[0.02, -0.06, z]} to={[0.48, 0.82, z]} width={0.31} depth={0.21} color={material.grayDark} />
          <Beam from={[0.52, 0.06, z]} to={[0.95, 0.84, z]} width={0.32} depth={0.21} color={material.gray} />
          <Axle position={[0.5, 0.04, z]} radius={0.14} />
          <Axle position={[0.72, 0.78, z]} radius={0.12} />
        </group>
      ))}
    </group>
  );
}

function Foot({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.62, 0.22, 0.48]} radius={0.07} smoothness={2} material={material.black} castShadow />
      <RoundedBox args={[0.25, 0.16, 0.5]} radius={0.04} smoothness={2} position={[-0.36, 0.01, 0]} material={material.grayDark} />
      <RoundedBox args={[0.25, 0.16, 0.5]} radius={0.04} smoothness={2} position={[0.29, 0.01, 0]} material={material.grayDark} />
    </group>
  );
}

function Legs() {
  return (
    <group>
      <Beam from={[-0.08, -0.62, 0]} to={[-1.25, -2.05, 0]} width={0.39} depth={0.45} />
      <Axle position={[-0.1, -0.63, 0]} radius={0.2} />
      <Axle position={[-1.24, -2.04, 0]} radius={0.16} />
      <Foot position={[-1.56, -2.28, 0]} />

      {[0.72, -0.72].map((z) => (
        <group key={z}>
          <Beam from={[0.65, -0.68, z * 0.45]} to={[0.88, -1.85, z]} width={0.24} depth={0.25} />
          <Axle position={[0.87, -1.84, z]} radius={0.14} />
          <Foot position={[0.88, -2.13, z]} rotation={z > 0 ? -0.08 : 0.08} />
        </group>
      ))}
    </group>
  );
}

function TurretModel() {
  return (
    <group position={[0.1, -0.15, 0]} rotation={[0, 0, 0]} scale={0.9}>
      <WeaponHead />
      <RearCanister />
      <UpperSupports />
      <CenterChassis />
      <Legs />
    </group>
  );
}

export function TurretViewer() {
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
      <div className="viewer-canvas" aria-label="Interactive 3D model of the Masterwork Turret">
        <Canvas orthographic camera={{ position: [0, 0.25, 10], zoom: DESKTOP_ZOOM, near: 0.1, far: 100 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} shadows>
          <color attach="background" args={['#e8e9e6']} />
          <fog attach="fog" args={['#e8e9e6', 10, 17]} />
          <ResponsiveCamera />
          <ambientLight intensity={0.76} />
          <directionalLight position={[-5, 7, 8]} intensity={3.2} castShadow />
          <directionalLight position={[5, 1, 4]} intensity={1.1} color="#dfe5e8" />
          <pointLight position={[-1.6, 1.25, 2.5]} intensity={3.2} color="#ffb52e" distance={4.5} />
          <Suspense fallback={null}>
            <Float speed={0.85} rotationIntensity={0.018} floatIntensity={0.06}>
              <TurretModel />
            </Float>
            <Environment preset="warehouse" environmentIntensity={0.38} />
          </Suspense>
          <OrbitControls
            ref={controls}
            makeDefault
            enablePan={false}
            enableZoom={false}
            minZoom={MIN_ZOOM}
            maxZoom={145}
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
