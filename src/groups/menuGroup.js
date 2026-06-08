import * as THREE from 'three';

export function createMenuGroup(camera, onStart) {
  const group = THREE.Group();
  group.position.set(0, 0, -1.2); // 1.2 Meter vor der Kamera

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = 'white';
  ctx.font = '48px serif';
  ctx.fillText('Test Test test', 50, 80);
  
  const texture = new THREE.CanvasTexture(canvas);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.125), // 50 cm breit, 12.5 cm hoch        
    new THREE.MeshBasicMaterial({ map: texture })
  );

  group.add(mesh);
  camera.add(group);

  return group;
}