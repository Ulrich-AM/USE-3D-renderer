console.log("hello, world! testing console...");
console.log(
  "USE-3D RENDERER CONSOLE\nVARIABLES:\nvSize, tlSize, elSize, fov, camX, camY, camZ, angleX, angleY, angleZ, vCol, tCol, eCol, bCol\n\nedit animation using the following function:\n\nrenderAnim = function() {\n    clear();\n\n    ANIM HERE\n\n    renderFrame();\n    requestAnimationFrame(renderAnim);\n}",
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
ctx.imageSmoothingEnabled = false;

//config
let vSize = 6;
let tlSize = 2;
let elSize = 3;
let fov = 90;
let camX = 0;
let camY = 0;
let camZ = -500;
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
const focalLength = canvas.width / (2 * Math.tan((fov * Math.PI) / 180 / 2)); //fov formula

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
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    xp: x,
    yp: y * c - z * s,
    zp: y * s + z * c,
  };
}
//y
function roty(x, y, z, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    xp: x * c + z * s,
    yp: y,
    zp: -x * s + z * c,
  };
}
//z
function rotz(x, y, z, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
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
function pv(vrt, i) {
  let x = vrt[i][0];
  let y = vrt[i][1];
  let z = vrt[i][2];

  const r = rotatexyz(x, y, z);

  //rotate verts
  x = r.x;
  y = r.y;
  z = r.z;

  //apply cam pos
  x -= camX;
  y -= camY;
  z -= camZ;

  //prevent division by 0
  if (Math.abs(z) < 0.001) {
    return;
  }

  const sx = (x * focalLength) / z;
  const sy = (y * focalLength) / z;

  return [sx, sy];
}
//triangles projection helper
function pt(tri, vrtproj, i) {
  //access the vert projected positions the triangle thingy mentions
  const a = tri[i][0];
  const b = tri[i][1];
  const c = tri[i][2];

  if (!vrtproj[a] || !vrtproj[b] || !vrtproj[c]) return; //in case return when projecting verts

  //draw triangles
  l(vrtproj[a][0], vrtproj[a][1], vrtproj[b][0], vrtproj[b][1], tlSize, tCol);
  l(vrtproj[b][0], vrtproj[b][1], vrtproj[c][0], vrtproj[c][1], tlSize, tCol);
  l(vrtproj[c][0], vrtproj[c][1], vrtproj[a][0], vrtproj[a][1], tlSize, tCol);
}
//edges projection helper
function pe(e, vrt, i) {
  const a = e[i][0];
  const b = e[i][1];

  if (!vrt[a] || !vrt[b]) return; //in case return when projecting verts

  //draw edge
  l(vrt[a][0], vrt[a][1], vrt[b][0], vrt[b][1], elSize, eCol);
}

//small helper to return the position of the vertices of the triangle
function triv(tri, vrt, i) {
  const a = tri[i][0];
  const b = tri[i][1];
  const c = tri[i][2];

  //very efficient design
  return {
    x0: vrt[a][0],
    y0: vrt[a][1],
    z0: vrt[a][2],

    x1: vrt[b][0],
    y1: vrt[b][1],
    z1: vrt[b][2],

    x2: vrt[c][0],
    y2: vrt[c][1],
    z2: vrt[c][2],
  };
}

//helper for backface culling
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

//helper for to help calculate triangle normals
function normalize(vector) {
  //magnitude of the vector
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);

  //for weird triangles (degenrate)
  if (length === 0) {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  //return the normalized vectors
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

function calcNormals(tri) {
  //calculate the edges
  const e0 = {
    x: tri.x1 - tri.x0,
    y: tri.y1 - tri.y0,
    z: tri.z1 - tri.z0,
  };

  const e1 = {
    x: tri.x2 - tri.x0,
    y: tri.y2 - tri.y0,
    z: tri.z2 - tri.z0,
  };

  //calculate the cross product
  const cp = {
    x: e0.y * e1.z - e0.z * e1.y,
    y: e0.z * e1.x - e0.x * e1.z,
    z: e0.x * e1.y - e0.y * e1.x,
  };

  //normalize cross product
  const tn = normalize(cp);
  return {
    x: tn.x,
    y: tn.y,
    z: tn.z,
  };
}

//backface culling
function ifCulled(tri, vrt, i, normal) {
  const a = tri[i][0];
  const b = tri[i][1];
  const c = tri[i][2];

  //calculate the centroid
  const centroid = {
    x: (vrt[a][0] + vrt[b][0] + vrt[c][0]) / 3,
    y: (vrt[a][1] + vrt[b][1] + vrt[c][1]) / 3,
    z: (vrt[a][2] + vrt[b][2] + vrt[c][2]) / 3,
  };
  //calculate the view vector
  const viewVector = {
    x: camX - centroid.x,
    y: camY - centroid.y,
    z: camZ - centroid.z,
  };
  //check visibility using dot product
  const visibility = dotProduct(normal, viewVector)

  //return boolean whether to render or not
  if (visibility > 0) {
    return true
  } else {
    return false
  }
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
    let tri = pt(triangles, projected, i);
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

let angle = 0;
function renderAnim() {
  clear();

  angleY += 0.03;

  //circular camera motion
  let radius = 200;
  camX = Math.cos(angle) * radius;
  camY = Math.sin(angle) * radius;
  angle += 0.02;

  renderFrame();
  requestAnimationFrame(renderAnim);
}

renderAnim();
