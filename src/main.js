import * as THREE from 'three';

import { ARButton } from 'three/addons/webxr/ARButton.js';
import { browserHasImmersiveARCompatibility } from './utils/domUtils';
import { createGameGroup } from './groups/gameGroup';
import { createMenuGroup } from './groups/menuGroup';

function initXR() {
  // 1. Szene erstellen
  const scene = new THREE.Scene();

  // 2. Kamera erstellen (PerspectiveCamera wird für 3D-Szenen empfohlen)
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.02, 20);
  scene.add(camera);

  // 3. Renderer erstellen und XR aktivieren
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // WICHTIG: XR-Unterstützung im Renderer einschalten
  renderer.xr.enabled = true;

  // 4. Start AR-Button zum Interface hinzufügen
  const arButton = ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] });
  document.querySelector('#ui').appendChild(arButton);

  // 5. Steuerung von Groups, Szenenmanagement 
  const menuGroup = createMenuGroup(camera, renderer, {
    onStart: () => {
      console.log('Starte Spiel!')
      switchTo('game')
    },
    onInfo: () => console.log('Info lol'),
    onQuit: () => {
      console.log('Beende Spiel!'),
      renderer.xr.getSession().end(); // Session beenden
    } 
  });

  const { group: gameGroup, box } = createGameGroup();

  scene.add(menuGroup);
  scene.add(gameGroup);

  // Start: nur Menü sichtbar
  gameGroup.visible = false;

  function switchTo(state) {
    menuGroup.visible = state === 'menu';
    gameGroup.visible = state === 'game';
  }

  renderer.xr.addEventListener('sessionend', () => {
    switchTo('menu'); // zurück zum Menü wenn Session endet 
  });
  
  // Controller enthält alle Controller-Informationen (Position, Rotation etc.) in Matrix
  // Controller Zeug ist gerade in den Groups

  // function renderLoop(timestamp, frame) {
  //   box.rotation.y += 0.01;
  //   renderer.render(scene, camera);
  // }

  function renderLoop(timestamp, frame) {
    // Rotate box
    box.rotation.y += 0.01;

    if (renderer.xr.isPresenting) {

      if (frame) {
        handleXRHitTest(renderer, frame, (hitPoseTransformed) => {
          if (hitPoseTransformed) {
            planeMarker.visible = true;
            planeMarker.matrix.fromArray(hitPoseTransformed);
          }
        }, () => {
          planeMarker.visible = false;
        })
      }
      renderer.render(scene, camera);    
    }
  }

  // 6. Den Animation-Loop starten
  renderer.setAnimationLoop(renderLoop);
};

async function start() {
  const immersiveARSupported = await browserHasImmersiveARCompatibility;

  if (immersiveARSupported) {
    initXR();
  } else {
    console.log('Browser does not WebXR');
  }
};

start(); // Spiel startet, wenn Browser XR kompatibel ist