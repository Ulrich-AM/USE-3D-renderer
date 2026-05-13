# USE-3D-renderer

ULRICH'S SUPER EPIC 3D RENDERER (USE-3D RENDERER):

open the page:
https://ulrich-am.github.io/USE-3D-renderer/

**current stuff:**

- triangles, edges, and vertices as arrays so its very simple to make new meshes
- editable colors for background, verts, edges, and triangles
- lots of configurable stuff
- vertices projection and wireframe (triangle/edge) rendering
- backface culling
- camera vector and position
- added sliders

**to add:**

- painters algorithm
- shaders
- proper user interface
- proper render editor (current editor is in the console)

**to fix:**

- none so far

**fixed:**

- the weird triangle rendering problem. i already applied the camera space to tje tris (in the transTris function) but then i do it again in the view vector. the fix was just to remove the camera position in the viewVector

fixed:
const viewVector = {
x: -centroid.x,
y: -centroid.y,
z: -centroid.z,
};

original:
const viewVector = {
x: camX - centroid.x,
y: camY - centroid.y,
z: camZ - centroid.z,
};

- removed crappy console editor
