import * as THREE from "three";

import { ARButton } from "three/addons/webxr/ARButton.js";
import { browserHasImmersiveARCompatibility } from "./utils/domUtils";
import { createGameGroup } from "./groups/gameGroup";
import { createMenuGroup } from "./groups/menuGroup";
import { loadSounds } from "./objects/boxSpawner";

function initXR() {
  // 1. Szene erstellen
  const scene = new THREE.Scene();

  // 2. Kamera erstellen (PerspectiveCamera wird für 3D-Szenen empfohlen)
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.02,
    20,
  );
  scene.add(camera);

  // Audio Listener (räumliches Audio) wird an die Kamera gehangen
  const listener = new THREE.AudioListener();
  camera.add(listener);
  loadSounds();

  // 3. Renderer erstellen und XR aktivieren
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // WICHTIG: XR-Unterstützung im Renderer einschalten
  renderer.xr.enabled = true;

  // 4. Start AR-Button zum Interface hinzufügen
  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"],
  });
  document.querySelector("#ui").appendChild(arButton);

  // 5. Steuerung von Groups, Szenenmanagement
  const {
    group: menuGroup,
    buttons: menuButtons,
  } = createMenuGroup(camera, renderer, {
    onStart: () => {
      console.log("Starte Spiel!");
      switchTo("game");
    },
    onInfo: () => console.log("Info lol"),
    onQuit: () => {
      console.log("Beende Spiel!");
      renderer.xr.getSession().end(); // Session beenden
    },
  });

  menuButtons.forEach(button => {
    button.userData.baseY = button.position.y;
  });

  const {
    group: gameGroup,
    update: updateGame,
    planeMarker,
  } = createGameGroup(renderer, scene, camera, listener);

  console.log(menuGroup.parent);
  scene.add(gameGroup);

  // Start: nur Menü sichtbar
  gameGroup.visible = false;
  planeMarker.visible = false;

  function switchTo(state) {
    menuGroup.visible = state === "menu";
    gameGroup.visible = state === "game";

    if (state === "menu") {
      planeMarker.visible = false;
    }
  }

  renderer.xr.addEventListener("sessionend", () => {
    switchTo("menu"); // zurück zum Menü wenn Session endet
  });

  // Controller enthält alle Controller-Informationen (Position, Rotation etc.) in Matrix
  // Controller Zeug ist gerade in den Groups

  function renderLoop(timestamp, frame) {
     const t = timestamp * 0.001;

      menuButtons.forEach((button, index) => {
        button.position.y = button.userData.baseY + Math.sin(t * 2 + index) * 0.015;
        button.rotation.z = Math.sin(t * 1.5 + index) * 0.03;
      });

    if (gameGroup.visible) {
      updateGame(frame); // nur updaten wenn gameGroup aktiv ist
    }
    renderer.render(scene, camera);
  }

  // 6. Den Animation-Loop starten
  renderer.setAnimationLoop(renderLoop);
}

async function start() {
  const immersiveARSupported = await browserHasImmersiveARCompatibility;

  if (immersiveARSupported) {
    initXR();
  } else {
    console.log("Browser does not WebXR");
  }
}

start(); // Spiel startet, wenn Browser XR kompatibel ist
