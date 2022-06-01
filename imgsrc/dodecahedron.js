/* dodecahedron.js
 *
 * Render a rotating dodecahedron with space.js.
 *
 */


// ______________________________________________________________________
// Imports

import * as init   from './init.js';
import * as space  from './space.js';
import * as util   from './util.js';
import * as vector from './vector.js';


// ______________________________________________________________________
// Globals

let zDist = 7;


// ______________________________________________________________________
// Functions

// Ensure that elt[prop] exists; if not, create it as an empty array.
// Push newItem onto the end of that array.
function push(elt, prop, newItem) {
    if (!elt.hasOwnProperty(prop)) elt[prop] = [];
    elt[prop].push(newItem);
}

function areOpposite(a, b) {
    return a[0] === -b[0] && a[1] === -b[1] && a[2] === -b[2];
}


// ______________________________________________________________________
// Main

window.addEventListener('DOMContentLoaded', (event) => {

    space.setArtist(init.setup());

    let [pts, lines, faces] = util.getDodecahedronPtsLinesFaces();

    // Add a small degree of fading for the farther-back points and lines.
    space.ctx.fadeRange = [6, 16];

    space.ctx.zoom = 3;
    space.addPoints(pts);
    space.addLines(lines);
    space.addFaces(faces);

    // space.ctx.doDrawNormalLines = true;
    space.ctx.doDrawDots = false;

    space.makeDraggable();
    space.ctx.rotationsPerSec = 0.05;
    space.ctx.rotationSign = -1;
    space.setZDist(zDist);
    space.rotateAround([0.3, -1, 0.5]);

    space.animate();
});
