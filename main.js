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
let lSize = 2;
let focalLength = 300;

//blueprint
let vertices = 
[
    //first face
    [-100, -100, -100],
    [-100, 100, -100],
    [100, -100, -100],
    [100, 100, -100],
    //second face
    [-100, -100, 100],
    [-100, 100, 100],
    [100, -100, 100],
    [100, 100, 100]
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
function l(x0, y0, x1, y1) {
    ctx.strokeStyle = "lightgreen";
    ctx.lineWidth = lSize;
    ctx.beginPath();
    ctx.moveTo(x0, -y0);
    ctx.lineTo(x1, -y1);
    ctx.stroke();
}



//verts projection helper
function pv(arr, i) {
    let x = arr[i][0];
    let y = arr[i][1];
    let z = arr[i][2] + 300;

    //prevent division by 0
    if (z <= 0.001) {
        return;
    }

    let sx = (x * focalLength) / z;
    let sy = (y * focalLength) / z;
    p(sx, sy);

    return {sx, sy}
}

//test
function renderFrame() {
    //render verts
    for (let i = 0; i < vertices.length; i++) {
        pv(vertices, i)
    }
}
renderFrame()