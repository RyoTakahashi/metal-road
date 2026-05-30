import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type Instrument3D = 'vocal' | 'guitar' | 'bass' | 'drums' | 'keys';

/**
 * ローポリのメタルキャラ（プリミティブ構築・フラットシェーディング）。
 * headbang=true でヘドバンする。ライブステージ・盤面のコマで共用。
 */
export function Metalhead({
  position = [0, 0, 0],
  hair,
  instrument,
  phase = 0,
  headbang = true,
}: {
  position?: [number, number, number];
  hair: string;
  instrument: Instrument3D;
  phase?: number;
  headbang?: boolean;
}) {
  const upper = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!upper.current) return;
    upper.current.rotation.x = headbang
      ? Math.sin(clock.elapsedTime * 6 + phase) * 0.18 + 0.05
      : Math.sin(clock.elapsedTime * 2 + phase) * 0.04;
  });
  const skin = '#e9c6a4';
  return (
    <group position={position}>
      {/* 脚 */}
      <mesh position={[-0.16, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.26]} />
        <meshStandardMaterial color="#0e0e16" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0.16, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.26]} />
        <meshStandardMaterial color="#0e0e16" flatShading roughness={0.8} />
      </mesh>

      {/* 上半身 */}
      <group ref={upper} position={[0, 0.7, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial color="#17171f" flatShading roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.4, 0.21]}>
          <boxGeometry args={[0.1, 0.78, 0.02]} />
          <meshStandardMaterial color={hair} emissive={hair} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.42, 0.45, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.16, 0.6, 0.2]} />
          <meshStandardMaterial color="#15151d" flatShading />
        </mesh>
        <mesh position={[0.42, 0.45, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.16, 0.6, 0.2]} />
          <meshStandardMaterial color="#15151d" flatShading />
        </mesh>

        {/* 頭 */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <icosahedronGeometry args={[0.34, 1]} />
          <meshStandardMaterial color={skin} flatShading roughness={0.9} />
        </mesh>
        {[-0.18, 0, 0.18].map((dx, i) => (
          <mesh key={i} position={[dx, 1.42, -0.05]} rotation={[-0.2 + i * 0.2, 0, dx]} castShadow>
            <coneGeometry args={[0.12, 0.4, 5]} />
            <meshStandardMaterial color={hair} flatShading roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 1.12, -0.18]} castShadow>
          <sphereGeometry args={[0.36, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color={hair} flatShading roughness={0.6} />
        </mesh>

        {/* 楽器 */}
        {instrument === 'vocal' && (
          <mesh position={[0.2, 0.95, 0.35]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
            <meshStandardMaterial color="#cfd2da" metalness={0.6} roughness={0.3} />
          </mesh>
        )}
        {(instrument === 'guitar' || instrument === 'bass') && (
          <group position={[0, 0.35, 0.28]} rotation={[0, 0, -0.5]}>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.32, 0.08]} />
              <meshStandardMaterial color={instrument === 'bass' ? '#2a1b45' : '#5a0d18'} flatShading metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh position={[0.45, 0.18, 0]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.08, 0.7, 0.05]} />
              <meshStandardMaterial color="#3a2a18" flatShading />
            </mesh>
          </group>
        )}
        {instrument === 'keys' && (
          <mesh position={[0, 0.2, 0.34]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.7, 0.12, 0.22]} />
            <meshStandardMaterial color="#101018" flatShading />
          </mesh>
        )}
        {instrument === 'drums' && (
          <>
            <mesh position={[-0.3, 0.5, 0.3]} rotation={[0, 0, 0.6]}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 5]} />
              <meshStandardMaterial color="#cdb48a" />
            </mesh>
            <mesh position={[0.3, 0.5, 0.3]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 5]} />
              <meshStandardMaterial color="#cdb48a" />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
