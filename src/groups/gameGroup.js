import * as THREE from 'three';
import { handleXRHitTest } from '../utils/hitTest';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createPlaneMarker } from '../objects/planeMarker';


export function createGameGroup(renderer, scene) {
  const group = new THREE.Group();

  // Platzier Logik für Mülleimer und Tisch
  const placeableGroup = new THREE.Group();
  group.add(placeableGroup);

  // Plane Marker
  const planeMarker = createPlaneMarker();
  scene.add(planeMarker);


  // GlTF Model
  let trashModel;
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/assets/models/trash.glb', (gltf) => {
    trashModel = gltf.scene.children[0];
  });

  // Licht
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  group.add(ambientLight);

  // State
  let phase = 'placing';
  let placedCount = 0;
  const OBJECTS_TO_PLACE = 2;

  // Controller
  const controller = renderer.xr.getController(0);
  scene.add(controller);

  controller.addEventListener('select', () => {
    if (!group.visible) return;

    if (phase === 'placing') {
      onPlace();
    } else if (phase === 'playing') {
      onPlay();
    }
  });

  function onPlace() {
    if (!planeMarker.visible || !trashModel) return;

    const model = trashModel.clone();
    model.position.setFromMatrixPosition(planeMarker.matrix);
    model.rotation.y = Math.random() * (Math.PI * 2);
    model.scale.set(0.12, 0.12, 0.12);
    model.visible = true;

    placeableGroup.add(model);
    placedCount++;

    planeMarker.visible = false; // nach jedem Platzieren verstecken

    if (placedCount >= OBJECTS_TO_PLACE) {
      phase = 'playing';
      console.log('Platzierphase vorbei!');
    }
  }

  function onPlay() {
    // spätere Spiellogik hier
    console.log('Tap während Spielphase!');
  }

  function update(frame) {
    if (phase === 'placing' && frame) {
      handleXRHitTest(renderer, frame, (hitPoseTransformed) => {
        planeMarker.visible = true;
        planeMarker.matrix.fromArray(hitPoseTransformed);
      }, () => {
        planeMarker.visible = false;
      });
    }
  }
  return { group, update, planeMarker };
}
