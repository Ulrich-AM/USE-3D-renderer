console.log("hello, world! testing console...");
console.log(
  "USE-3D RENDERER CONSOLE\nVARIABLES:\nvSize, tlSize, elSize, fov, camDist, angleX, angleY, angleZ, vCol, tCol, eCol\n\nedit animation using the following function:\n\nrenderAnim = function() {\n    clear();\n\n    ANIM HERE\n\n    renderFrame();\n    requestAnimationFrame(renderAnim);\n}",
);
console.log(
  "take note: this is a work in progress, i swear i will add an editor in the HTML instead of in the console!",
);
//get canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 350;
canvas.height = 350;
//setup canvas
const cw = canvas.width / 2;
const ch = canvas.height / 2;
ctx.translate(cw, ch);
ctx.imageSmoothingEnabled = false

//config
let vSize = 6;
let tlSize = 3;
let elSize = 2;
let fov = 90;
let camDist = 300;
let angleX = 0;
let angleY = 0;
let angleZ = 0;
/*
let vCol = "#000000";
let tCol = "#464646";
let eCol = "#000000";
let bCol = "#797979";
*/
let vCol = "#e0e0e0";
let tCol = "#464646";
let eCol = "#a5a5a5";
let bCol = "#111111";
/*
let vCol = "#6b80e8";
let tCol = "#2c407c";
let eCol = "#505ec9";
let bCol = "#080923";
*/
//focal length
let focalLength = canvas.width / (2 * Math.tan((fov * Math.PI) / 180 / 2)); //fov formula

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
//draw line 2d
function rast(x0, y0, x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x0, -y0);
  ctx.lineTo(x1, -y1);
  ctx.lineTo(x2, -y2);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
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
function pt(t, vp, i) {
  //access the vert projected positions the triangle thingy mentions
  let a = t[i][0];
  let b = t[i][1];
  let c = t[i][2];

  if (!vp[a] || !vp[b] || !vp[c]) return; //in case return when projecting verts

  //draw triangles
  l(vp[a][0], vp[a][1], vp[b][0], vp[b][1], tlSize, tCol);
  l(vp[b][0], vp[b][1], vp[c][0], vp[c][1], tlSize, tCol);
  l(vp[c][0], vp[c][1], vp[a][0], vp[a][1], tlSize, tCol);
}
//edges projection helper
function pe(e, v, i) {
  let a = e[i][0];
  let b = e[i][1];

  if (!v[a] || !v[b]) return; //in case return when projecting verts

  //draw edge
  l(v[a][0], v[a][1], v[b][0], v[b][1], elSize, eCol);
}

//small helper to return the position of the vertices of the triangle
function triv(t, v, i) {

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
    let t = pt(triangles, projected, i);
    //calculate normals
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

  angleY += 0.01;
  angleX += 0.01;
  angleZ += 0.01;

  renderFrame();
  requestAnimationFrame(renderAnim);
}
renderAnim()