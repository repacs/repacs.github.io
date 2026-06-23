import * as THREE from "three";
import { handleXRHitTest } from "../utils/hitTest";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createPlaneMarker } from "../objects/planeMarker";
import {
  spawnBoxes,
  updateBoxes,
  boxes,
  removeBox,
} from "../objects/boxSpawner";

export function createGameGroup(renderer, scene, camera, listener) {
  const group = new THREE.Group();

  // Platzier Logik für Mülleimer und Tisch
  const placeableGroup = new THREE.Group();
  group.add(placeableGroup);

  // Plane Marker
  const planeMarker = createPlaneMarker();
  scene.add(planeMarker);

  // GlTF Modelle laden
  let trashModel;
  let deskModel;
  const gltfLoader = new GLTFLoader();

  gltfLoader.load("/assets/models/trash.glb", (gltf) => {
    trashModel = gltf.scene.children[0];
  });

  gltfLoader.load("/assets/models/desk.glb", (gltf) => {
    deskModel = gltf.scene.children[0];
  });

  // Licht
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  group.add(ambientLight);

  // State
  let phase = "placing";
  let placedCount = 0;
  const OBJECTS_TO_PLACE = 2;

  // Referenz für den platzierten Tisch
  let deskMesh = null;

  // Variable für gehaltene Box
  let grabbedObject = null;

  // Timer für Boxen
  let spawnTimer = 0;

  // Controller
  const controller = renderer.xr.getController(0);
  scene.add(controller);

  controller.addEventListener("select", () => {
    if (!group.visible) return;

    if (phase === "placing") {
      onPlace();
    } else if (phase === "playing") {
      onPlay();
    }
  });

  controller.addEventListener("selectstart", () => {
    if (!group.visible || phase !== "playing") return;

    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    tempMatrix.extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(boxes);

    if (intersects.length > 0) {
      grabbedObject = intersects[0].object;
      controller.attach(grabbedObject);
      console.log("Box erfolgreich gegriffen.");
    }
  });

  controller.addEventListener("selectend", () => {
    if (!grabbedObject) return;

    let putInTrash = false;
    const TRASH_DISTANCE_THRESHOLD = 0.35;

    const boxWorldPos = new THREE.Vector3();
    grabbedObject.getWorldPosition(boxWorldPos);

    for (const trash of placeableGroup.children) {
      // Ignoriere den Tisch bei der Mülleimer-Überprüfung
      if (trash === deskMesh) continue;

      const trashWorldPos = new THREE.Vector3();
      trash.getWorldPosition(trashWorldPos);

      if (boxWorldPos.distanceTo(trashWorldPos) < TRASH_DISTANCE_THRESHOLD) {
        putInTrash = true;
        break;
      }
    }

    if (putInTrash) {
      console.log("Treffer! Box im Mülleimer entsorgt.");
      removeBox(grabbedObject, group);
    } else {
      console.log("Daneben! Box fliegt im Raum weiter.");
      group.attach(grabbedObject);
    }

    grabbedObject = null;
  });

  function onPlace() {
    if (!planeMarker.visible) return;

    let modelToPlace = null;

    // 1. Klick = Tisch platzieren | 2. Klick = Mülleimer platzieren
    if (placedCount === 0 && deskModel) {
      modelToPlace = deskModel.clone();
    } else if (placedCount === 1 && trashModel) {
      modelToPlace = trashModel.clone();
    }

    if (!modelToPlace) return;

    modelToPlace.position.setFromMatrixPosition(planeMarker.matrix);
    modelToPlace.rotation.y = Math.random() * (Math.PI * 2);
    modelToPlace.scale.set(0.12, 0.12, 0.12);
    modelToPlace.visible = true;

    placeableGroup.add(modelToPlace);

    if (placedCount === 0) {
      deskMesh = modelToPlace; // Tisch-Referenz merken
    }

    placedCount++;
    planeMarker.visible = false; // nach jedem Platzieren verstecken

    if (placedCount >= OBJECTS_TO_PLACE) {
      phase = "playing";
      console.log("Platzierphase vorbei! Spiel startet.");
    }
  }

  function onPlay() {
    console.log("Tap während Spielphase!");
  }

  function update(frame) {
    if (phase === "placing" && frame) {
      handleXRHitTest(
        renderer,
        frame,
        (hitPoseTransformed) => {
          planeMarker.visible = true;
          planeMarker.matrix.fromArray(hitPoseTransformed);
        },
        () => {
          planeMarker.visible = false;
        },
      );
    } else if (phase === "playing") {
      spawnTimer++;

      // Wir übergeben jetzt das deskMesh statt der camera
      if (spawnTimer >= 100) {
        spawnBoxes(deskMesh, group, listener);
        spawnTimer = 0;
      }
      updateBoxes(deskMesh, group);
    }
  }
  return { group, update, planeMarker };
}