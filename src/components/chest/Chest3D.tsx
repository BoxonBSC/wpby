import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ChestTier, RewardType, REWARDS } from '@/config/chest';

interface Chest3DProps {
  tier: ChestTier;
  isOpening: boolean;
  isOpened: boolean;
  reward?: RewardType;
  onOpenComplete?: () => void;
}

export function Chest3D({ tier, isOpening, isOpened, reward, onOpenComplete }: Chest3DProps) {
  const chestRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const [lidAngle, setLidAngle] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [particles, setParticles] = useState(false);

  const rewardConfig = reward ? REWARDS[reward] : null;

  useFrame((state, delta) => {
    if (!chestRef.current || !lidRef.current) return;

    // 开箱动画
    if (isOpening && !isOpened) {
      // 震动阶段
      if (lidAngle < 0.1) {
        setShakeIntensity(prev => Math.min(prev + delta * 2, 1));
        chestRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 30) * shakeIntensity * 0.05;
        chestRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 25) * shakeIntensity * 0.03;
        
        if (shakeIntensity >= 1) {
          setLidAngle(0.1);
          setParticles(true);
        }
      } 
      // 开盖阶段
      else if (lidAngle < Math.PI * 0.7) {
        setLidAngle(prev => {
          const newAngle = prev + delta * 3;
          if (newAngle >= Math.PI * 0.7) {
            onOpenComplete?.();
          }
          return Math.min(newAngle, Math.PI * 0.7);
        });
        chestRef.current.rotation.x = 0;
        chestRef.current.rotation.z = 0;
      }
    }

    // 应用盖子角度
    lidRef.current.rotation.x = -lidAngle;

    // 悬浮动画
    if (!isOpening) {
      chestRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      chestRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={chestRef} position={[0, 0, 0]}>
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2} enabled={!isOpening}>
        {/* ========== 宝箱底座 ========== */}
        <group position={[0, -0.4, 0]}>
          {/* 主底座 */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.15, 1.2]} />
            <meshStandardMaterial 
              color={tier.metalColor} 
              metalness={0.9} 
              roughness={0.2}
            />
          </mesh>
          {/* 底座装饰边 */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[1.9, 0.08, 1.3]} />
            <meshStandardMaterial 
              color="#C9A347" 
              metalness={0.95} 
              roughness={0.1}
            />
          </mesh>
          {/* 四角宝石 */}
          {[[-0.8, 0.15, -0.5], [0.8, 0.15, -0.5], [-0.8, 0.15, 0.5], [0.8, 0.15, 0.5]].map((pos, i) => (
            <mesh key={`base-gem-${i}`} position={pos as [number, number, number]} castShadow>
              <octahedronGeometry args={[0.08]} />
              <meshStandardMaterial 
                color={tier.gemColor}
                metalness={0.4}
                roughness={0.1}
                emissive={tier.gemColor}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>

        {/* ========== 宝箱主体 ========== */}
        <group position={[0, 0, 0]}>
          {/* 主体箱身 */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.8, 1.1]} />
            <meshStandardMaterial 
              color={tier.color} 
              metalness={0.7} 
              roughness={0.3}
            />
          </mesh>

          {/* 金属边框 - 垂直 */}
          {[-0.7, 0, 0.7].map((x, i) => (
            <mesh key={`v-frame-${i}`} position={[x, 0, 0.56]} castShadow>
              <boxGeometry args={[0.1, 0.85, 0.03]} />
              <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
            </mesh>
          ))}
          {[-0.7, 0, 0.7].map((x, i) => (
            <mesh key={`v-frame-back-${i}`} position={[x, 0, -0.56]} castShadow>
              <boxGeometry args={[0.1, 0.85, 0.03]} />
              <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
            </mesh>
          ))}

          {/* 金属边框 - 水平 */}
          <mesh position={[0, 0.42, 0.56]} castShadow>
            <boxGeometry args={[1.65, 0.06, 0.03]} />
            <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.42, 0.56]} castShadow>
            <boxGeometry args={[1.65, 0.06, 0.03]} />
            <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* 侧面装饰面板 */}
          {[-0.81, 0.81].map((x, i) => (
            <mesh key={`side-panel-${i}`} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[0.9, 0.6, 0.02]} />
              <meshStandardMaterial 
                color={tier.metalColor} 
                metalness={0.85} 
                roughness={0.2}
              />
            </mesh>
          ))}

          {/* 侧面宝石装饰 */}
          {[-0.82, 0.82].map((x, i) => (
            <group key={`side-gems-${i}`}>
              <mesh position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <circleGeometry args={[0.12, 32]} />
                <meshStandardMaterial 
                  color="#C9A347"
                  metalness={0.95}
                  roughness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh position={[x > 0 ? x + 0.02 : x - 0.02, 0, 0]} castShadow>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial 
                  color={tier.gemColor}
                  metalness={0.3}
                  roughness={0.1}
                  emissive={tier.gemColor}
                  emissiveIntensity={0.5}
                />
              </mesh>
            </group>
          ))}

          {/* 前面板装饰 */}
          <mesh position={[0, 0, 0.57]} castShadow>
            <planeGeometry args={[1.3, 0.6]} />
            <meshStandardMaterial 
              color={tier.metalColor}
              metalness={0.8}
              roughness={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* 前面中心宝石座 */}
          <mesh position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.05, 32]} />
            <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.62]} castShadow>
            <dodecahedronGeometry args={[0.1]} />
            <meshStandardMaterial 
              color={tier.gemColor}
              metalness={0.3}
              roughness={0.05}
              emissive={tier.gemColor}
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* 角落铆钉 */}
          {[
            [-0.7, 0.35, 0.56], [0.7, 0.35, 0.56],
            [-0.7, -0.35, 0.56], [0.7, -0.35, 0.56],
          ].map((pos, i) => (
            <mesh key={`rivet-${i}`} position={pos as [number, number, number]} castShadow>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* ========== 宝箱盖子 ========== */}
        <group ref={lidRef} position={[0, 0.45, -0.55]}>
          <group position={[0, 0.15, 0.55]}>
            {/* 盖子底板 */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[1.65, 0.12, 1.15]} />
              <meshStandardMaterial color={tier.color} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* 盖子弧形顶部 */}
            <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.55, 0.55, 1.6, 32, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color={tier.color} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* 盖子金属装饰条 */}
            {[-0.6, 0, 0.6].map((x, i) => (
              <group key={`lid-strip-${i}`}>
                <mesh position={[x, 0.06, 0.58]} castShadow>
                  <boxGeometry args={[0.08, 0.08, 0.03]} />
                  <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
                </mesh>
                <mesh position={[x, 0.35, 0.35]} castShadow>
                  <boxGeometry args={[0.08, 0.08, 0.03]} />
                  <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
                </mesh>
                <mesh position={[x, 0.48, 0]} castShadow>
                  <boxGeometry args={[0.08, 0.08, 0.03]} />
                  <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
                </mesh>
              </group>
            ))}

            {/* 盖子顶部主宝石 */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.15, 0.08, 32]} />
              <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.62, 0]} castShadow>
              <octahedronGeometry args={[0.12]} />
              <meshStandardMaterial 
                color={tier.gemColor}
                metalness={0.3}
                roughness={0.05}
                emissive={tier.gemColor}
                emissiveIntensity={0.8}
              />
            </mesh>

            {/* 盖子前沿装饰 */}
            <mesh position={[0, 0.06, 0.58]} castShadow>
              <boxGeometry args={[1.4, 0.06, 0.04]} />
              <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* 弧形顶金属边 */}
            <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <torusGeometry args={[0.52, 0.03, 8, 32, Math.PI]} />
              <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* ========== 锁扣系统 ========== */}
        <group position={[0, 0.1, 0.6]}>
          {/* 锁扣底座 */}
          <mesh castShadow>
            <boxGeometry args={[0.25, 0.2, 0.08]} />
            <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* 锁扣环 */}
          <mesh position={[0, 0.12, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.06, 0.02, 8, 16]} />
            <meshStandardMaterial color="#C9A347" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* 锁扣钥匙孔 */}
          <mesh position={[0, -0.02, 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
          </mesh>
        </group>
      </Float>

      {/* ========== 开箱特效 ========== */}
      {particles && (
        <>
          <Sparkles
            count={150}
            scale={4}
            size={8}
            speed={3}
            color={rewardConfig?.glowColor || tier.gemColor}
          />
          <Sparkles
            count={80}
            scale={3}
            size={4}
            speed={2}
            color="#FFD700"
          />
        </>
      )}

      {/* 奖励光柱 */}
      {isOpened && reward && reward !== 'no_win' && (
        <group position={[0, 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.6, 4, 32, 1, true]} />
            <meshBasicMaterial
              color={rewardConfig?.color || '#FFD700'}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.4, 1, 4, 32, 1, true]} />
            <meshBasicMaterial
              color={rewardConfig?.color || '#FFD700'}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* 顶部光晕 */}
          <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 1.5, 32]} />
            <meshBasicMaterial
              color={rewardConfig?.color || '#FFD700'}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
