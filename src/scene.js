import * as THREE from 'three';

export function createScene(renderer) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    70, 
    window.innerWidth / window.innerHeight, 
    0.02, 
    20,
  );

  function renderLoop(timestamp, frame) {
    if (renderer.xr.isPresenting) {
      renderer.render(scene, camera);    
    }
  };
}