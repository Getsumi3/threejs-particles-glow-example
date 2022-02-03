import "./styles.css";
import * as THREE from "three";

import Stats from "three/examples//jsm/libs/stats.module.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

let camera,
  scene,
  renderer,
  stats,
  material,
  renderScene,
  bloomPass,
  bloomComposer;
let mouseX = 0,
  mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let vertices, sizes, geometry;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    2,
    2000
  );
  camera.position.z = 1000;

  scene = new THREE.Scene();
  //scene.fog = new THREE.FogExp2(0x000000, 0.001);

  geometry = new THREE.BufferGeometry();
  vertices = [];

  const sprite = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/disc.png"
  );

  for (let i = 0; i < 1000; i++) {
    const x = 2000 * Math.random() - 1000;
    const y = 2000 * Math.random() - 1000;
    const z = 2000 * Math.random() - 1000;

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  sizes = [];
  for (let i = 0; i < 3000; i++) {
    sizes.push(10);
  }

  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 3));

  material = new THREE.PointsMaterial({
    size: 10,
    sizeAttenuation: true,
    map: sprite,
    alphaTest: 0.5,
    transparent: true
  });
  material.color.setHSL(1.0, 0.3, 0.7);
  // const uniforms = {
  //   color: {
  //     value: new THREE.Color(0xffffff)
  //   },
  //   customTexture: {
  //     value: sprite
  //   }
  // };

  // material = new THREE.ShaderMaterial({
  //   uniforms: uniforms,
  //   vertexShader: vs,
  //   fragmentShader: fs,
  //   transparent: false
  // });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  //bloom renderer
  initPostFx();

  stats = new Stats();
  document.body.appendChild(stats.dom);

  //

  const gui = new GUI();

  gui.add(bloomComposer, "renderToScreen");
  gui.add(bloomPass, "strength", 0, 10);
  gui.open();

  //

  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("touchstart", onDocumentTouchStart, false);
  document.addEventListener("touchmove", onDocumentTouchMove, false);

  //

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

//

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;

  camera.lookAt(scene.position);

  // let h = ((360 * (1.0 + time)) % 360) / 360;
  // material.color.setHSL(h, 0.5, 0.5);
  vertices.splice(0, vertices.length);
  for (let i = 0; i < 100; i++) {
    const x = 2000 * Math.random() - 1000;
    const y = 2000 * Math.random() - 1000;
    const z = 2000 * Math.random() - 1000;

    vertices.push(x, y, z);
  }

  // geometry.setAttribute(
  //   "position",
  //   new THREE.Float32BufferAttribute(vertices, 3)
  // );

  renderer.render(scene, camera);
  bloomComposer.render();
}

function initPostFx() {
  renderScene = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );

  bloomPass.threshold = 0;
  bloomPass.strength = 2; //intensity of glow
  bloomPass.radius = 0;

  bloomComposer = new EffectComposer(renderer);

  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.renderToScreen = true;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
}
