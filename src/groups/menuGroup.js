import * as THREE from 'three';

function createButton(position, color = 0x2255ff) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.01),
    new THREE.MeshBasicMaterial({ color })
  );

  mesh.position.copy(position);
  mesh.userData.originalColor = color;
  return mesh;
}

export function createMenuGroup(camera, renderer, callbacks) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1.2);

  const startButton = createButton(new THREE.Vector3(0,  0.3, 0), 0x2255ff);
  const infoButton  = createButton(new THREE.Vector3(0,  0.0, 0), 0x226622);
  const quitButton  = createButton(new THREE.Vector3(0, -0.3, 0), 0x882222);

  startButton.userData.onClick = callbacks.onStart;
  infoButton.userData.onClick  = callbacks.onInfo;
  quitButton.userData.onClick  = callbacks.onQuit;

  group.add(startButton);
  group.add(infoButton);
  group.add(quitButton);

  // An XR-Camera hängen damit es mit der Handy-Bewegung mitgeht
  renderer.xr.addEventListener('sessionstart', () => {
    const xrCamera = renderer.xr.getCamera();
    xrCamera.add(group);
  });

  const raycaster = new THREE.Raycaster();
  const controller = renderer.xr.getController(0);

  controller.addEventListener('select', () => {
    if (!group.visible) return;

    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();

    camera.getWorldPosition(origin);
    camera.getWorldDirection(direction);

    raycaster.set(origin, direction);

    const hits = raycaster.intersectObjects([startButton, infoButton, quitButton]);

    if (hits.length > 0) {
      const hit = hits[0].object;

      hit.material.color.set(0xffffff);
      setTimeout(() => hit.material.color.set(hit.userData.originalColor), 200);

      hit.userData.onClick?.();
    }
  });

  return group;
}