//get canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;
//setup canvas
const cw = canvas.width / 2;
const ch = canvas.height / 2;
ctx.translate(cw, ch);

//config
let vSize = 5;
let tlSize = 3;
let elSize = 2;
let focalLength = 300;
let angleX = 0;
let angleY = 0;
let angleZ = 0;

//blueprint
let vertices = [
  //first face
  [-100, -100, -100],
  [-100, 100, -100],
  [100, -100, -100],
  [100, 100, -100],
  //second face
  [-100, -100, 100],
  [-100, 100, 100],
  [100, -100, 100],
  [100, 100, 100],
];
let triangles = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
]

//refresh screen
function clear() {
  ctx.fillStyle = "black";
  ctx.fillRect(-cw, -ch, canvas.width, canvas.height);
}
clear();

//draw point 2d
function p(x, y) {
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(x, -y, vSize, vSize);
}
//draw line 2d
function l(x0, y0, x1, y1, size) {
  ctx.strokeStyle = "lightgreen";
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.moveTo(x0, -y0);
  ctx.lineTo(x1, -y1);
  ctx.stroke();
}

//rotation functions
//x
function rotx(x, y, z, angle) {
  let c = Math.cos(angle);
  let s = Math.sin(angle);
  return {
    xp: x,
    yp: y * c - z * s,
    zp: y * s + z * c,
  };
}
//y
function roty(x, y, z, angle) {
  let c = Math.cos(angle);
  let s = Math.sin(angle);
  return {
    xp: x * c + z * s,
    yp: y,
    zp: -x * s + z * c,
  };
}
//z
function rotz(x, y, z, angle) {
  let c = Math.cos(angle);
  let s = Math.sin(angle);
  return {
    xp: x * c - y * s,
    yp: x * s + y * c,
    zp: z,
  };
}
//rotation helper
function rotatexyz(x, y, z) {
  let r = rotx(x, y, z, angleX);
  x = r.xp;
  y = r.yp;
  z = r.zp;

  r = roty(x, y, z, angleY);
  x = r.xp;
  y = r.yp;
  z = r.zp;

  r = rotz(x, y, z, angleZ);
  x = r.xp;
  y = r.yp;
  z = r.zp;

  return { x, y, z };
}

//verts projection helper
function pv(arr, i) {
  let x = arr[i][0];
  let y = arr[i][1];
  let z = arr[i][2];

  let r = rotatexyz(x, y, z)

  r.z += 300; //move away from cam

  //prevent division by 0
  if (r.z <= 0.001) {
    return;
  }

  let sx = (r.x * focalLength) / r.z;
  let sy = (r.y * focalLength) / r.z;
  p(sx, sy);

  return { sx, sy };
}

//test
function renderFrame() {
  //render verts
  for (let i = 0; i < vertices.length; i++) {
    pv(vertices, i);
  }
}

function renderAnim() {
    clear();

    angleX += 0.01;
    angleY += 0.01;
    angleZ += 0.01;
    renderFrame();

    requestAnimationFrame(renderAnim);
}
renderAnim();