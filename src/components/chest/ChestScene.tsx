import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Stage } from '@react-three/drei';
import { Chest3D } from './Chest3D';
import { ChestTier, RewardType } from '@/config/chest';

interface ChestSceneProps {
  tier: ChestTier;
  isOpening: boolean;
  isOpened: boolean;
  reward?: RewardType;
  onOpenComplete?: () => void;
}

export function ChestScene({ tier, isOpening, isOpened, reward, onOpenComplete }: ChestSceneProps) {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas 
        shadows 
        camera={{ position: [0, 1.5, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 使用Stage提供专业的灯光设置 */}
        <Suspense fallback={null}>
          <Stage
            intensity={0.5}
            environment="city"
            shadows={{ type: 'contact', opacity: 0.5, blur: 2 }}
            adjustCamera={false}
          >
            <Chest3D
              tier={tier}
              isOpening={isOpening}
              isOpened={isOpened}
              reward={reward}
              onOpenComplete={onOpenComplete}
            />
          </Stage>
          
          {/* 额外的金色点光源 */}
          <pointLight position={[-3, 2, 2]} intensity={0.5} color="#C9A347" />
          <pointLight position={[3, 2, 2]} intensity={0.5} color="#C9A347" />
          <pointLight position={[0, 3, 0]} intensity={0.3} color="#FFD700" />
        </Suspense>

        {/* 控制器 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.3}
          minAzimuthAngle={-Math.PI / 5}
          maxAzimuthAngle={Math.PI / 5}
          enabled={!isOpening}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
