import React from 'react';
import { useSceneStore } from '../stores/sceneStore';

export const SceneControls: React.FC = () => {
  const {
    position,
    rotation,
    scale,
    pointSize,
    opacity,
    scaleVariance,
    setPosition,
    setRotation,
    setScale,
    setPointSize,
    setOpacity,
    setScaleVariance
  } = useSceneStore();

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '8px',
      color: 'white',
    }}>
      <h3>Scene Controls</h3>
      
      <div>
        <label>Point Size:</label>
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={pointSize}
          onChange={(e) => setPointSize(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label>Opacity:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label>Scale Variance:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={scaleVariance}
          onChange={(e) => setScaleVariance(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <h4>Position</h4>
        <div>
          <label>X:</label>
          <input
            type="number"
            value={position.x}
            onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Y:</label>
          <input
            type="number"
            value={position.y}
            onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Z:</label>
          <input
            type="number"
            value={position.z}
            onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <h4>Rotation</h4>
        <div>
          <label>X:</label>
          <input
            type="range"
            min="0"
            max="6.28"
            step="0.01"
            value={rotation.x}
            onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Y:</label>
          <input
            type="range"
            min="0"
            max="6.28"
            step="0.01"
            value={rotation.y}
            onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Z:</label>
          <input
            type="range"
            min="0"
            max="6.28"
            step="0.01"
            value={rotation.z}
            onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <h4>Scale</h4>
        <div>
          <label>X:</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={scale.x}
            onChange={(e) => setScale({ ...scale, x: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Y:</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={scale.y}
            onChange={(e) => setScale({ ...scale, y: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Z:</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={scale.z}
            onChange={(e) => setScale({ ...scale, z: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};
