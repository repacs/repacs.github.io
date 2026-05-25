import * as THREE from 'three';

export function createScene(renderer) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    70, 
    window.innerWidth / window.innerHeight, 
    0.02, // render objects 0.02 - 20 meters
    20,
  );

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.z = -3;

  scene.add(box);

  function renderLoop(timestamp, frame) {
    // Rotate box
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    if (renderer.xr.isPresenting) {
      renderer.render(scene, camera);    
    }
  };

  renderer.setAnimationLoop(renderLoop);
};