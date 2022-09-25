import * as THREE from './threejs/build/three.module.js';
import { RoomEnvironment } from './threejs/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './threejs/examples/jsm/loaders/KTX2Loader.js';
import { PTSLoader } from './threejs/examples/jsm/loaders/PTSLoader.js';
import { MeshoptDecoder } from './threejs/examples/jsm/libs/meshopt_decoder.module.js';
import { STLLoader } from './threejs/examples/jsm/loaders/STLLoader.js';
import { GUI } from './threejs/examples/jsm/libs/lil-gui.module.min.js';
import { TransformControls } from './threejs/examples/jsm/controls/TransformControls.js';


let camera, scene, renderer;
let meshList = [];
let fileSTL, filePTC;
let points, orbit, control;
let milliseconds = 0;
let container;
let tempSelect;
const positions = [];
const point = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var cursor = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();
const geometry = new THREE.BoxGeometry(10, 10, 10);
let transformControl;
let ARC_SEGMENTS = 200;
const splines = {};

const gui = new GUI();

const params = {
    trashold: 0,
    tension: 0.5,
    centripetal: true,
    editingSTL: false,
    editingPTS: false,

};

export function initBase() {
    console.log("Hello");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    raycaster = new THREE.Raycaster();
    initGrid();
    initRender();
    initKeyBoard();
    initTControl();

    initCamera();

}

export function initGrid() {
    const grid = new THREE.GridHelper(50, 10, 0xffffff, 0xffffff);
    grid.material.opacity = 0.5;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);

}

export function initGUI() {

    gui.add(params, 'trashold', 0, 5).step(1).onChange(render);
    gui.add(params, 'tension', 0, 1).step(0.01).onChange(function (value) {

        trashold = value;
        updateSplineOutline();
        render();

    });
    gui.add(params, 'centripetal').onChange(render);
    gui.add(params, 'editingSTL').onChange(function () {
        enablingTControl(meshList[0], params.editingSTL)
    });
    gui.add(params, 'editingPTS').onChange(function () {
        enablingTControl(meshList[1], params.editingPTS)
    });
    gui.open();

}

export function initRender() {
    container = document.createElement('div');
    document.body.appendChild(container);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    camera.position.set(50, 60, -50);
    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.add(new THREE.AmbientLight(0xe5e5e5, 0.15));
    scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();
    addShadowedLight(1, 1, 1, 0xf0f0f0, 1);
    addShadowedLight(-0.5, 1, - 1, 0xf0f0f0, 0.5);

    renderer.domElement.addEventListener("mousedown", onMouseDown, false);
    renderer.domElement.addEventListener("mouseup", onMouseUp, false);
}
export function initCamera() {
    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.damping = 0.2;
    orbit.update();
    orbit.addEventListener('change', render); // use if there is no animation loop
    orbit.minDistance = 25;
    orbit.maxDistance = 150;
    orbit.target.set(0, -0.25, 0);
    orbit.update();
}
export function initTControl() {
    control = new TransformControls(camera, renderer.domElement);
    control.addEventListener('change', render);
    control.addEventListener('dragging-changed', function (event) {

        orbit.enabled = !event.value;

    });
    return control;

}
export function enablingTControl(obj, bool) {
    if (bool) {
        scene.add(control);
        control.setSize(0.6)
        control.attach(obj);
        console.log("contrlesr for STL is added")
    } else {
        scene.remove(control);
        console.log("contrler was removed")
    }
    render();
}
export function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
export function render() {

    renderer.render(scene, camera);
}
export function getCamera() {
    return camera;
}
export function addShadowedLight(x, y, z, color, intensity) {

    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
    directionalLight.castShadow = true;
    const d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.bias = - 0.002;

}
export function loadPTS(file) {
    // Binary files
    const loader = new PTSLoader();
    loader.load(file, function (geometry) {
        geometry.center();
        const vertexColors = (geometry.hasAttribute('color') === true);
        const material = new THREE.PointsMaterial({ size: 0.5, color: 0x0C2AAC });
        points = new THREE.Points(geometry, material);
        meshList[1] = points;
        filePTC = points;
        points.rotation.set(- Math.PI / 2, 0, 0);
        points.position.set(0, 10, 0);
        scene.add(points);
        console.log(points);
        render();
    });
}
export function loadSTL(file) {
    // Binary files
    const loader = new STLLoader();
    const material = new THREE.MeshPhongMaterial({ color: 0x919191, specular: 0x111111, shininess: 25 });

    loader.load(file, function (geometry) {

        const mesh = new THREE.Mesh(geometry, material);
        meshList[0] = mesh;
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(- Math.PI / 2, 0, 0);
        mesh.scale.set(1, 1, 1);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        scene.add(mesh);
        render();

    });
}
export function initKeyBoard() {
    window.addEventListener('keydown', function (event) {

        switch (event.keyCode) {

            case 49: // 1
                console.log(scene);
                break;

            case 81: // Q
                control.setSpace(control.space === 'local' ? 'world' : 'local');
                break;

            case 16: // Shift
                control.setTranslationSnap(100);
                control.setRotationSnap(THREE.MathUtils.degToRad(10));
                control.setScaleSnap(0.25);
                break;

            case 87: // W
                control.setMode('translate');
                break;

            case 69: // E
                control.setMode('rotate');
                break;

            case 82: // R
                control.setMode('scale');
                break;

            case 107: // +, =, num+
                control.setSize(control.size + 0.1);
                break;

            case 109: // -, _, num-
                control.setSize(Math.max(control.size - 0.1, 0.1));
                break;

            case 88: // X
                control.showX = !control.showX;
                break;

            case 89: // Y
                control.showY = !control.showY;
                break;

            case 90: // Z
                control.showZ = !control.showZ;
                break;

            case 32: // Spacebar
                control.enabled = !control.enabled;
                break;


        }

    });

    window.addEventListener('keyup', function (event) {

        switch (event.keyCode) {

            case 16: // Shift
                control.setTranslationSnap(null);
                control.setRotationSnap(null);
                control.setScaleSnap(null);
                break;

        }

    });
}

export function getMeshList() {
    return meshList;
}

export function raycast(e) {

    cursor.x = (e.clientX / window.innerWidth) * 2 - 1;
    cursor.y = - (e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(cursor, camera)
    var tempColor = null;

    renderer.domElement.addEventListener('click', raycaster, true);
    console.log(cursor);
    // calculate objects intersecting the picking ray

    try {
        const intersects = raycaster.intersectObjects(meshList);
        if (intersects[0].object != tempSelect) {
            tempColor = intersects[0].object.material.color;
            intersects[0].object.material.color.set(0xff0000);
            tempSelect = intersects[0].object;
        }
        console.log(intersects[0].object);

    } catch (error) {
        tempSelect = null
    }

    render();
}

export function mainTime() {
    milliseconds=milliseconds+1;

}
export function onMouseDown() {
    console.log("click ");
    milliseconds = 0;
    setInterval(mainTime, 10);
}
export function onMouseUp() {
    clearInterval(mainTime);
    if (milliseconds <= 100) {
        checkMousClick();

        console.log("click " + milliseconds);
    } if(100 < milliseconds <= 200) {
        console.log("longclick " + milliseconds);

    }else{

    }
}

export function checkMousClick() {
    var bool = true
    return bool;
}
