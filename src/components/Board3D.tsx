import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import { BOARD, BOARD_BY_ID } from '../data/board';
import type { Square } from '../types';
import { Metalhead } from '../three/Metalhead';
import { EmojiSprite } from '../three/sprites';
import { Monuments } from './Monuments';
import { TILE, TYPE_3D, worldPos, worldPosById } from '../three/boardLayout';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

/** 強調リング（現在マス・分岐候補）。 */
function PulseRing({ color, current }: { color: string; current?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const s = current ? 1 + Math.sin(t * 3) * 0.06 : 1.1 + Math.sin(t * 4) * 0.18;
    ref.current.scale.set(s, s, s);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = current ? 0.9 : 0.5 + Math.sin(t * 4) * 0.3;
    ref.current.rotation.z = t * (current ? 0.6 : -1);
  });
  return (
    <mesh ref={ref} position={[0, TILE.height + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[TILE.radius * 1.05, TILE.radius * 1.28, 6]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Tile3D({ sq, isCurrent, isOption }: { sq: Square; isCurrent: boolean; isOption: boolean }) {
  const style = TYPE_3D[sq.type];
  const [x, , z] = worldPos(sq);
  const isGoal = sq.type === 'goal';
  return (
    <group position={[x, 0, z]}>
      {/* 台座（六角柱・ローポリ） */}
      <mesh castShadow receiveShadow position={[0, TILE.height / 2, 0]}>
        <cylinderGeometry args={[TILE.radius, TILE.radius * 0.86, TILE.height, 6]} />
        <meshStandardMaterial
          color={style.color}
          flatShading
          roughness={0.4}
          metalness={0.35}
          emissive={style.emissive}
          emissiveIntensity={isCurrent ? 0.9 : 0.28}
        />
      </mesh>
      {/* 天面（少しグロッシー） */}
      <mesh position={[0, TILE.height + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[TILE.radius * 0.82, 6]} />
        <meshStandardMaterial color={style.color} metalness={0.5} roughness={0.25} emissive={style.emissive} emissiveIntensity={0.15} flatShading />
      </mesh>
      {/* 天面の発光縁取り */}
      <mesh position={[0, TILE.height + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[TILE.radius * 0.78, TILE.radius * 0.98, 6]} />
        <meshBasicMaterial color={style.emissive} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {isOption && <PulseRing color={style.emissive} />}
      {isCurrent && <PulseRing color={style.emissive} current />}

      {/* ゴールはアーチを立てる */}
      {isGoal && (
        <group>
          <mesh position={[-1.1, 1.6, 0]} castShadow>
            <boxGeometry args={[0.3, 3.2, 0.3]} />
            <meshStandardMaterial color="#1a1a22" flatShading metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[1.1, 1.6, 0]} castShadow>
            <boxGeometry args={[0.3, 3.2, 0.3]} />
            <meshStandardMaterial color="#1a1a22" flatShading metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <boxGeometry args={[2.7, 0.5, 0.4]} />
            <meshStandardMaterial color="#5a0a0a" emissive="#ff2a44" emissiveIntensity={1} toneMapped={false} />
          </mesh>
        </group>
      )}

      <EmojiSprite emoji={style.icon} position={[0, TILE.height + 1.0, 0]} scale={1.2} />
    </group>
  );
}

/** 経路（リボン＋発光する中心線）。 */
function Paths() {
  const segs = useMemo(() => {
    const out: { mid: [number, number, number]; len: number; rot: number; branch: boolean }[] = [];
    for (const sq of BOARD) {
      for (const nid of sq.next) {
        const to = BOARD_BY_ID[nid];
        if (!to) continue;
        const a = worldPos(sq);
        const b = worldPos(to);
        const dx = b[0] - a[0];
        const dz = b[2] - a[2];
        out.push({
          mid: [(a[0] + b[0]) / 2, 0.05, (a[2] + b[2]) / 2],
          len: Math.hypot(dx, dz),
          rot: -Math.atan2(dz, dx),
          branch: sq.next.length > 1,
        });
      }
    }
    return out;
  }, []);
  return (
    <group>
      {segs.map((s, i) => (
        <group key={i} position={s.mid} rotation={[0, s.rot, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[s.len, 0.08, 0.6]} />
            <meshStandardMaterial color={s.branch ? '#4a3c12' : '#1e1e28'} roughness={0.8} metalness={0.2} />
          </mesh>
          {/* 発光する中心線 */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[s.len * 0.96, 0.02, 0.06]} />
            <meshBasicMaterial color={s.branch ? '#e8b339' : '#ff2a55'} toneMapped={false} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Pawn3D({ id }: { id: string }) {
  const ref = useRef<THREE.Group>(null);
  const from = useRef(new THREE.Vector3(...worldPosById(id)));
  const to = useRef(new THREE.Vector3(...worldPosById(id)));
  const prog = useRef(1);

  useEffect(() => {
    if (ref.current) {
      from.current.copy(ref.current.position);
      from.current.y = 0;
    }
    to.current.set(...worldPosById(id));
    prog.current = 0;
  }, [id]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    prog.current = Math.min(1, prog.current + dt / 0.28);
    const p = prog.current;
    const e = p * p * (3 - 2 * p);
    ref.current.position.lerpVectors(from.current, to.current, e);
    ref.current.position.y = Math.sin(Math.PI * p) * 0.9 + TILE.height;
    ref.current.rotation.y = Math.sin(p * Math.PI) * 0.3;
  });

  return (
    <group ref={ref} scale={0.62}>
      {/* スポット風の足元グロー */}
      <pointLight position={[0, 1.4, 0.6]} intensity={6} distance={4} color="#ffd2a0" />
      <Metalhead hair="#d11a35" instrument="vocal" headbang shades />
    </group>
  );
}

function CameraRig({ id }: { id: string }) {
  const { camera } = useThree();
  const focus = useRef(new THREE.Vector3(...worldPosById(id)));
  // グリッドマップを俯瞰気味に見せる（高め＆引き）。コマ周辺を中心に追従。
  const off = isMobile ? new THREE.Vector3(0, 24, 20) : new THREE.Vector3(0, 21, 18);
  useFrame(() => {
    const target = new THREE.Vector3(...worldPosById(id));
    focus.current.lerp(target, 0.08);
    const desired = new THREE.Vector3(focus.current.x + off.x, off.y, focus.current.z + off.z);
    camera.position.lerp(desired, 0.08);
    camera.lookAt(focus.current.x, 0.4, focus.current.z);
  });
  return null;
}

/** 浮遊するダスト/光の粒（空気感）。 */
function Dust({ around }: { around: number }) {
  const ref = useRef<THREE.Points>(null);
  const N = isMobile ? 60 : 120;
  const positions = useMemo(() => {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      a[i * 3] = (Math.random() - 0.5) * 60;
      a[i * 3 + 1] = Math.random() * 8;
      a[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return a;
  }, [N]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x = around; // コマ周辺に追従
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += dt * 0.25;
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={N} />
      </bufferGeometry>
      <pointsMaterial color="#ffcf8a" size={0.06} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function Scene({ currentSquareId, branchOptions }: BoardProps) {
  const cur = BOARD_BY_ID[currentSquareId];
  const [cx] = worldPos(cur);
  return (
    <>
      <color attach="background" args={['#060610']} />
      <fog attach="fog" args={['#070713', 30, 75]} />

      <ambientLight intensity={0.35} color="#5a5a7a" />
      <hemisphereLight intensity={0.3} color="#4a4a77" groundColor="#06060a" />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.15}
        color="#ffe6c2"
        castShadow
        shadow-mapSize-width={isMobile ? 512 : 2048}
        shadow-mapSize-height={isMobile ? 512 : 2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {/* クールなリムライト（奥から） */}
      <directionalLight position={[-8, 5, -10]} intensity={0.55} color="#5a78ff" />
      <pointLight position={[cx, 4, 6]} intensity={22} distance={22} color="#ff6a8a" />

      {/* 奈落の床（うっすら反射感） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#090910" roughness={0.45} metalness={0.5} />
      </mesh>

      <Paths />
      <Monuments />
      {BOARD.map((sq) => (
        <Tile3D key={sq.id} sq={sq} isCurrent={sq.id === currentSquareId} isOption={branchOptions.includes(sq.id)} />
      ))}
      <Pawn3D id={currentSquareId} />
      <Dust around={cx} />
      <CameraRig id={currentSquareId} />

      <EffectComposer multisampling={0}>
        {!isMobile ? <SMAA /> : <></>}
        <Bloom intensity={1.15} luminanceThreshold={0.45} luminanceSmoothing={0.85} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.18} darkness={0.9} />
      </EffectComposer>
    </>
  );
}

interface BoardProps {
  currentSquareId: string;
  branchOptions: string[];
}

export function Board3D({ currentSquareId, branchOptions }: BoardProps) {
  const startPos = worldPosById(currentSquareId);
  const cur = BOARD_BY_ID[currentSquareId];
  return (
    <div className="board3d">
      <Canvas
        shadows
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [startPos[0], 21, startPos[2] + 18], fov: 45 }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
      >
        <Scene currentSquareId={currentSquareId} branchOptions={branchOptions} />
      </Canvas>

      <div className="board3d-hud">
        <span className="hud-icon">{TYPE_3D[cur.type].icon}</span>
        <span className="hud-title">{cur.title}</span>
      </div>
    </div>
  );
}
