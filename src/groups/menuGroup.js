import * as THREE from 'three';

export function createMenuGroup(camera, renderer, callbacks) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1.2); // 1.2 Meter vor der Kamera
                                                                                   
  const startButton = createButton('Spiel starten', new THREE.Vector3(0, 0, 0));
  // const infoButton  = createButton('Anleitung',     new THREE.Vector3(0, 0.2, 0)); 
  // const quitButton  = createButton('Spiel beenden', new THREE.Vector3(0, -0.2, 0)); 

  // Callback am Button speichern
  startButton.userData.onClick = callbacks.onStart;
  // infoButton.userData.onClick  = callbacks.onInfo;
  // quitButton.userData.onClick  = callbacks.onQuit;

  group.add(startButton);
  // group.add(infoButton);
  // group.add(quitButton);
  camera.add(group);

  const raycaster = new THREE.Raycaster();
  const controller = renderer.xr.getController(0);

  controller.addEventListener('select', () => {
    // Weltposition der Kamera holen
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);
    
    camera.getWorldPosition(origin);
    camera.getWorldDirection(direction);
    
    raycaster.set(origin, direction);
    
    const hits = raycaster.intersectObjects([startButton]); //infoButton, quitButton
    if (hits.length > 0) {
      hits[0].object.userData.onClick?.();
    }
  });

  return group;
}

function createButton(label, position) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = 'white';
  ctx.font = '48px serif';
  ctx.fillText(label, 50, 80);

  const texture = new THREE.CanvasTexture(canvas);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.125), // 50 cm breit, 12.5 cm hoch        
    new THREE.MeshBasicMaterial({ map: texture })
  );

  mesh.position.copy(position);
  return mesh;
}