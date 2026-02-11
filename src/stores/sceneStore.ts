import { create } from 'zustand';

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

type SceneState = {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  pointSize: number;
  opacity: number;
  scaleVariance: number;
  setPosition: (position: Vector3) => void;
  setRotation: (rotation: Vector3) => void;
  setScale: (scale: Vector3) => void;
  setPointSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
  setScaleVariance: (variance: number) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  pointSize: 0.1,
  opacity: 1,
  scaleVariance: 0,
  
  setPosition: (position) => set({ position }),
  setRotation: (rotation) => set({ rotation }),
  setScale: (scale) => set({ scale }),
  setPointSize: (pointSize) => set({ pointSize }),
  setOpacity: (opacity) => set({ opacity }),
  setScaleVariance: (scaleVariance) => set({ scaleVariance }),
}));
