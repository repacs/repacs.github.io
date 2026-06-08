// import * as THREE from 'three';
// import { createPlaneMarker } from './objects/planeMarker';
// import { handleXRHitTest } from './utils/hitTest';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// let trashModel;

// const gltfLoader = new GLTFLoader();

// gltfLoader.load('/assets/models/trash.glb', (gltf) => {
//   trashModel = gltf.scene.children[0];
// });

// export function createScene(renderer) {
//   const scene = new THREE.Scene();

//   const camera = new THREE.PerspectiveCamera(
//     70, 
//     window.innerWidth / window.innerHeight, 
//     0.02, // render objects 0.02 - 20 meters
//     20,
//   );

//   const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
//   const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//   const box = new THREE.Mesh(boxGeometry, boxMaterial);
//   box.position.z = -3;

//   scene.add(box);

//   const planeMarker = createPlaneMarker();

//   scene.add(planeMarker);

//   const controller = renderer.xr.getController(0);
//   scene.add(controller);

//   controller.addEventListener('select', onSelect);

//   function onSelect() {
//     if (planeMarker.visible) {
//       const model = trashModel.clone();

//       model.position.setFromMatrixPosition(planeMarker.matrix);
      
//       // random rotation
//       model.rotation.y = Math.random() * (Math.PI * 2);
//       model.visible = true;

//       model.scale.set(0.12, 0.12, 0.12);

//       scene.add(model);
//     }
//   };

//   const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
//   scene.add(ambientLight);

//   function renderLoop(timestamp, frame) {
//     // Rotate box
//     box.rotation.x += 0.01;
//     box.rotation.y += 0.01;

//     if (renderer.xr.isPresenting) {

//       if (frame) {
//         handleXRHitTest(renderer, frame, (hitPoseTransformed) => {
//           if (hitPoseTransformed) {
//             planeMarker.visible = true;
//             planeMarker.matrix.fromArray(hitPoseTransformed);
//           }
//         }, () => {
//           planeMarker.visible = false;
//         })
//       }
//       renderer.render(scene, camera);    
//     }
//   };


//   renderer.setAnimationLoop(renderLoop);
// };