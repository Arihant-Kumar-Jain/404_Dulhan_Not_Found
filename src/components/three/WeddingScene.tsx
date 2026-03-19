'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════ Floating Petal Particle ═══════════════ */
function Petal({ position, speed, rotationSpeed }: { position: [number, number, number]; speed: number; rotationSpeed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y -= speed * 0.01;
    ref.current.rotation.x += rotationSpeed * 0.01;
    ref.current.rotation.z += rotationSpeed * 0.005;
    ref.current.position.x += Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.003;

    if (ref.current.position.y < -5) {
      ref.current.position.y = initialY + 3;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[0.08, 0.12]} />
      <meshStandardMaterial
        color={new THREE.Color().setHSL(0.03 + Math.random() * 0.05, 0.7, 0.6)}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ═══════════════ Floating Diya (Lamp) ═══════════════ */
function Diya({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    lightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.5;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={2} />
        </mesh>
        <pointLight ref={lightRef} color="#FFB347" intensity={1.5} distance={3} />
      </group>
    </Float>
  );
}

/* ═══════════════ Ornamental Ring ═══════════════ */
function GoldenRing({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <Float speed={1} floatIntensity={0.2}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, 0.03, 16, 64]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} emissive="#D4AF37" emissiveIntensity={0.3} />
      </mesh>
    </Float>
  );
}

/* ═══════════════ Main Wedding Scene ═══════════════ */
export default function WeddingScene() {
  const petals = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        Math.random() * 8 - 2,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      speed: 0.3 + Math.random() * 0.7,
      rotationSpeed: 0.5 + Math.random() * 2,
    }));
  }, []);

  const diyas = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        Math.random() * 4 - 1,
        (Math.random() - 0.5) * 4 - 1,
      ] as [number, number, number],
    }));
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.3} color="#FFF8E7" />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#FFD700" />
      <pointLight position={[0, 3, 2]} intensity={1} color="#D4AF37" distance={10} />

      {/* Rose Petals Falling */}
      {petals.map((petal, i) => (
        <Petal key={i} {...petal} />
      ))}

      {/* Floating Diyas */}
      {diyas.map((diya, i) => (
        <Diya key={`diya-${i}`} {...diya} />
      ))}

      {/* Golden Ornamental Rings */}
      <GoldenRing position={[0, 0.5, -2]} scale={1.5} />
      <GoldenRing position={[-2, -1, -3]} scale={0.8} />
      <GoldenRing position={[2.5, 1.5, -4]} scale={1.2} />

      {/* Sparkle Particles */}
      <Sparkles
        count={200}
        scale={[12, 8, 6]}
        size={2}
        speed={0.3}
        color="#D4AF37"
        opacity={0.4}
      />

      {/* Additional atmospheric sparkles */}
      <Sparkles
        count={100}
        scale={[10, 6, 4]}
        size={1.5}
        speed={0.2}
        color="#DCAE96"
        opacity={0.3}
      />
    </Canvas>
  );
}
