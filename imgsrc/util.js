/* util.js
 *
 * Miscellaneous functions that are used more than once.
 *
 */

import * as matrix from './matrix.js';
import * as vector from './vector.js';

// ______________________________________________________________________
// Public globals

// This is a global input to getColorStr(). I'm using this pattern to reduce
// memory allocations.
export let ctx = {};
ctx.stdColor = [0, 0, 0];


// ______________________________________________________________________
// Internal globals and functions

const hex = d => Math.ceil(d * 255).toString(16).padStart(2, '0');


// ______________________________________________________________________
// Public functions

// Ensure that elt[prop] exists; if not, create it as an empty array.
// Push newItem onto the end of that array.
export function push(elt, prop, newItem) {
    if (!elt.hasOwnProperty(prop)) elt[prop] = [];
    elt[prop].push(newItem);
}

// Return [pts, lines, faces] of a cube centered at the origin with vertices in
// {-1, 1}^3.
export function getCubePtsLinesFaces() {

    let pts = [];
    let lines = [];

    let idx = 0;
    let [xStack, yStack] = [[], []];
    let faceMap = {};
    for (let x = -1; x < 3; x += 2) {
        for (let y = -1; y < 3; y += 2) {
            for (let z = -1; z < 3; z += 2) {
                if (x === -1) xStack.push(idx);
                if (y === -1) yStack.push(idx);
                let pt = [x, y, z];
                pts.push(pt);
                for (let i = 0; i < 3; i++) {
                    push(faceMap, `${i}:${pt[i]}`, idx);
                }
                if (x === 1) lines.push({from: xStack.shift(), to: idx});
                if (y === 1) lines.push({from: yStack.shift(), to: idx});
                if (z === 1) lines.push({from: idx - 1, to: idx});
                idx++;
            }
        }
    }
    let faces = Object.values(faceMap);

    return [pts, lines, faces];
}

// Return [pts, lines, faces] of a tetrahedron centered at the origin.
export function getTetrahedronPtsLinesFaces() {

    let pts = [];
    let lines = [];
    let faces = [];

    const sqrt2inv = 1.0 / Math.sqrt(2);

    // I got these coordinates from the Wikipedia page here:
    // https://en.wikipedia.org/wiki/Tetrahedron

    for (let a = -1; a <= 1; a += 2) {
        let pt1 = [a, 0, -sqrt2inv];
        pts.push(pt1);
        let pt2 = [0, a, sqrt2inv];
        pts.push(pt2);
    }

    // Add the lines.
    for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 4; j++) {
            lines.push({from: i, to: j});
        }
    }

    // Add the faces.
    for (let i = 0; i < 4; i++) {
        let face = [];
        for (let j = 0; j < 4; j++) {
            if (i != j) face.push(j);
        }
        faces.push(face);
    }

    return [pts, lines, faces];
}

function isClose(a, b) {
    return Math.abs(a - b) < 1e-5;
}

// Return [pts, lines, faces] of a dodecahedron centered at the origin.
export function getDodecahedronPtsLinesFaces() {

    // I use the coordinates and face properties as noted in this article:
    // https://en.wikipedia.org/wiki/Regular_dodecahedron

    let pts   = [];
    let lines = [];
    let faces = [];

    const phi = (1 + Math.sqrt(5)) / 2;

    // Here and below, s1, s2, s3 stand for "sign1", "sign2", etc.

    // Build up the pts array.
    for (let s1 = -1; s1 <= 1; s1 += 2) {
        for (let s2 = -1; s2 <= 1; s2 += 2) {
            for (let s3 = -1; s3 <= 1; s3 += 2) {
                pts.push([s1, s2, s3]);
            }
        }
    }
    for (let s1 = -1; s1 <= 1; s1 += 2) {
        for (let s2 = -1; s2 <= 1; s2 += 2) {
            pts.push([0, s1 * phi, s2 / phi]);
            pts.push([s1 / phi, 0, s2 * phi]);
            pts.push([s1 * phi, s2 / phi, 0]);
        }
    }

    // Build up the lines array.
    const edgeLen = 2 / phi;
    for (let i = 0; i < pts.length - 1; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            if (isClose(vector.dist(pts[i], pts[j]), edgeLen)) {
                lines.push({from: i, to: j});
            }
        }
    }

    // Build up the faces.
    for (let coord1 = 0; coord1 < 3; coord1++) {
        let coord2 = (coord1 + 1) % 3;
        for (let s1 = -1; s1 <= 1; s1 += 2) {
            for (let s2 = -1; s2 <= 1; s2 += 2) {
                let face = [];
                for (let i = 0; i < pts.length; i++) {
                    let pt = pts[i]
                    let lhs = pt[coord1] + s1 * phi * pt[coord2];
                    if (isClose(lhs, s2 * phi * phi)) {
                        face.push(i)
                    }
                }
                faces.push(face);
            }
        }
    }

    return [pts, lines, faces];
}

// Return [pts, lines, faces] of an icosahedron centered at the origin.
export function getIcosahedronPtsLinesFaces() {

    // I use the coordinates found here:
    // https://en.wikipedia.org/wiki/Regular_icosahedron

    let pts   = [];
    let lines = [];
    let faces = [];

    const phi = (1 + Math.sqrt(5)) / 2;

    // Build up the pts array.
    for (let c1 = 0; c1 < 3; c1++) {
        let c2 = (c1 + 1) % 3;
        for (let s1 = -1; s1 <= 1; s1 += 2) {
            for (let s2 = -1; s2 <= 1; s2 += 2) {
                let pt = [0, 0, 0];
                pt[c1] = s1;
                pt[c2] = s2 * phi;
                pts.push(pt);
            }
        }
    }

    // Build up the lines array.
    const edgeLen = 2;
    for (let i = 0; i < pts.length - 1; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            if (isClose(vector.dist(pts[i], pts[j]), edgeLen)) {
                lines.push({from: i, to: j});
            }
        }
    }

    // Build up the faces array.
    // The strategy here is a little naive, but effective.
    // I iterate through all triples (i, j, k) of point indexes and add the face
    // whenever all 3 pair-wise distances are correct.
    for (let i = 0; i < pts.length - 2; i++) {
        for (let j = i + 1; j < pts.length - 1; j++) {
            for (let k = j + 1; k < pts.length; k++) {
                if ( isClose(vector.dist(pts[i], pts[j]), edgeLen) &&
                     isClose(vector.dist(pts[i], pts[k]), edgeLen) &&
                     isClose(vector.dist(pts[j], pts[k]), edgeLen) ) {
                    faces.push([i, j, k]);

                    // This is temporary code that I'm leaving around in case
                    // it's useful in the future. It can be helpful to
                    // understand the face equations.
                    if (false) {
                        let v = vector.cross(
                            vector.sub(pts[i], pts[j]),
                            vector.sub(pts[k], pts[j])
                        );
                        console.log(v);
                        console.log(vector.dot(pts[i], v));
                        console.log(vector.dot(pts[j], v));
                        console.log(vector.dot(pts[k], v));
                    }
                    // After running this, I see the face equations
                    // 2 * (+-1, +-1, +-1), 2 * (0, +-phi, +-1/phi),
                    // dot prod = 2 * phi^2.

                }
            }
        }
    }

    return [pts, lines, faces];
}

// Return [pts, lines, faces] of a cuboctahedron centered at the origin.
export function getCuboctahedronPtsLinesFaces() {

    // I used this page as a reference:
    // https://en.wikipedia.org/wiki/Cuboctahedron

    let pts   = [];
    let lines = [];
    let faces = [];

    // Build up the pts array.
    for (let c1 = 0; c1 < 3; c1++) {
        let c2 = (c1 + 1) % 3;
        for (let s1 = -1; s1 <= 1; s1 += 2) {
            for (let s2 = -1; s2 <= 1; s2 += 2) {
                let pt = [0, 0, 0];
                pt[c1] = s1;
                pt[c2] = s2;
                pts.push(pt);
            }
        }
    }

    // Build up the lines array.
    const edgeLen = Math.sqrt(2);
    for (let i = 0; i < pts.length - 1; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            if (isClose(vector.dist(pts[i], pts[j]), edgeLen)) {
                lines.push({from: i, to: j});
            }
        }
    }

    // Build up the faces array.
    // 1. Build up the squares.
    for (let c = 0; c < 3; c++) {
        for (let s = -1; s <= 1; s += 2) {
            let face = [];
            for (let i = 0; i < pts.length; i++) {
                if (pts[i][c] == s) face.push(i);
            }
            faces.push(face);
        }
    }
    // 2. Build up the triangles.
    for (let s1 = -1; s1 <= 1; s1 += 2) {
        for (let s2 = -1; s2 <= 1; s2 += 2) {
            for (let s3 = -1; s3 <= 1; s3 += 2) {
                let face = [];
                let s = [s1, s2, s3];
                for (let i = 0; i < pts.length; i++) {
                    let numMatches = 0;
                    for (let j = 0; j < 3; j++) {
                        if (pts[i][j] == s[j]) numMatches++;
                    }
                    if (numMatches == 2) face.push(i);
                }
                faces.push(face);
            }
        }
    }

    return [pts, lines, faces];
}

// Return [pts, lines, faces] of an icosidodecahedron centered at the origin.
export function getIcosidodecahedronPtsLinesFaces() {

    // I used this page as a reference:
    // https://en.wikipedia.org/wiki/Icosidodecahedron

    let pts   = [];
    let lines = [];
    let faces = [];

    const phi = (1 + Math.sqrt(5)) / 2;

    // Build up the pts array.
    // Add the points (0, 0, +-phi)_s. (_s = all shifts)
    for (let c = 0; c < 3; c++) {
        for (let s = -1; s <= 1; s += 2) {
            let pt = [0, 0, 0];
            pt[c] = s * phi;
            pts.push(pt);
        }
    }
    // Add the points (1/2)(+-1, +-phi, +-phi^2)_s.
    for (let c1 = 0; c1 < 3; c1++) {
        let c2 = (c1 + 1) % 3;
        let c3 = (c1 + 2) % 3;
        for (let s1 = -1; s1 <= 1; s1 += 2) {
            for (let s2 = -1; s2 <= 1; s2 += 2) {
                for (let s3 = -1; s3 <= 1; s3 += 2) {
                    let pt = [0, 0, 0];
                    pt[c1] = s1 / 2;
                    pt[c2] = s2 * phi / 2;
                    pt[c3] = s3 * phi * phi / 2;
                    pts.push(pt);
                }
            }
        }
    }

    // Build up the lines array.
    const edgeLen = 1;
    for (let i = 0; i < pts.length - 1; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            if (isClose(vector.dist(pts[i], pts[j]), edgeLen)) {
                lines.push({from: i, to: j});
            }
        }
    }

    // Build up the triangular faces.
    for (let i = 0; i < pts.length - 2; i++) {
        for (let j = i + 1; j < pts.length - 1; j++) {
            for (let k = j + 1; k < pts.length; k++) {
                if ( isClose(vector.dist(pts[i], pts[j]), edgeLen) &&
                     isClose(vector.dist(pts[i], pts[k]), edgeLen) &&
                     isClose(vector.dist(pts[j], pts[k]), edgeLen) ) {
                    faces.push([i, j, k]);

                    // This is temporary code that I'm leaving around in case
                    // it's useful in the future. It can be helpful to
                    // understand the face equations.
                    if (false) {
                        let v = vector.cross(
                            vector.sub(pts[i], pts[j]),
                            vector.sub(pts[k], pts[j])
                        );
                        console.log(v);
                        console.log(vector.dot(pts[i], v));
                        console.log(vector.dot(pts[j], v));
                        console.log(vector.dot(pts[k], v));
                    }
                    // After running this, I see the face equations
                    // 2 * (+-1, +-1, +-1), 2 * (0, +-phi, +-1/phi),
                    // dot prod = 2 * phi^2.
                }
            }
        }
    }

    // Build up the pentagonal faces.
    function findPtsInPlane(v, c) {
        // This returns an array of indexes i in pts so that
        // <pts[i], v> = c.
        let indexes = [];
        for (let i in pts) {
            if (isClose(vector.dot(v, pts[i]), c)) {
                indexes.push(i);
            }
        }
        return indexes;
    }
    let c = phi * phi / 2;
    for (let c1 = 0; c1 < 3; c1++) {
        let c2 = (c1 + 1) % 3;
        let c3 = (c1 + 2) % 3;
        for (let s1 = -1; s1 <= 1; s1 += 2) {
            for (let s2 = -1; s2 <= 1; s2 += 2) {
                let v = [0, 0, 0];
                v[c1] = s1 * phi / 2;
                v[c2] = s2 / 2;
                faces.push(findPtsInPlane(v, c));
            }
        }
    }

    return [pts, lines, faces];
}


// This expects `pts` to be a list of xyz arrays, and labels to be a
// corresponding list of strings. Conceptually, this scans from left to right --
// meaning from low x values to high x values -- and transforms each slice of
// the input points into a projection in 2d. Low x values correspond to small
// radii, while high x values to large.
//
// If both aMin and aMax are provided, then the points are rotated by an angle
// `a` that increases from aMin to aMax as x proceeds from xMin to xMax.
export function explode3DPoints(
    pts,
    labels,
    rMin,
    rMax,
    aMin,
    aMax,
    doKeepCoords
) {
    // Support receiving doKeepCoords without aMin, aMax.
    if (aMax === undefined) doKeepCoords = aMin;

    let xMin = Math.min(...pts.map(x => x[0]));
    let xMax = Math.max(...pts.map(x => x[0]));
    let findR = x => rMin + (rMax - rMin) * (x - xMin) / (xMax - xMin);
    let findA = x => aMin + (aMax - aMin) * (x - xMin) / (xMax - xMin);

    let newP = [];
    for (let i in pts) {
        let pt = pts[i];
        pt.label = labels[i];
        let len = Math.sqrt(pt[1] * pt[1] + pt[2] * pt[2]);
        let r = findR(pt[0]);
        let newPt = null;
        if (doKeepCoords) {
            newPt = [pt[1] / len * r, pt[2] / len * r];
        } else {
            newPt = [-pt[2] / len * r, pt[1] / len * r];
        }
        if (aMin !== undefined && aMax !== undefined) {
            let a = findA(pt[0]);
            newPt = matrix.transpose(matrix.mult(
                matrix.rotateXY(a),
                matrix.transpose([newPt])
            ))[0];
        }
        newPt.label = pt.label;
        newP.push(newPt);
    }
    return newP;
}

export function explodeNDPoints(pts, labels, rMin, rMax) {

    let xMin = Math.min(...pts.map(x => x[0]));
    let xMax = Math.max(...pts.map(x => x[0]));
    let findR = x => rMin + (rMax - rMin) * (x - xMin) / (xMax - xMin);
    let findA = x => aMin + (aMax - aMin) * (x - xMin) / (xMax - xMin);

    let newP = [];
    for (let i in pts) {
        let pt = pts[i];
        pt.label = labels[i];
        let q = pt.slice(1);
        let len = vector.len(q);
        let r = findR(pt[0]);
        let newPt = q.map(x => x / len * r);
        newPt.label = pt.label;
        newP.push(newPt);
    }
    return newP;
}

// This first translates all the points (z, tail) -> (z + Z, tail) so that the
// minimum z' (= z + Z) coordinate is 1. Then it replaces (z', tail) with
// (tail / z'). It maps n-dimensional points to (n-1)-dimensional points.
export function perspectiveProjectPoints(pts, labels, minZVal) {
    if (minZVal === undefined) minZVal = 2;
    let zMin   = Math.min(...pts.map(x => x[0]));
    let newPts = [];
    for (let i in pts) {
        const pt    = pts[i];
        const tail  = pt.slice(1);
        const z     = pt[0] - zMin + minZVal;
        const newPt = tail.map(x => x / z);
        newPt.label = labels[i];
        newPts.push(newPt);
    }
    return newPts;
}

// Derive an [r, g, b] array from a color string. The values of r, g, and b are
// each in the range [0, 1]. This expects that the color string has no alpha
// value.
export function getStdColor(colorStr) {
    console.assert(colorStr[0] === '#');
    let color = [];
    let nDigits = (colorStr.length === 7 ? 2 : 1);
    for (let i = 0; i < 3; i++) {
        let channelStr = colorStr.substr(1 + nDigits * i, nDigits);
        if (nDigits === 1) channelStr = channelStr + channelStr;
        color.push(parseInt(channelStr, 16) / 255);
    }
    return color;
}

// This converts a standard color array to a color string. A standard color
// array has [r, g, b] which each value in the range [0, 1].
export function getColorStr(c) {
    if (c !== undefined) return '#' + c.map(hex).join('');
    return '#' + ctx.stdColor.map(hex).join('');
}
