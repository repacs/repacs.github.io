import * as THREE from 'three';
import { handleXRHitTest } from '../utils/hitTest';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createRedBox } from '../objects/redBox';
import { createPlaneMarker } from '../objects/planeMarker';


export function createGameGroup(renderer, scene) {
  const group = new THREE.Group();

  // Platzier Logik für Mülleimer und Tisch
  const placeableGroup = new THREE.Group();
  group.add(placeableGroup);

  // Plane Marker
  const planeMarker = createPlaneMarker();
  group.add(planeMarker);


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

    placeableGroup.add(model); // in placeableGroup, nicht scene
    placedCount++;

    if (placedCount >= OBJECTS_TO_PLACE) {
      // Platzierphase vorbei
      phase = 'playing';
      planeMarker.visible = false;
      console.log('Platzierphase vorbei, Spiel startet!');
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

  // const box = new THREE.Mesh(
  //   new THREE.BoxGeometry(0.1, 0.1, 0.1), // 10 cm Würfel
  //   new THREE.MeshStandardMaterial({ color: 0xff0000 })
  // );
  // box.position.set(0, 0, -0.5); // 50 cm vor den Nutzer platzieren
  // group.add(box);
  
  return { group, update };
}

// const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(
//   70, 
//   window.innerWidth / window.innerHeight, 
//   0.02, // render objects 0.02 - 20 meters
//   20,
// );

// const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const box = new THREE.Mesh(boxGeometry, boxMaterial);
// box.position.z = -3;

// scene.add(box);

// const planeMarker = createPlaneMarker();

// scene.add(planeMarker);

// const controller = renderer.xr.getController(0);
// scene.add(controller);

// controller.addEventListener('select', onSelect);

  // function onSelect() {
  //   if (planeMarker.visible) {
  //     const model = trashModel.clone();

  //     model.position.setFromMatrixPosition(planeMarker.matrix);
      
  //     // random rotation
  //     model.rotation.y = Math.random() * (Math.PI * 2);
  //     model.visible = true;

  //     model.scale.set(0.12, 0.12, 0.12);

  //     scene.add(model);
  //   }
  // };

  // const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  // scene.add(ambientLight);

  // function renderLoop(timestamp, frame) {
  //   // Rotate box
  //   box.rotation.x += 0.01;
  //   box.rotation.y += 0.01;

  //   if (renderer.xr.isPresenting) {

  //     if (frame) {
  //       handleXRHitTest(renderer, frame, (hitPoseTransformed) => {
  //         if (hitPoseTransformed) {
  //           planeMarker.visible = true;
  //           planeMarker.matrix.fromArray(hitPoseTransformed);
  //         }
  //       }, () => {
  //         planeMarker.visible = false;
  //       })
  //     }
  //     renderer.render(scene, camera);    
  //   }
  // };

  // renderer.setAnimationLoop(renderLoop);


