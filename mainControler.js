import * as THREE from './threejs/build/three.module.js';
import { RoomEnvironment } from './threejs/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './threejs/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './threejs/examples/jsm/libs/meshopt_decoder.module.js';
import { STLLoader } from './threejs/examples/jsm/loaders/STLLoader.js';


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
    addShadowedLight( 1, 1, 1, 0xffffff, 1 );
    addShadowedLight( -0.5, 1, - 1, 0xffffff, 0.5 );


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 25;
    controls.maxDistance = 1000;
    controls.target.set(0, -0.25, 0);
    controls.update();
}

export function loadSTL(file){
    // Binary files
    const loader = new STLLoader();
    const material = new THREE.MeshPhongMaterial( { color: 0xAAAAAA, specular: 0x111111, shininess: 20} );

    loader.load(file, function ( geometry ) {

        const mesh = new THREE.Mesh( geometry, material );

        mesh.position.set( 0, 0, 0 );
        mesh.rotation.set(- Math.PI / 2, 0, 0 );
        mesh.scale.set( 1, 1, 1 );

        mesh.castShadow = false;
        mesh.receiveShadow = false;

        scene.add( mesh );

    } );
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

export function getCamera(){
    return camera;
}

function addShadowedLight( x, y, z, color, intensity ) {

    const directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );

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

export function loadPTS(file){
    // Binary files
    const loader = new STLLoader();
    const material = new THREE.MeshPhongMaterial( { color: 0xAAAAAA, specular: 0x111111, shininess: 20} );

    loader.load(file, function ( geometry ) {

        const mesh = new THREE.Mesh( geometry, material );

        mesh.position.set( 0, 0, 0 );
        mesh.rotation.set(- Math.PI / 2, 0, 0 );
        mesh.scale.set( 1, 1, 1 );

        mesh.castShadow = false;
        mesh.receiveShadow = false;

        scene.add( mesh );

    } );
}
