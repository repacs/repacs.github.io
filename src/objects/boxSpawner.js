import * as THREE from "three";

const boxes = [];
const MAX_BOXES = 100;
const SPAWN_DISTANCE = 2.0;

export function spawnBoxes(playerTarget, targetGroup) {
  const playerPos = new THREE.Vector3();
  playerTarget.getWorldPosition(playerPos);

  const randomDir = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  )
    .normalize()
    .multiplyScalar(SPAWN_DISTANCE);

  const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
  const material = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xffff,
  });
  const box = new THREE.Mesh(geometry, material);

  box.position.copy(playerPos).add(randomDir);

  targetGroup.add(box);
  boxes.push(box);

  if (boxes.length > MAX_BOXES) {
    removeBox(boxes[0], targetGroup);
  }
}

export function updateBoxes(playerTarget, targetGroup) {
  const playerPos = new THREE.Vector3();
  playerTarget.getWorldPosition(playerPos);

  for (let i = boxes.length - 1; i >= 0; i--) {
    const box = boxes[i];

    box.position.lerp(playerPos, 0.015); //0.015 steuert Fluggeschwindigkeit
    box.rotation.x += 0.05;
    box.rotation.y += 0.05;

    if (box.position.distanceTo(playerPos) < 0.05) {
      // Abstand Spieler zur Box
      removeBox(box, targetGroup);
      console.log("Box hat den Spieler berührt");
    }
  }
}

function removeBox(box, targetGroup) {
  const index = boxes.indexOf(box);
  if (index > -1) {
    boxes.splice(index, 1);
  }
  targetGroup.remove(box);
  box.geometry.dispose();
  box.material.dispose();
}
