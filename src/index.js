import * as THREE from 'three';
// Der ARButton ist ein Addon, das die Kommunikation mit WebXR vereinfacht
import { ARButton } from 'three/addons/webxr/ARButton.js';

let camera, scene, renderer;
let mesh;

init();

function init() {
    // 1. Szene erstellen
    scene = new THREE.Scene();

    // 2. Kamera erstellen (PerspectiveCamera wird für 3D-Szenen empfohlen)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // 3. Renderer erstellen und XR aktivieren
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // WICHTIG: XR-Unterstützung im Renderer einschalten
    renderer.xr.enabled = true; 
    document.body.appendChild(renderer.domElement);

    // 4. AR-Button zum Interface hinzufügen
    // Erstellt den "Start AR"-Knopf und prüft die Gerätekompatibilität
    document.body.appendChild(ARButton.createButton(renderer));

    // 5. Ein einfaches Objekt (Würfel) hinzufügen
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); // 10cm Würfel
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -0.5); // 50cm vor den Nutzer platzieren
    scene.add(mesh);

    // Licht hinzufügen, damit das Material sichtbar ist
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    //controller enthält alle Controller-Informationen (Position, Rotation etc.) in Matrix
    const controller = renderer.xr.getController(0);
    scene.add(controller);

    let grabbedObject = null;

    controller.addEventListener('selectstart', () => {
        const raycaster = new THREE.Raycaster();
        const tempMatrix = new THREE.Matrix4();
        
        tempMatrix.extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObjects([mesh]);

        if (intersects.length > 0) {
            grabbedObject = intersects[0].object;
            controller.attach(grabbedObject);
        }
    });

    controller.addEventListener('selectend', () => {
        if (grabbedObject) {
            scene.attach(grabbedObject);
            grabbedObject = null;
        }
    });


    /* Farbe des Würfels ändern
    controller.addEventListener('select', (event) => {
        const raycaster = new THREE.Raycaster();

        //tempMatrix wird zur Kopie von Controller, aber nur mit den Rotationsdaten
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.extractRotation(controller.matrixWorld);

        //Strahl vom Raycaster wird im Ursprung von Controller gesetzt
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);

        //Strahl wird in die benötigte Richtung transformiert
        raycaster.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);

        //speichert alle Objekte der Szene die Mesh haben (also hier nur Würfel)
        const intersects = raycaster.intersectObjects([mesh]);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            object.material.color.set(0x0000ff);
        }
    });*/

    // 6. Den Animation-Loop starten
    renderer.setAnimationLoop(render);
}

function render() {
    // Den Würfel leicht drehen
    mesh.rotation.y += 0.01;
    
    // Die Szene rendern
    renderer.render(scene, camera);
}