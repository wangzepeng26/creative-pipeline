import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useSceneStore } from './stores/sceneStore';
import { SceneControls } from './components/SceneControls';

export const Scene: React.FC = () => {
  const {
    position,
    rotation,
    scale,
    pointSize,
    opacity,
    scaleVariance
  } = useSceneStore();

  // Generate random points for demonstration
  const points = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    return positions;
  }, []);

  // Performance optimization: Debounce updates
  useEffect(() => {
    const handleResize = () => {
      // Update renderer size
    };

    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <Points
          positions={points}
          stride={3}
          frustumCulled={false}
          position={[position.x, position.y, position.z]}
          rotation={[rotation.x, rotation.y, rotation.z]}
          scale={[scale.x, scale.y, scale.z]}
        >
          <PointMaterial
            transparent
            vertexColors
            size={pointSize}
            opacity={opacity}
            sizeAttenuation={true}
            depthWrite={false}
          />
        </Points>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Canvas>
      <SceneControls />
    </div>
  );
};

// Add base styles
const styles = `
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);