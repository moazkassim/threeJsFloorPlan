//create a name space
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { GUI } from "./lil-gui.module.min";
import { OrbitControls } from "./OrbitControls";
import { Sky } from "./Sky";
import test1 from "../images/test1.jpeg";
import wall from "../images/walltest.jpg";
import white from "../images/white.jpg";
import nature from "../images/test2.jpg";
import ground from "../images/hardwood2_diffuse.jpg";

const PLAN_WIDTH = 500;
const PLAN_HEIGHT = 500;
const WALL_WIDTH = 2;
const WALL_HEIGHT = 30;
const SCALE_FACTOR = 4;
let camera, scene, renderer;
let sky, sun;
// web gl render

init();
render();
function initSky() {
  // Add Sky
  sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  sun = new THREE.Vector3();

  /// GUI

  const effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure,
  };

  function guiChanged() {
    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = effectController.turbidity;
    uniforms["rayleigh"].value = effectController.rayleigh;
    uniforms["mieCoefficient"].value = effectController.mieCoefficient;
    uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(sun);

    renderer.toneMappingExposure = effectController.exposure;
    renderer.render(scene, camera);
  }

  const gui = new GUI();

  gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
  gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
  gui
    .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
    .onChange(guiChanged);
  gui
    .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
    .onChange(guiChanged);
  gui.add(effectController, "elevation", 0, 90, 0.1).onChange(guiChanged);
  gui.add(effectController, "azimuth", -180, 180, 0.1).onChange(guiChanged);
  gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

  guiChanged();
}

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 400, 120);

  scene = new THREE.Scene();

  const helper = new THREE.GridHelper(1500, 30, 0xffffff, 0xffffff);
  scene.add(helper);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(1.5, 1, -1.5);
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  //controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = true;
  controls.enablePan = true;

  const planeGeometry = new THREE.PlaneGeometry(PLAN_WIDTH, PLAN_HEIGHT, 1, 1);
  let planeMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load(white),
  });
  const firstPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  firstPlane.rotation.x = -0.5 * Math.PI;
  firstPlane.receiveShadow = true;
  scene.add(firstPlane);

  const drawWall = (p1, p2) => {
    //loading texture

    //initializing material
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: new THREE.TextureLoader().load(wall),
    });
    // check orientation
    const isVertical = p1.x === p2.x;
    // calculate distance
    const distance =
      (isVertical ? Math.abs(p2.y - p1.y) : Math.abs(p2.x - p1.x)) *
      SCALE_FACTOR;

    // start building wall
    const geometry = new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, distance);

    const cube = new THREE.Mesh(geometry, boxMaterial);
    // calculate wall center position
    cube.position.y = WALL_HEIGHT / 2;
    cube.position.x = (isVertical ? p1.x : (p1.x + p2.x) / 2) * SCALE_FACTOR;
    cube.position.z =
      -1 * (isVertical ? (p1.y + p2.y) / 2 : p1.y) * SCALE_FACTOR;

    // horizontal wall
    if (!isVertical) {
      cube.rotation.y = Math.PI / 2;
    }
    scene.add(cube);
  };
  // delivered mask from 2d coordinates
  const deliveredBoundaryMask = {
    mask: [
      [50, 100],
      [50, 70],
      [20, 70],
      [20, 50],
      [50, 50],
      [50, 30],
      [70, 30],
      [70, 10],
      [100, 10],
      [100, 60],
      [80, 60],
      [80, 100],
    ],
    door_pos: [168, 187.40000915527344],
    area: 54.28999999999998,
  };
  const drawingMask = deliveredBoundaryMask.mask;

  // compute the transition value of y an x
  function translateToZero(points) {
    let xMin = points[0][0];
    let xMax = points[0][0];
    let yMin = points[0][1];
    let yMax = points[0][1];

    for (let j = 0; j < points.length - 1; j++) {
      if (points[j + 1][0] < xMin) {
        xMin = points[j + 1][0];
      }
      if (points[j + 1][1] < yMin) {
        yMin = points[j + 1][1];
      }
      if (points[j + 1][0] > xMax) {
        xMax = points[j + 1][0];
      }
      if (points[j + 1][1] > yMax) {
        yMax = points[j + 1][1];
      }
    }
    const cx = (xMax + xMin) / 2;
    const cy = (yMax + yMin) / 2;
    console.log("cx", cx);
    console.log("cy", cy);
    const newPoints = points.map((point) => {
      const newX = point[0] - cx;
      const newY = point[1] - cy;
      return [newX, newY];
    });
    let boundaryDetails = {
      cx: cx,
      cy: cy,
      newPoints: newPoints,
    };
    return boundaryDetails;
  }

  const translatedBoundaryMask = translateToZero(drawingMask).newPoints;
  const cx = translateToZero(drawingMask).cx;
  const cy = translateToZero(drawingMask).cy;

  for (let i = 0; i < translatedBoundaryMask.length; i++) {
    const lastItem = translatedBoundaryMask.length - 1 === i;
    const p1 = {
      x: translatedBoundaryMask[i][0],
      y: translatedBoundaryMask[i][1],
    };
    const p2 = lastItem
      ? { x: translatedBoundaryMask[0][0], y: translatedBoundaryMask[0][1] }
      : {
          x: translatedBoundaryMask[i + 1][0],
          y: translatedBoundaryMask[i + 1][1],
        };
    drawWall(p1, p2);
  }
  const drawingWallsMask = {
    mask: [
      [30, 50],
      [30, 70],
      [60, 30],
      [60, 100],
    ],
  };

  const drawingWallsMasks = drawingWallsMask.mask;

  //const translatedWallsMask = translateToZero(drawingWallsMasks);
  const translatedWallsMask = drawingWallsMasks;
  for (let i = 0; i < translatedWallsMask.length; i += 2) {
    const p1 = {
      x: translatedWallsMask[i][0] - cx,
      y: translatedWallsMask[i][1] - cy,
    };
    const p2 = {
      x: translatedWallsMask[i + 1][0] - cx,
      y: translatedWallsMask[i + 1][1] - cy,
    };
    drawWall(p1, p2);
  }
  initSky();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function render() {
  renderer.render(scene, camera);
}
