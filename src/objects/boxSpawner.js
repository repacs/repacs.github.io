import * as THREE from "three";

export const boxes = [];
const MAX_BOXES = 100;
const SPAWN_DISTANCE = 2.0;

let spawnBuffer = null;

export function loadSounds() {
  const loader = new THREE.AudioLoader();

  loader.load("/assets/sounds/mail.mp3", (buffer) => {
    spawnBuffer = buffer;
    console.log('Mail Sound geladen')
  });
}

export function spawnBoxes(targetMesh, targetGroup, listener) {
  if (!targetMesh) return;

  const targetPos = new THREE.Vector3();
  targetMesh.getWorldPosition(targetPos);

  // Spawnt Boxen in einem Radius um den Tisch herum
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

  box.position.copy(targetPos).add(randomDir);

  // Status-Daten für den Tisch-Timer vorbereiten
  box.userData = {
    reachedTarget: false,
    reachedTime: 0,
  };

  targetGroup.add(box);
  boxes.push(box);
  // playSpawnSound();
  if (spawnBuffer) {
    const sound = new THREE.PositionalAudio(listener);

    sound.setBuffer(spawnBuffer);
    sound.setRefDistance(1.5);
    sound.setVolume(0.4);

    box.add(sound);
    sound.play();
  }


  if (boxes.length > MAX_BOXES) {
    removeBox(boxes[0], targetGroup);
  }
}

export function updateBoxes(targetMesh, targetGroup) {
  if (!targetMesh) return;

  const targetPos = new THREE.Vector3();
  targetMesh.getWorldPosition(targetPos);
  const currentTime = performance.now();

  for (let i = boxes.length - 1; i >= 0; i--) {
    const box = boxes[i];

    // Wenn die Box vom Controller gegriffen ist, überspringen wir das Update hier
    if (box.parent !== targetGroup) {
      continue;
    }

    // Logik, wenn die Box den Tisch bereits erreicht hat
    if (box.userData.reachedTarget) {
      // Falls der Spieler die Box greift und woanders fallen lässt,
      // soll sie sich wieder zum Tisch bewegen (Zurücksetzen)
      if (box.position.distanceTo(targetPos) > 0.2) {
        box.userData.reachedTarget = false;
        continue;
      }

      // Prüfen, ob 5 Sekunden (5000ms) vergangen sind
      if (currentTime - box.userData.reachedTime >= 5000) {
        removeBox(box, targetGroup);
        console.log("Box hat sich nach 5 Sekunden auf dem Tisch aufgelöst.");
      }
      continue; // Keine Bewegung mehr berechnen, da sie am Tisch liegt
    }

    // Auf den Tisch zubewegen
    box.position.lerp(targetPos, 0.015);
    box.rotation.x += 0.05;
    box.rotation.y += 0.05;

    // Überprüfung, ob der Tisch erreicht wurde (Distanz-Schwellenwert ca. 10cm)
    if (box.position.distanceTo(targetPos) < 0.1) {
      box.userData.reachedTarget = true;
      box.userData.reachedTime = currentTime;
      console.log("Box liegt auf dem Tisch. 5-Sekunden-Timer gestartet.");
    }
  }
}

export function removeBox(box, targetGroup) {
  const index = boxes.indexOf(box);
  if (index > -1) {
    boxes.splice(index, 1);
  }

   // Audio stoppen
  box.traverse((obj) => {
    if (obj.isAudio) {
      obj.stop();
    }
  });

  if (box.parent) {
    box.parent.remove(box);
  }

  box.geometry.dispose();
  box.material.dispose();

}

function playSpawnSound() {
  const sound = new Audio("/assets/sounds/mail.mp3");
  sound.volume = 0.4;
  sound.play();
}