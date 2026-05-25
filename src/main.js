import * as THREE from 'three';

import { ARButton } from 'three/addons/webxr/ARButton.js';
import { createScene } from './scene';
import { browserHasImmersiveARCompatibility } from './utils/domUtils';


function initXRGame() {
  const { devicePixelRatio, innerHeight, innerWidth } = window;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);

  renderer.xr.enabled = true;

  const arButton = ARButton.createButton(
    renderer,
    { requiredFeatures: ["hit-test"] },
  );

  document.querySelector('#ui').appendChild(arButton);

  createScene(renderer);
};

async function start() {
  const immersiveARSupported = await browserHasImmersiveARCompatibility;

  if (immersiveARSupported) {
    initXRGame();
  } else {
    console.log('Browser does not WebXR');
  }
};

start();