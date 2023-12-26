"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var THREE = _interopRequireWildcard(require("three"));

var _OrbitControls = require("three/examples/jsm/controls/OrbitControls.js");

var dat = _interopRequireWildcard(require("dat.gui"));

var _test = _interopRequireDefault(require("../images/test1.jpeg"));

var _walltest = _interopRequireDefault(require("../images/walltest.jpg"));

var _natural = _interopRequireDefault(require("../images/natural .jpg"));

var _white = _interopRequireDefault(require("../images/white.jpg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//create a name space
// web gl render
var render = new THREE.WebGL1Renderer(); // set the size of space

render.setSize(window.innerWidth, window.innerHeight); // inject that space

document.body.appendChild(render.domElement); // enable shadow map

render.shadowMap.enabled = true; // respective camera class

var scene = new THREE.Scene();
var PLAN_WIDTH = 100;
var PLAN_HEIGHT = 100;
var WALL_WIDTH = 1;
var WALL_HEIGHT = 8;
var SCALE_FACTOR = 0.5;
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
render.setPixelRatio(window.devicePixelRatio);
var orbit = new _OrbitControls.OrbitControls(camera, render.domElement);
var axesHelper = new THREE.AxesHelper(5); // axesHelper.rotateZ = -0.5 * Math.PI;

scene.add(axesHelper); // camera position of the view

camera.position.set(-20, 100, 20);
orbit.update();
var planeGeometry = new THREE.PlaneGeometry(PLAN_WIDTH, PLAN_HEIGHT);
var planeMaterial = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load(_white["default"])
});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
planeMaterial.map.offset.set(0.5, 0.5); // change this line

planeMaterial.map.repeat.set(0.5, 0.5); // change this line

scene.add(plane); // create grid surface

var gridHelper = new THREE.GridHelper(20); // gridHelper.material.color.set(transpare);

scene.add(gridHelper); //create class ambientlight

var ambientlight = new THREE.AmbientLight(0x333333);
scene.add(ambientlight); //add a directional lite

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 80, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12; //  directional light helper class

var dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 8);
scene.add(dLightHelper); //

var dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper); // create a spot lite class

var spotLite = new THREE.SpotLight(0xffff);
scene.add(spotLite);
spotLite.position.set(-100, 100, 0);
spotLite.castShadow = true;
spotLite.angle = 0.2; // spot lite helper

var spotLiteHelper = new THREE.SpotLightHelper(spotLite);
scene.add(spotLiteHelper); //back ground image

scene.background = new THREE.CubeTextureLoader().load([_natural["default"], _natural["default"], _natural["default"], _natural["default"], _natural["default"], _natural["default"]]);

var drawWall = function drawWall(p1, p2) {
  //loading texture
  //initializing material
  var boxMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: new THREE.TextureLoader().load(_walltest["default"])
  }); // check orientation

  var isVertical = p1.x === p2.x; // calculate distance

  var distance = (isVertical ? Math.abs(p2.y - p1.y) : Math.abs(p2.x - p1.x)) * SCALE_FACTOR; // start building wall

  var geometry = new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, distance);
  var cube = new THREE.Mesh(geometry, boxMaterial); // calculate wall center position

  cube.position.y = WALL_HEIGHT / 2;
  cube.position.x = (isVertical ? p1.x : (p1.x + p2.x) / 2) * SCALE_FACTOR;
  cube.position.z = -1 * (isVertical ? (p1.y + p2.y) / 2 : p1.y) * SCALE_FACTOR; // horizontal wall

  if (!isVertical) {
    cube.rotation.y = Math.PI / 2;
  }

  scene.add(cube);
};

var drawingBoundary = {
  mask: [[0, 0], [90, 0], [90, 90], [0, 90]],
  door_pos: [168, 187.40000915527344],
  area: 54.28999999999998
};
var drawingWalls = {
  mask: [[30, 0], [30, 45], [0, 45], [30, 45], [60, 0], [60, 30], [90, 30], [60, 30], [0, 60], [60, 60], [60, 60], [60, 90]]
};
var drawingMask = drawingBoundary.mask;

for (var i = 0; i < drawingMask.length; i++) {
  var lastItem = drawingMask.length - 1 === i;
  var p1 = {
    x: drawingMask[i][0],
    y: drawingMask[i][1]
  };
  var p2 = lastItem ? {
    x: drawingMask[0][0],
    y: drawingMask[0][1]
  } : {
    x: drawingMask[i + 1][0],
    y: drawingMask[i + 1][1]
  };
  drawWall(p1, p2);
}

var drawingWallsMasks = drawingWalls.mask;

for (var _i = 0; _i < drawingWallsMasks.length; _i += 2) {
  var _p = {
    x: drawingWallsMasks[_i][0],
    y: drawingWallsMasks[_i][1]
  };
  var _p2 = {
    x: drawingWallsMasks[_i + 1][0],
    y: drawingWallsMasks[_i + 1][1]
  };
  drawWall(_p, _p2);
}

function animate(time) {
  // box.rotation.x = time / 1000;
  // box.rotation.y = time / 1000;
  // step += options.speed;
  // sphere.position.y = 10 * Math.abs(Math.sin(step));
  // spotLite.angle = options.angle;
  // spotLite.penumbra = options.penumbra;
  // spotLite.intensity = options.intensity;
  // spotLiteHelper.update();
  render.render(scene, camera);
}

render.setAnimationLoop(animate);