# Swapping in your real SolidWorks models

`gallery.html` currently displays five stand-in shapes (built from basic
Three.js geometry) so the gallery works today, even before you've exported
anything. The pickup / inventory / inspect / combine / download system
doesn't care where a model comes from — it works on whatever `THREE.Object3D`
is loaded, so once you swap the geometry, everything else keeps working
exactly as it does now, including the "Download .glb" button.

## 1. Export from SolidWorks

SolidWorks can't be read by a browser directly, so each part/assembly needs
to become **glTF (.glb)**, the standard format for web 3D:

- **Easiest:** File → Save As → choose `.STL` or `.OBJ` (built into SolidWorks),
  then convert that to `.glb` for free at https://products.aspose.app/3d/conversion
  or with Blender (File → Import → STL/OBJ, then File → Export → glTF 2.0).
- **Cleaner (if you have it):** the eDrawings/3D Interconnect glTF exporter,
  or SolidWorks' STEP export → import into Blender → export glTF. STEP
  preserves more precision than STL if you want exact curves.
- Keep each exported file small (under a few MB) — decimate/simplify high
  poly-count parts in Blender first if needed, so it loads fast in-browser.

Each project is now a **kit of separate parts** (see the `KITS` array in
`gallery.html`) — e.g. the projector mount is `mount-plate`, `mount-arm`,
`mount-hook`, `mount-screws`. Export one file per part, using each part's
`id` as the filename, and drop them in a `models/` folder next to
`gallery.html`:

```
models/
  mount-plate.glb
  mount-arm.glb
  mount-hook.glb
  mount-screws.glb
  chassis-frame.glb
  chassis-wheels.glb
  ... etc for every part id in the KITS array
```

Fastener sets (screws) can reuse one generic exported screw model across
every kit if you don't want to model 5 separate screw variants — just point
every `*-screws` part at the same file.

## 2. Load them instead of the placeholder shapes

In `gallery.html`, each part has a `local:` function that returns a
`THREE.Mesh` or `THREE.Group` at its own origin, e.g. the projector mount's
`mount-plate` part. Replace the geometry-building code with a loader call.
Add this near the top of the `<script type="module">` block:

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const gltfLoader = new GLTFLoader();

async function loadModel(path) {
  const gltf = await gltfLoader.loadAsync(path);
  return gltf.scene;
}
```

Then change each part's `local:` function so it loads its file instead of
building geometry — since loading is asynchronous, the station-building code
(the `KITS.forEach(...)` block) needs to become `async` too (or a `for...of`
loop with `await` inside, since `.forEach` can't await). The part definition
currently looks like:

```js
{ id:'mount-plate', name:'Ceiling Plate', small:false,
  local: () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.35), metal(0x999999)); return m; },
  assembled: { pos:[0,0,0], rot:[0,0,0] } }
```

Change `local` to load the file instead:

```js
local: () => loadModel(`models/${part.id}.glb`)  // now returns a Promise
```

and everywhere `part.local()` is called (in the station-building loop, in
`buildKitObject`, and in `dropItem`), `await` it. The `assembled.pos` /
`assembled.rot` offsets stay exactly as they are — that's what lines each
real part up with the others when they snap together — you'll just need to
adjust the numbers to match your actual part dimensions instead of the
placeholder ones.

## 3. If you want the file scale to look right

Real SolidWorks exports are often much larger or smaller than the
placeholder shapes (which are sized in meters to fit a human-scale room).
After loading each part, you may need to rescale it before returning it from
`local`:

```js
const box = new THREE.Box3().setFromObject(model);
const size = box.getSize(new THREE.Vector3()).length();
model.scale.setScalar(0.2 / size); // fit each part to roughly 0.2m across
```
