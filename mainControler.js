import * as THREE from './threejs/build/three.module.js';
import { RoomEnvironment } from './threejs/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './threejs/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './threejs/examples/jsm/libs/meshopt_decoder.module.js';


let camera, scene, renderer;
let fileSTL, filePTC;

export function initBase() {
    console.log("Hello");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });

    initA()
    initGrid();

}

export function initGrid() {
    const grid = new THREE.GridHelper(50, 10, 0xffffff, 0xffffff);
    grid.material.opacity = 0.5;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);

}

export function initA() {

    const container = document.createElement('div');
    document.body.appendChild(container);


    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    camera.position.set(0, 100, 0);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();

    const ktx2Loader = new KTX2Loader()
        .setTranscoderPath('./threejs/examples/js/libs/basis/')
        .detectSupport(renderer);

    const loader = new GLTFLoader().setPath('./threejs/examples/models/gltf/');
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('Horse.glb', function(gltf) {

        // coffeemat.glb was produced from the source scene using gltfpack:
        // gltfpack -i coffeemat/scene.gltf -o coffeemat.glb -cc -tc
        // The resulting model uses EXT_meshopt_compression (for geometry) and KHR_texture_basisu (for texture compression using ETC1S/BasisLZ)

        gltf.scene.position.y = 8;

        scene.add(gltf.scene);

        render();

    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 400;
    controls.maxDistance = 1000;
    controls.target.set(10, 90, -16);
    controls.update();

    window.addEventListener('resize', onWindowResize);

}

export function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

//

export function render() {

    renderer.render(scene, camera);

}