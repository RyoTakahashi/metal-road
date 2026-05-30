import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import { BOARD, BOARD_BY_ID } from '../data/board';
import type { Square } from '../types';
import { Metalhead } from '../three/Metalhead';
import { TILE, TYPE_3D, worldPos, worldPosById } from '../three/boardLayout';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

/** 絵文字を CanvasTexture 化（タイル上のアイコン用、軽量＆常にカメラ向き）。 */
function emojiTexture(emoji: string): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.font = '92px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 64, 74);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

function IconSprite({ emoji, position }: { emoji: string; position: [number, number, number] }) {
  const map = useMemo(() => emojiTexture(emoji), [emoji]);
  return (
    <sprite position={position} scale={[1.2, 1.2, 1.2]}>
      <spriteMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

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
        <cylinderGeometry args={[TILE.radius, TILE.radius * 0.9, TILE.height, 6]} />
        <meshStandardMaterial
          color={style.color}
          flatShading
          roughness={0.55}
          metalness={0.25}
          emissive={style.emissive}
          emissiveIntensity={isCurrent ? 0.7 : 0.16}
        />
      </mesh>
      {/* 天面の縁取り */}
      <mesh position={[0, TILE.height + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[TILE.radius * 0.74, TILE.radius * 0.96, 6]} />
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
            <meshStandardMaterial color="#5a0a0a" emissive="#ff2a44" emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </group>
      )}

      <IconSprite emoji={style.icon} position={[0, TILE.height + 1.0, 0]} />
    </group>
  );
}

/** 経路（タイル間のリボン）。 */
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
          mid: [(a[0] + b[0]) / 2, 0.06, (a[2] + b[2]) / 2],
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
        <mesh key={i} position={s.mid} rotation={[0, s.rot, 0]} receiveShadow>
          <boxGeometry args={[s.len, 0.08, 0.5]} />
          <meshStandardMaterial color={s.branch ? '#5a4a16' : '#23232e'} emissive={s.branch ? '#5a4a16' : '#000'} roughness={0.8} />
        </mesh>
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
    <group ref={ref} scale={0.6}>
      <Metalhead hair="#d11a35" instrument="vocal" headbang={false} />
    </group>
  );
}

function CameraRig({ id }: { id: string }) {
  const { camera } = useThree();
  const focus = useRef(new THREE.Vector3(...worldPosById(id)));
  const off = isMobile ? new THREE.Vector3(-1.5, 9, 12) : new THREE.Vector3(-1.5, 7.5, 9.5);
  useFrame(() => {
    const target = new THREE.Vector3(...worldPosById(id));
    focus.current.lerp(target, 0.08);
    const desired = new THREE.Vector3(focus.current.x + off.x, off.y, focus.current.z + off.z);
    camera.position.lerp(desired, 0.08);
    camera.lookAt(focus.current.x + 2.2, 0.6, focus.current.z);
  });
  return null;
}

function Scene({ currentSquareId, branchOptions }: BoardProps) {
  return (
    <>
      <color attach="background" args={['#070710']} />
      <fog attach="fog" args={['#070710', 14, 42]} />

      <ambientLight intensity={0.4} color="#5a5a7a" />
      <hemisphereLight intensity={0.35} color="#4a4a77" groundColor="#06060a" />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.1}
        color="#ffe8c8"
        castShadow
        shadow-mapSize-width={isMobile ? 512 : 1024}
        shadow-mapSize-height={isMobile ? 512 : 1024}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 4, 6]} intensity={20} distance={20} color="#ff7a9a" />

      {/* 奈落の床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[200, 60]} />
        <meshStandardMaterial color="#0a0a12" roughness={1} />
      </mesh>

      <Paths />
      {BOARD.map((sq) => (
        <Tile3D
          key={sq.id}
          sq={sq}
          isCurrent={sq.id === currentSquareId}
          isOption={branchOptions.includes(sq.id)}
        />
      ))}
      <Pawn3D id={currentSquareId} />
      <CameraRig id={currentSquareId} />

      <EffectComposer multisampling={0} enabled={!isMobile || true}>
        {!isMobile ? <SMAA /> : <></>}
        <Bloom intensity={0.9} luminanceThreshold={0.5} luminanceSmoothing={0.85} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </>
  );
}

interface BoardProps {
  currentSquareId: string;
  branchOptions: string[];
}

export function Board3D({ currentSquareId, branchOptions }: BoardProps) {
  const startPos = worldPosById('s0');
  const cur = BOARD_BY_ID[currentSquareId];
  return (
    <div className="board3d">
      <Canvas
        shadows
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [startPos[0] - 1.5, 7.5, 9.5], fov: 45 }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <Scene currentSquareId={currentSquareId} branchOptions={branchOptions} />
      </Canvas>

      {/* 現在地ラベル（HUD） */}
      <div className="board3d-hud">
        <span className="hud-icon">{TYPE_3D[cur.type].icon}</span>
        <span className="hud-title">{cur.title}</span>
      </div>
    </div>
  );
}
