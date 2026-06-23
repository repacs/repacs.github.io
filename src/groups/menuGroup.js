import * as THREE from "three";

export function createMenuGroup(camera, renderer, callbacks) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1.2); // 1.2 Meter vor der Kamera

  const logoTexture = new THREE.TextureLoader().load("/assets/logo.png");

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.45, 0.45),
    new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0.7,
    }),
  );

  logo.position.set(0.15, -0.67, -0.1);

  const startButton = createButton("Spiel starten", new THREE.Vector3(0, 0.2, 0));
  const infoButton = createButton("Anleitung", new THREE.Vector3(0, 0.0, 0));
  const quitButton = createButton("Spiel beenden", new THREE.Vector3(0, -0.2, 0));

  // Callback am Button speichern
  startButton.userData.onClick = callbacks.onStart;
  infoButton.userData.onClick = callbacks.onInfo;
  quitButton.userData.onClick = callbacks.onQuit;

  group.add(logo);
  group.add(startButton);
  group.add(infoButton);
  group.add(quitButton);

  camera.add(group); 

  const raycaster = new THREE.Raycaster();
  const controller = renderer.xr.getController(0);

  controller.addEventListener("select", () => {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const buttons = [
      startButton,
      infoButton,
      quitButton,
    ];

    const hits = raycaster.intersectObjects(buttons);

    if (hits.length > 0) {
      hits[0].object.userData.onClick?.();
    }
  });

  return {
    group,
    buttons: [
      startButton,
      infoButton,
      quitButton,
    ]
  };
}

function createButton(label, position) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  // Hintergrund
  ctx.fillStyle = "rgba(20,20,20,0.6)";
  ctx.beginPath();
  ctx.roundRect(0, 0, 512, 128, 20);
  ctx.fill();
  // Rahmen 
  ctx.strokeStyle = "#4aa8ff";
  ctx.lineWidth = 4;
  ctx.stroke();
  // Text
  ctx.fillStyle = "white";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    label,
    canvas.width / 2,
    canvas.height / 2
  );

  const texture = new THREE.CanvasTexture(canvas);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.125), // 50 cm breit, 12.5 cm hoch
    new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
  );

  mesh.position.copy(position);
  return mesh;
}
