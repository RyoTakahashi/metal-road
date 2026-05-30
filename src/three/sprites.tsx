import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** 絵文字を CanvasTexture 化（軽量・常にカメラ向きのスプライト用）。 */
export function emojiTexture(emoji: string): THREE.Texture {
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

export function EmojiSprite({
  emoji,
  position,
  scale = 1,
}: {
  emoji: string;
  position: [number, number, number];
  scale?: number;
}) {
  const map = useMemo(() => emojiTexture(emoji), [emoji]);
  return (
    <sprite position={position} scale={[scale, scale, scale]}>
      <spriteMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

/** 下から上へ流れ続ける1つの絵文字。 */
function FloatingOne({
  map,
  x,
  z,
  baseY,
  topY,
  phase,
  speed,
  scale,
}: {
  map: THREE.Texture;
  x: number;
  z: number;
  baseY: number;
  topY: number;
  phase: number;
  speed: number;
  scale: number;
}) {
  const ref = useRef<THREE.Sprite>(null);
  const span = topY - baseY;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime * speed + phase) % 1;
    ref.current.position.set(x + Math.sin((t + phase) * 6) * 0.3, baseY + t * span, z);
    const o = Math.sin(t * Math.PI);
    (ref.current.material as THREE.SpriteMaterial).opacity = o;
  });
  return (
    <sprite ref={ref} scale={[scale, scale, scale]}>
      <spriteMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

/** 下から上へ漂う絵文字群（ハート・音符・火の粉など）。 */
export function FloatingEmojis({
  emoji,
  count = 8,
  spread = 4,
  baseY = -1,
  topY = 3,
  speed = 0.4,
  scale = 0.6,
  z = 0,
}: {
  emoji: string;
  count?: number;
  spread?: number;
  baseY?: number;
  topY?: number;
  speed?: number;
  scale?: number;
  z?: number;
}) {
  const map = useMemo(() => emojiTexture(emoji), [emoji]);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * spread,
        z: z + (Math.random() - 0.5) * 1.5,
        phase: i / count + Math.random() * 0.1,
        speed: speed * (0.7 + Math.random() * 0.6),
        scale: scale * (0.8 + Math.random() * 0.5),
      })),
    [count, spread, baseY, topY, speed, scale, z],
  );
  return (
    <group>
      {items.map((it, i) => (
        <FloatingOne key={i} map={map} baseY={baseY} topY={topY} {...it} />
      ))}
    </group>
  );
}
