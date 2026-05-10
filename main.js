console.log("hello, world! testing console...");
console.log("USE-3D RENDERER CONSOLE\nVARIABLES:\nvSize, tlSize, elSize, fov, camDist, angleX, angleY, angleZ, vCol, tCol, eCol\n\nedit animation using the following function:\n\nrenderAnim = function() {\n    clear();\n\n    ANIM HERE\n\n    renderFrame();\n    requestAnimationFrame(renderAnim);\n}");
console.log("take note: this is a work in progress, i swear i will add an editor in the HTML instead of in the console!")
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
let vSize = 8;
let tlSize = 3;
let elSize = 2;
let fov = 90;
let camDist = 300;
let angleX = 0;
let angleY = 0;
let angleZ = 0;
let vCol = "#ffffff";
let tCol = "#444444";
let eCol = "#c6c6c6";
let bCol = "#303030"
//focal length
let focalLength = canvas.width / (2 * Math.tan((fov * Math.PI) / 180 / 2));

//refresh screen
function clear() {
  ctx.fillStyle = bCol;
  ctx.fillRect(-cw, -ch, canvas.width, canvas.height);
}
clear();

//draw point 2d
function p(x, y) {
  ctx.fillStyle = vCol;
  ctx.fillRect(x - vSize / 2, -y - vSize / 2, vSize, vSize);
}
//draw line 2d
function l(x0, y0, x1, y1, size, color) {
  ctx.strokeStyle = color;
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
function pv(v, i) {
  let x = v[i][0];
  let y = v[i][1];
  let z = v[i][2];

  let r = rotatexyz(x, y, z);

  r.z += camDist; //move away from cam

  //prevent division by 0
  if (r.z <= 10) {
    return;
  }

  let sx = (r.x * focalLength) / r.z;
  let sy = (r.y * focalLength) / r.z;

  return [sx, sy];
}
//triangles projection helper
function pt(t, v, i) {
  let a = t[i][0];
  let b = t[i][1];
  let c = t[i][2];

  if (!v[a] || !v[b] || !v[c]) return; //in case i return 0 when projecting verts

  //draw triangles
  l(v[a][0], v[a][1], v[b][0], v[b][1], tlSize, tCol);
  l(v[b][0], v[b][1], v[c][0], v[c][1], tlSize, tCol);
  l(v[c][0], v[c][1], v[a][0], v[a][1], tlSize, tCol);
}
//edges projection helper
function pe(e, v, i) {
  let a = e[i][0];
  let b = e[i][1];

  if (!v[a] || !v[b]) return; //in case i return 0 when projecting verts

  //draw edge
  l(v[a][0], v[a][1], v[b][0], v[b][1], elSize, eCol);
}

//test
function renderFrame() {
  //store pv for triangles and edges
  let projected = [];
  //store in projected
  for (let i = 0; i < vertices.length; i++) {
    projected.push(pv(vertices, i));
  }
  //draw triangles
  for (let i = 0; i < triangles.length; i++) {
    pt(triangles, projected, i);
  }
  //draw edges
  for (let i = 0; i < edges.length; i++) {
    pe(edges, projected, i);
  }
  //draw vertices
  for (let i = 0; i < projected.length; i++) {
    p(projected[i][0], projected[i][1]);
  }
}

function renderAnim() {
  clear();

  angleY += 0.01

  renderFrame();
  requestAnimationFrame(renderAnim);
}
renderAnim();
