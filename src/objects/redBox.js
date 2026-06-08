import * as THREE from 'three';

export function createRedBox() {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.1), // 10 cm Würfel
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );

  return box;
}
