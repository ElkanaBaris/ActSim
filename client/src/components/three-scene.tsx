import { useEffect, useRef } from 'react';
import { useThreeScene } from '@/hooks/use-three-scene';

interface ThreeSceneProps {
  cameraPosition?: { x: number; y: number; z: number };
  cameraTarget?: { x: number; y: number; z: number };
}

export default function ThreeScene({ cameraPosition, cameraTarget }: ThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initScene, setCameraPosition, startRenderLoop, isInitialized } = useThreeScene();

  useEffect(() => {
    if (canvasRef.current) {
      initScene(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      startRenderLoop();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && cameraPosition && cameraTarget) {
      setCameraPosition(cameraPosition, cameraTarget);
    }
  }, [cameraPosition, cameraTarget, isInitialized]);

  return (
    <>
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ outline: 'none' }}
      />
      {/* Tactical Grid Overlay */}
      <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none" />
    </>
  );
}
