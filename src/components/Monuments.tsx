import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MONUMENTS, type MonumentKind, type MonumentSpot } from '../data/board';
import { worldPos2D } from '../three/boardLayout';

/** 巨大アンプの壁（スタック）。 */
function AmpStack() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.55 + i * 1.05, 0]} castShadow>
          <boxGeometry args={[2.2, 1, 1.1]} />
          <meshStandardMaterial color="#15151c" flatShading roughness={0.85} />
        </mesh>
      ))}
      {/* スピーカーコーン */}
      {[0, 1, 2].map((i) =>
        [-0.5, 0.5].map((dx) => (
          <mesh key={`${i}-${dx}`} position={[dx, 0.55 + i * 1.05, 0.56]}>
            <cylinderGeometry args={[0.32, 0.32, 0.08, 12]} />
            <meshStandardMaterial color="#0a0a0f" metalness={0.4} roughness={0.5} />
          </mesh>
        )),
      )}
      {/* 赤いインジケータ（発光） */}
      <mesh position={[0.9, 3.15, 0.57]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ff2a44" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** 突き立った Flying-V ギターのモニュメント。 */
function FlyingV() {
  return (
    <group rotation={[0, 0, 0.12]}>
      {/* 台座 */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.9, 0.4, 6]} />
        <meshStandardMaterial color="#1a1a22" flatShading metalness={0.4} roughness={0.5} />
      </mesh>
      {/* ネック */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[0.16, 2.6, 0.12]} />
        <meshStandardMaterial color="#2a1d12" flatShading />
      </mesh>
      {/* ヘッド */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[0.28, 0.5, 0.12]} />
        <meshStandardMaterial color="#0e0e14" flatShading />
      </mesh>
      {/* V字ボディ（2枚の板を交差） */}
      <mesh position={[0, 1.0, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.4, 1.5, 0.18]} />
        <meshStandardMaterial color="#7a0d1a" emissive="#5a0a12" emissiveIntensity={0.3} flatShading metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.4, 1.5, 0.18]} />
        <meshStandardMaterial color="#7a0d1a" emissive="#5a0a12" emissiveIntensity={0.3} flatShading metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** メタルなドクロ（ローポリ）。 */
function Skull() {
  return (
    <group position={[0, 0.1, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.5, 1.2]} />
        <meshStandardMaterial color="#1a1a22" flatShading />
      </mesh>
      {/* 頭蓋 */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#d8d4cc" flatShading roughness={0.7} />
      </mesh>
      {/* 顎 */}
      <mesh position={[0, 0.85, 0.18]} castShadow>
        <boxGeometry args={[0.7, 0.3, 0.5]} />
        <meshStandardMaterial color="#cac6bd" flatShading roughness={0.7} />
      </mesh>
      {/* 眼窩（発光） */}
      <mesh position={[-0.26, 1.4, 0.55]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshBasicMaterial color="#ff3a1a" toneMapped={false} />
      </mesh>
      <mesh position={[0.26, 1.4, 0.55]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshBasicMaterial color="#ff3a1a" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** 炎のかがり火塔（スピーカー塔＋揺れる炎）。 */
function FirePillar() {
  const flame = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const f = 0.8 + Math.sin(t * 8) * 0.18 + Math.sin(t * 13) * 0.1;
    if (flame.current) {
      flame.current.scale.set(1, f, 1);
      flame.current.position.y = 2.5 + f * 0.2;
    }
    if (light.current) light.current.intensity = 6 + f * 4;
  });
  return (
    <group>
      {/* 塔 */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.7, 2.2, 6]} />
        <meshStandardMaterial color="#15151c" flatShading metalness={0.3} roughness={0.7} />
      </mesh>
      {/* 受け皿 */}
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.6, 0.4, 0.25, 6]} />
        <meshStandardMaterial color="#22222c" flatShading metalness={0.5} />
      </mesh>
      {/* 炎 */}
      <mesh ref={flame} position={[0, 2.6, 0]}>
        <coneGeometry args={[0.45, 1.4, 7]} />
        <meshBasicMaterial color="#ff6a1a" toneMapped={false} transparent opacity={0.92} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.28, 0.9, 7]} />
        <meshBasicMaterial color="#ffd24a" toneMapped={false} transparent opacity={0.95} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight ref={light} position={[0, 2.8, 0]} distance={9} color="#ff8a3a" intensity={8} />
    </group>
  );
}

/** 大ドラム。 */
function BigDrum() {
  return (
    <group rotation={[0, 0, 0]}>
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 1.4, 16]} />
        <meshStandardMaterial color="#1a1a22" flatShading metalness={0.3} roughness={0.6} />
      </mesh>
      {/* ヘッド面 */}
      <mesh position={[0, 1.0, 0.71]}>
        <circleGeometry args={[1.1, 16]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.5} />
      </mesh>
      {/* リム */}
      <mesh position={[0, 1.0, 0.72]} rotation={[0, 0, 0]}>
        <ringGeometry args={[1.0, 1.15, 16]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* ロゴ風の発光リング */}
      <mesh position={[0, 1.0, 0.73]}>
        <ringGeometry args={[0.4, 0.5, 16]} />
        <meshBasicMaterial color="#ff2a44" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** メロイックサイン(🤘)の石像。 */
function Horns() {
  const handMat = <meshStandardMaterial color="#cfcdd6" flatShading roughness={0.6} metalness={0.2} />;
  return (
    <group>
      {/* 台座 */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.6, 1.2]} />
        <meshStandardMaterial color="#14141c" flatShading />
      </mesh>
      {/* 手のひら */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.35]} />
        {handMat}
      </mesh>
      {/* 人差し指 */}
      <mesh position={[-0.22, 2.0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.2]} />
        {handMat}
      </mesh>
      {/* 小指 */}
      <mesh position={[0.22, 2.0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.2]} />
        {handMat}
      </mesh>
      {/* 親指 */}
      <mesh position={[0.4, 1.4, 0]} rotation={[0, 0, -0.7]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.2]} />
        {handMat}
      </mesh>
    </group>
  );
}

function MonumentModel({ kind }: { kind: MonumentKind }) {
  switch (kind) {
    case 'amp_stack':
      return <AmpStack />;
    case 'flying_v':
      return <FlyingV />;
    case 'skull':
      return <Skull />;
    case 'pillar':
      return <FirePillar />;
    case 'drum':
      return <BigDrum />;
    case 'horns':
      return <Horns />;
  }
}

function MonumentInstance({ spot }: { spot: MonumentSpot }) {
  const [x, , z] = worldPos2D(spot.x, spot.y);
  return (
    <group position={[x, 0, z]} rotation={[0, spot.rot, 0]} scale={spot.scale}>
      {/* 接地影 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.1, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
      <MonumentModel kind={spot.kind} />
    </group>
  );
}

/** マップの空き地に置くメタル・モニュメント群。 */
export function Monuments() {
  const spots = useMemo(() => MONUMENTS, []);
  return (
    <group>
      {spots.map((s, i) => (
        <MonumentInstance key={i} spot={s} />
      ))}
    </group>
  );
}
