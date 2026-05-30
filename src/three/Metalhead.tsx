import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type Instrument3D = 'vocal' | 'guitar' | 'bass' | 'drums' | 'keys';

interface Props {
  position?: [number, number, number];
  hair: string;
  instrument: Instrument3D;
  phase?: number;
  /** 演奏中（ヘドバン）か、待機（ゆっくり揺れる）か */
  headbang?: boolean;
  /** サングラスをかける */
  shades?: boolean;
  /** 肌の色 */
  skin?: string;
}

const SKIN = '#e8c4a0';

/**
 * ローポリのメタルキャラ（プリミティブ構築・フラットシェーディング）。
 * 手・サングラス・スパイク髪・演奏モーション（ヘドバン＋髪揺れ＋ストローク）付き。
 */
export function Metalhead({ position = [0, 0, 0], hair, instrument, phase = 0, headbang = true, shades, skin = SKIN }: Props) {
  const upper = useRef<THREE.Group>(null);
  const hairRef = useRef<THREE.Group>(null);
  const strumArm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (upper.current) {
      const bang = headbang ? Math.sin(t * 7 + phase) * 0.22 + 0.06 : Math.sin(t * 2 + phase) * 0.05;
      upper.current.rotation.x = bang;
    }
    // 髪は頭の動きに少し遅れて揺れる
    if (hairRef.current) hairRef.current.rotation.x = (headbang ? Math.sin(t * 7 + phase - 0.7) * 0.18 : Math.sin(t * 2 + phase - 0.6) * 0.05);
    // ストロークする腕
    if (strumArm.current) strumArm.current.rotation.x = headbang ? Math.sin(t * 10 + phase) * 0.5 - 0.2 : -0.1;
  });

  const dark = '#15151d';
  const jacket = '#1b1b25';

  return (
    <group position={position}>
      {/* 影 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>

      {/* ブーツ */}
      <mesh position={[-0.17, 0.12, 0.03]} castShadow>
        <boxGeometry args={[0.24, 0.24, 0.34]} />
        <meshStandardMaterial color="#0a0a10" flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0.17, 0.12, 0.03]} castShadow>
        <boxGeometry args={[0.24, 0.24, 0.34]} />
        <meshStandardMaterial color="#0a0a10" flatShading roughness={0.7} />
      </mesh>
      {/* 脚（細身パンツ） */}
      <mesh position={[-0.16, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.6, 6]} />
        <meshStandardMaterial color="#0e0e16" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0.16, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.6, 6]} />
        <meshStandardMaterial color="#0e0e16" flatShading roughness={0.85} />
      </mesh>

      {/* 上半身（ヘドバンで動く） */}
      <group ref={upper} position={[0, 0.72, 0]}>
        {/* ベルト */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.32]} />
          <meshStandardMaterial color="#0a0a0f" flatShading metalness={0.5} roughness={0.4} />
        </mesh>
        {/* 胴 */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[0.5, 0.66, 0.3]} />
          <meshStandardMaterial color="#17171f" flatShading roughness={0.7} metalness={0.1} />
        </mesh>
        {/* ベスト（肩を広げる） */}
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[0.66, 0.5, 0.36]} />
          <meshStandardMaterial color={jacket} flatShading roughness={0.6} />
        </mesh>
        {/* バンドロゴ（胸の発光ライン） */}
        <mesh position={[0, 0.4, 0.19]}>
          <boxGeometry args={[0.12, 0.5, 0.02]} />
          <meshStandardMaterial color={hair} emissive={hair} emissiveIntensity={0.5} toneMapped={false} />
        </mesh>

        {/* 左腕（楽器側・固定気味） */}
        <group position={[-0.42, 0.6, 0.02]} rotation={[0, 0, 0.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.55, 6]} />
            <meshStandardMaterial color={dark} flatShading />
          </mesh>
          <mesh position={[0, -0.34, 0]} castShadow>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={skin} flatShading />
          </mesh>
        </group>

        {/* 右腕（ストローク） */}
        <group ref={strumArm} position={[0.42, 0.62, 0.05]}>
          <group rotation={[0, 0, -0.5]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.07, 0.55, 6]} />
              <meshStandardMaterial color={dark} flatShading />
            </mesh>
            <mesh position={[0, -0.34, 0]} castShadow>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial color={skin} flatShading />
            </mesh>
          </group>
        </group>

        {/* 首 */}
        <mesh position={[0, 0.74, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.12, 6]} />
          <meshStandardMaterial color={skin} flatShading />
        </mesh>

        {/* 頭 */}
        <group position={[0, 0.96, 0]}>
          <mesh castShadow>
            <icosahedronGeometry args={[0.32, 1]} />
            <meshStandardMaterial color={skin} flatShading roughness={0.85} />
          </mesh>
          {/* 目 / サングラス */}
          {shades ? (
            <mesh position={[0, 0.04, 0.27]}>
              <boxGeometry args={[0.36, 0.1, 0.06]} />
              <meshStandardMaterial color="#050505" metalness={0.5} roughness={0.2} />
            </mesh>
          ) : (
            <>
              <mesh position={[-0.11, 0.04, 0.27]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshStandardMaterial color="#141414" />
              </mesh>
              <mesh position={[0.11, 0.04, 0.27]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshStandardMaterial color="#141414" />
              </mesh>
            </>
          )}

          {/* 髪（揺れる。トップのスパイク＋サイド＋後ろのロング） */}
          <group ref={hairRef}>
            {/* 後ろのロングヘア */}
            <mesh position={[0, 0.0, -0.16]} castShadow>
              <sphereGeometry args={[0.36, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
              <meshStandardMaterial color={hair} flatShading roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.18, -0.2]} castShadow>
              <coneGeometry args={[0.28, 0.5, 6]} />
              <meshStandardMaterial color={hair} flatShading roughness={0.6} />
            </mesh>
            {/* トップのスパイク */}
            {[-0.2, -0.07, 0.07, 0.2].map((dx, i) => (
              <mesh key={i} position={[dx, 0.34, -0.02]} rotation={[(-0.3 + (i % 2) * 0.15), 0, dx * 1.2]} castShadow>
                <coneGeometry args={[0.09, 0.36, 5]} />
                <meshStandardMaterial color={hair} flatShading roughness={0.55} />
              </mesh>
            ))}
            {/* サイドの毛 */}
            <mesh position={[-0.28, 0.05, 0]} rotation={[0, 0, 0.4]} castShadow>
              <coneGeometry args={[0.1, 0.4, 5]} />
              <meshStandardMaterial color={hair} flatShading />
            </mesh>
            <mesh position={[0.28, 0.05, 0]} rotation={[0, 0, -0.4]} castShadow>
              <coneGeometry args={[0.1, 0.4, 5]} />
              <meshStandardMaterial color={hair} flatShading />
            </mesh>
          </group>
        </group>

        {/* 楽器 */}
        {instrument === 'vocal' && (
          <group>
            {/* マイクスタンドのマイクを持つ */}
            <mesh position={[0.34, 0.78, 0.34]} rotation={[0.6, 0, -0.2]}>
              <cylinderGeometry args={[0.035, 0.05, 0.45, 8]} />
              <meshStandardMaterial color="#cfd2da" metalness={0.7} roughness={0.25} />
            </mesh>
            <mesh position={[0.27, 0.92, 0.42]}>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshStandardMaterial color="#0a0a0f" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        )}
        {(instrument === 'guitar' || instrument === 'bass') && (
          <group position={[0, 0.3, 0.26]} rotation={[0, 0, -0.45]}>
            {/* ストラップ */}
            <mesh position={[-0.05, 0.25, -0.04]} rotation={[0, 0, 1.2]}>
              <boxGeometry args={[0.7, 0.06, 0.03]} />
              <meshStandardMaterial color="#2a2a33" flatShading />
            </mesh>
            {/* ボディ（角張ったメタルギター） */}
            <mesh castShadow>
              <boxGeometry args={[0.42, 0.5, 0.08]} />
              <meshStandardMaterial color={instrument === 'bass' ? '#241640' : '#5a0d18'} flatShading metalness={0.35} roughness={0.35} />
            </mesh>
            <mesh position={[0.18, 0.28, 0]} rotation={[0, 0, 0.6]}>
              <boxGeometry args={[0.28, 0.55, 0.05]} />
              <meshStandardMaterial color={instrument === 'bass' ? '#241640' : '#5a0d18'} flatShading />
            </mesh>
            {/* ネック */}
            <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, 0.6]} castShadow>
              <boxGeometry args={[0.07, 0.8, 0.05]} />
              <meshStandardMaterial color="#3a2a18" flatShading />
            </mesh>
            {/* ヘッド */}
            <mesh position={[0.82, 0.78, 0]} rotation={[0, 0, 0.6]}>
              <boxGeometry args={[0.12, 0.2, 0.05]} />
              <meshStandardMaterial color="#1a1a22" flatShading />
            </mesh>
          </group>
        )}
        {instrument === 'keys' && (
          <mesh position={[0, 0.18, 0.32]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.8, 0.12, 0.24]} />
            <meshStandardMaterial color="#101018" flatShading metalness={0.3} />
          </mesh>
        )}
        {instrument === 'drums' && (
          <>
            <mesh position={[-0.3, 0.55, 0.32]} rotation={[0, 0, 0.6]}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
              <meshStandardMaterial color="#cdb48a" />
            </mesh>
            <mesh position={[0.3, 0.55, 0.32]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
              <meshStandardMaterial color="#cdb48a" />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
