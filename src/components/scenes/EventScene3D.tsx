import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { SceneKind } from '../../types';
import { Metalhead } from '../../three/Metalhead';
import { EmojiSprite, FloatingEmojis } from '../../three/sprites';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

/** 色付き首振りスポット＋光円錐（モーダル用の小型版）。 */
function MiniSpot({ x, color, phase }: { x: number; color: string; phase: number }) {
  const light = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);
  const cone = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const tx = Math.sin(t * 0.6 + phase) * 1.5;
    if (target.current) target.current.position.set(tx, 0.4, 1);
    if (light.current && target.current) light.current.target = target.current;
    if (cone.current) {
      cone.current.rotation.z = -Math.atan2(tx - x, 4);
      (cone.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(t * 2 + phase) * 0.03;
    }
  });
  return (
    <group>
      <spotLight ref={light} position={[x, 5, 1]} angle={0.4} penumbra={0.7} intensity={70} distance={16} color={color} />
      <object3D ref={target} position={[0, 0.4, 1]} />
      <mesh ref={cone} position={[x, 2.6, 1]}>
        <coneGeometry args={[1, 5, 20, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MiniCrowd({ count = 10 }: { count?: number }) {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: -3 + (i % 10) * 0.66 + (Math.random() - 0.5) * 0.2,
        z: 2.2 + Math.floor(i / 10) * 0.8,
        phase: Math.random() * Math.PI * 2,
        h: 0.7 + Math.random() * 0.4,
      })),
    [count],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    data.forEach((d, i) => {
      const bob = Math.sin(t * 5 + d.phase) * 0.07;
      dummy.position.set(d.x, d.h / 2 + bob, d.z);
      dummy.scale.set(0.3, d.h, 0.3);
      dummy.updateMatrix();
      bodies.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(d.x, d.h + 0.12 + bob, d.z);
      dummy.scale.set(0.32, 0.32, 0.32);
      dummy.updateMatrix();
      heads.current?.setMatrixAt(i, dummy.matrix);
    });
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#08080f" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, count]}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#0b0b14" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

const BAND_LOOK: { hair: string; instrument: 'guitar' | 'vocal' | 'bass' }[] = [
  { hair: '#9b5cff', instrument: 'guitar' },
  { hair: '#d11a35', instrument: 'vocal' },
  { hair: '#2bb6a8', instrument: 'bass' },
];

function MiniStage({ crowd, colors, pyro }: { crowd: number; colors: [string, string]; pyro?: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#0b0b12" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.5, -2.6]}>
        <planeGeometry args={[16, 7]} />
        <meshStandardMaterial color="#0a0a12" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.12]} />
        <meshBasicMaterial color="#ff2238" toneMapped={false} />
      </mesh>

      <MiniSpot x={-1.8} color={colors[0]} phase={0} />
      <MiniSpot x={1.8} color={colors[1]} phase={2.1} />

      <pointLight position={[0, 2.2, 3]} intensity={14} distance={12} color="#ffe7cf" />

      <group position={[0, 0, -0.4]} scale={0.85}>
        {BAND_LOOK.map((b, i) => (
          <Metalhead key={i} position={[(i - 1) * 1.5, 0, i === 1 ? 0.3 : -0.2]} hair={b.hair} instrument={b.instrument} phase={i * 0.6} />
        ))}
      </group>

      <MiniCrowd count={crowd} />

      {pyro && (
        <>
          {[-2, 0, 2].map((x, i) => (
            <Pyro key={x} x={x} delay={i * 0.5} />
          ))}
          <FloatingEmojis emoji="🎉" count={10} spread={5} baseY={0} topY={5} speed={0.5} scale={0.5} />
        </>
      )}
    </group>
  );
}

function Pyro({ x, delay }: { x: number; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime + delay) % 2;
    const a = Math.max(0, Math.sin(t * Math.PI));
    ref.current.scale.y = a * 2.2;
    ref.current.position.y = a * 1.1;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = a;
  });
  return (
    <mesh ref={ref} position={[x, 0, -0.5]}>
      <cylinderGeometry args={[0.08, 0.02, 2, 6]} />
      <meshBasicMaterial color="#ffb13b" transparent toneMapped={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function Flames() {
  const group = useRef<THREE.Group>(null);
  const flames = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ x: -3 + i * 0.75, phase: i * 0.4 })), []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((m, i) => {
      const s = 0.7 + Math.sin(t * 6 + flames[i].phase) * 0.3;
      m.scale.set(1, s, 1);
    });
  });
  return (
    <group ref={group} position={[0, 0, 1.4]}>
      {flames.map((f, i) => (
        <mesh key={i} position={[f.x, 0.5, 0]}>
          <coneGeometry args={[0.3, 1.2, 6]} />
          <meshBasicMaterial color={i % 2 ? '#ff7a1a' : '#ff2a1a'} toneMapped={false} transparent opacity={0.95} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function Equalizer() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((m, i) => {
      const h = 0.3 + (Math.sin(t * 5 + i) * 0.5 + 0.5) * 1.6;
      m.scale.y = h;
      m.position.y = h / 2;
    });
  });
  const colors = ['#ff2238', '#e8b339', '#2bd6c4'];
  return (
    <group ref={ref} position={[1.4, 0, -0.5]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[i * 0.28 - 0.7, 0.5, 0]}>
          <boxGeometry args={[0.18, 1, 0.18]} />
          <meshStandardMaterial color={colors[i % 3]} emissive={colors[i % 3]} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Flashes() {
  const ref = useRef<THREE.Group>(null);
  const spots = useMemo(() => [[-2.5, 2.3], [2.5, 1.8], [0, 2.6], [-1.5, 1.2], [1.8, 2.5]] as [number, number][], []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((m, i) => {
      const a = Math.max(0, Math.sin(t * 4 + i * 1.3));
      (m as THREE.Mesh).scale.setScalar(0.1 + a * 0.3);
      ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = a;
    });
  });
  return (
    <group ref={ref}>
      {spots.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 1]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function Floor({ color = '#0c0c14' }: { color?: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[30, 20]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Amp({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.1, 1, 0.7]} />
      <meshStandardMaterial color="#15151c" flatShading roughness={0.8} />
    </mesh>
  );
}

function Diorama({ kind }: { kind: SceneKind }) {
  switch (kind) {
    case 'livehouse':
      return <MiniStage crowd={8} colors={['#ff2238', '#9b5cff']} />;
    case 'tour':
      return <MiniStage crowd={12} colors={['#ff2238', '#e8b339']} />;
    case 'festival':
      return <MiniStage crowd={16} colors={['#ff2238', '#2bd6c4']} />;
    case 'arena':
      return <MiniStage crowd={16} colors={['#9b5cff', '#5aa0ff']} pyro />;
    case 'overseas':
      return <MiniStage crowd={14} colors={['#5aa0ff', '#e8b339']} />;
    case 'goal':
      return <MiniStage crowd={18} colors={['#ff2238', '#e8b339']} pyro />;

    case 'street':
      return (
        <group>
          <Floor color="#101018" />
          {/* 街灯 */}
          <mesh position={[-2.4, 1.4, -0.5]}>
            <cylinderGeometry args={[0.06, 0.06, 2.8, 6]} />
            <meshStandardMaterial color="#2a2a33" />
          </mesh>
          <mesh position={[-2.4, 2.8, -0.5]}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshBasicMaterial color="#ffd98a" toneMapped={false} />
          </mesh>
          <pointLight position={[-2.4, 2.6, 0]} intensity={18} distance={9} color="#ffd98a" />
          <Metalhead position={[0.2, 0, 0]} hair="#d11a35" instrument="guitar" />
          <FloatingEmojis emoji="🎵" count={7} spread={3.5} baseY={0.5} topY={3.5} speed={0.4} scale={0.5} />
        </group>
      );

    case 'studio':
      return (
        <group>
          <Floor />
          <mesh position={[0, 1.6, -2.2]}>
            <planeGeometry args={[12, 5]} />
            <meshStandardMaterial color="#0e0f17" roughness={1} />
          </mesh>
          <Amp position={[-1.8, 0.5, -0.6]} />
          <Equalizer />
          <Metalhead position={[-0.2, 0, 0]} hair="#9b5cff" instrument="guitar" />
        </group>
      );

    case 'sns':
      return (
        <group>
          <Floor color="#0b0d16" />
          {/* スマホ */}
          <group position={[0, 1.6, -0.2]}>
            <mesh>
              <boxGeometry args={[1.6, 2.8, 0.18]} />
              <meshStandardMaterial color="#15151f" flatShading metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.1, 0.11]}>
              <planeGeometry args={[1.3, 2.2]} />
              <meshBasicMaterial color="#0a1230" toneMapped={false} />
            </mesh>
            <EmojiSprite emoji="📱" position={[0, 0.1, 0.2]} scale={1} />
          </group>
          <pointLight position={[0, 2, 2]} intensity={12} distance={10} color="#4fd6ff" />
          <FloatingEmojis emoji="❤️" count={10} spread={4} baseY={-0.5} topY={4} speed={0.5} scale={0.6} />
        </group>
      );

    case 'flame':
      return (
        <group>
          <Floor color="#160707" />
          <ambientLight intensity={0.2} color="#ff5a2a" />
          <Metalhead position={[0, 0, 0.2]} hair="#d11a35" instrument="vocal" headbang={false} />
          <EmojiSprite emoji="💦" position={[0.7, 2.3, 0.4]} scale={0.6} />
          <Flames />
          <FloatingEmojis emoji="🔥" count={8} spread={4.5} baseY={0} topY={4} speed={0.6} scale={0.6} />
          <pointLight position={[0, 1, 2]} intensity={18} distance={10} color="#ff5a2a" />
        </group>
      );

    case 'member':
      return (
        <group>
          <Floor />
          <SwayGroup dir={1}>
            <Metalhead position={[-1.2, 0, 0]} hair="#9b5cff" instrument="guitar" headbang={false} />
          </SwayGroup>
          <SwayGroup dir={-1}>
            <group rotation={[0, Math.PI, 0]}>
              <Metalhead position={[1.2, 0, 0]} hair="#e8b339" instrument="bass" headbang={false} />
            </group>
          </SwayGroup>
          <EmojiSprite emoji="⚡" position={[0, 2.2, 0.5]} scale={1} />
        </group>
      );

    case 'trouble':
      return (
        <group>
          <Floor />
          <Amp position={[0, 0.6, -0.3]} />
          <Sparks />
          <EmojiSprite emoji="💨" position={[0, 1.8, 0.2]} scale={0.8} />
          <FloatingEmojis emoji="💸" count={7} spread={4} baseY={0} topY={3.5} speed={0.5} scale={0.6} />
          <pointLight position={[0, 1.5, 2]} intensity={10} distance={9} color="#ffd24a" />
        </group>
      );

    case 'tv':
      return (
        <group>
          <Floor color="#0b0d16" />
          <group position={[0, 1.7, -0.3]}>
            <mesh>
              <boxGeometry args={[3.2, 2.2, 0.4]} />
              <meshStandardMaterial color="#15151f" flatShading metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.21]}>
              <planeGeometry args={[2.8, 1.8]} />
              <meshBasicMaterial color="#0a1430" toneMapped={false} />
            </mesh>
            <mesh position={[1.0, 0.7, 0.23]}>
              <boxGeometry args={[0.7, 0.3, 0.02]} />
              <meshBasicMaterial color="#c01122" toneMapped={false} />
            </mesh>
          </group>
          <group scale={0.6} position={[0, 0.7, 0]}>
            <Metalhead position={[0, 0, 0]} hair="#d11a35" instrument="vocal" />
          </group>
          <pointLight position={[0, 2, 3]} intensity={10} distance={10} color="#5aa0ff" />
        </group>
      );

    case 'press':
      return (
        <group>
          <Floor />
          <mesh position={[-0.6, 0.5, 0]} rotation={[-Math.PI / 2.2, 0, -0.2]}>
            <boxGeometry args={[1.2, 1.6, 0.06]} />
            <meshStandardMaterial color="#1a1a22" flatShading />
          </mesh>
          <mesh position={[0.8, 0.5, 0.2]} rotation={[-Math.PI / 2.2, 0, 0.2]}>
            <boxGeometry args={[1.2, 1.6, 0.06]} />
            <meshStandardMaterial color="#20202b" flatShading />
          </mesh>
          <EmojiSprite emoji="📷" position={[0, 2.4, 1]} scale={0.8} />
          <Flashes />
        </group>
      );

    case 'fans':
      return (
        <group>
          <Floor color="#0c0a14" />
          <Metalhead position={[0, 0, 0]} hair="#d11a35" instrument="vocal" />
          <MiniCrowd count={8} />
          <FloatingEmojis emoji="❤️" count={10} spread={4.5} baseY={0} topY={4} speed={0.5} scale={0.6} />
          <pointLight position={[0, 2, 3]} intensity={12} distance={10} color="#ff3b5c" />
        </group>
      );

    case 'contract':
      return (
        <group>
          <Floor color="#0d0f10" />
          {/* 怪しい男（黒髪・無表情の代用） */}
          <Metalhead position={[0, 0, 0]} hair="#15151a" instrument="vocal" headbang={false} />
          <mesh position={[0.7, 0.4, 0.4]}>
            <boxGeometry args={[0.5, 0.35, 0.15]} />
            <meshStandardMaterial color="#3a2a16" flatShading />
          </mesh>
          <FloatingEmojis emoji="💵" count={8} spread={4} baseY={0} topY={3.5} speed={0.5} scale={0.6} />
          <pointLight position={[0, 2, 3]} intensity={8} distance={9} color="#9ad14f" />
        </group>
      );
  }
}

function SwayGroup({ dir, children }: { dir: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = Math.sin(clock.elapsedTime * 1.4) * 0.12 * dir;
  });
  return <group ref={ref}>{children}</group>;
}

function Sparks() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((m, i) => {
      const a = Math.max(0, Math.sin(t * 8 + i));
      ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = a;
    });
  });
  return (
    <group ref={ref} position={[0, 1.2, 0]}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.3]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#ffd24a" transparent toneMapped={false} blending={THREE.AdditiveBlending} />
          </mesh>
        );
      })}
    </group>
  );
}

function CamSway() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.3) * 0.4;
    camera.position.y = 1.8 + Math.sin(t * 0.5) * 0.07;
    camera.position.z = 5;
    camera.lookAt(0, 1.15, -0.2);
  });
  return null;
}

export function EventScene3D({ kind }: { kind: SceneKind }) {
  return (
    <Canvas
      dpr={isMobile ? [1, 1.4] : [1, 2]}
      camera={{ position: [0, 1.8, 5], fov: 46 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <color attach="background" args={['#06060e']} />
      <fog attach="fog" args={['#06060e', 9, 26]} />
      <ambientLight intensity={0.5} color="#5a5a7a" />
      <hemisphereLight intensity={0.4} color="#4a4a77" groundColor="#05050a" />
      <directionalLight position={[3, 6, 5]} intensity={0.95} color="#ffe8c8" />
      {/* 主役を見せるフロントフィル */}
      <pointLight position={[0, 2.4, 4]} intensity={26} distance={14} color="#ffe7cf" />
      <Diorama kind={kind} />
      <CamSway />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.0} luminanceThreshold={0.45} luminanceSmoothing={0.85} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.22} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
