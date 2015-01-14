// Hangbin Li - EECS 351 Project B
// drawing function javascript file

function makeGroundGrid() {
    //==============================================================================
    // Create a list of vertices that create a large grid of lines in the x,y plane
    // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

    var xcount = 1000; // # of lines to draw in x,y to make the grid.
    var ycount = 1000;
    var xymax = 500.0; // grid size; extends to cover +/-xymax in x and y.
    var xColr = new Float32Array([1.0, 1.0, 0.3]); // bright yellow
    var yColr = new Float32Array([0.5, 1.0, 0.5]); // bright green.

    // Create an (global) array to hold this ground-plane's vertices:
    gndVerts = new Float32Array(floatsPerVertex * 2 * (xcount + ycount));
    // draw a grid made of xcount+ycount lines; 2 vertices per line.

    var xgap = xymax / (xcount - 1); // HALF-spacing between lines in x,y;
    var ygap = xymax / (ycount - 1); // (why half? because v==(0line number/2))

    // First, step thru x values as we make vertical lines of constant-x:
    for (v = 0, j = 0; v < 2 * xcount; v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // put even-numbered vertices at (xnow, -xymax, 0)
            gndVerts[j] = -xymax + (v) * xgap; // x
            gndVerts[j + 1] = -xymax; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        } else { // put odd-numbered vertices at (xnow, +xymax, 0).
            gndVerts[j] = -xymax + (v - 1) * xgap; // x
            gndVerts[j + 1] = xymax; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        }
        gndVerts[j + 4] = xColr[0]; // red
        gndVerts[j + 5] = xColr[1]; // grn
        gndVerts[j + 6] = xColr[2]; // blu
    }
    // Second, step thru y values as wqe make horizontal lines of constant-y:
    // (don't re-initialize j--we're adding more vertices to the array)
    for (v = 0; v < 2 * ycount; v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // put even-numbered vertices at (-xymax, ynow, 0)
            gndVerts[j] = -xymax; // x
            gndVerts[j + 1] = -xymax + (v) * ygap; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        } else { // put odd-numbered vertices at (+xymax, ynow, 0).
            gndVerts[j] = xymax; // x
            gndVerts[j + 1] = -xymax + (v - 1) * ygap; // y
            gndVerts[j + 2] = 0.0; // z
            gndVerts[j + 3] = 1.0; // w.
        }
        gndVerts[j + 4] = yColr[0]; // red
        gndVerts[j + 5] = yColr[1]; // grn
        gndVerts[j + 6] = yColr[2]; // blu
    }
}

function makeAxes() {
    axesVerts = new Float32Array([
        // Vertex coordinates and color
        0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, // x-axis
        200.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,

        0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, // y-axis
        0.0, 200.0, 0.0, 1.0, 1.0, 0.0, 0.0,

        0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, // z-axis
        0.0, 0.0, 200.0, 1.0, 1.0, 0.0, 0.0
    ]);
}

function makeCone() {
    //==============================================================================
    // Make a cone shape from one TRIANGLE_STRIP drawing primitive, using the
    // 'stepped spiral' design described in notes.
    // Cone center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
    //
    var ctrColr = new Float32Array([0.5, 0.3, 0.2]); // dark gray
    var topColr = new Float32Array([0.4, 0.7, 0.6]); // light green
    var botColr = new Float32Array([0.6, 0.2, 0.1]); // light blue
    var capVerts = 16; // # of vertices around the topmost 'cap' of the shape
    var botRadius = 1.6; // radius of bottom of cone (top always 1.0)
    var topRadius = 0; // radius of bottom of cone

    // Create a (global) array to hold this cone's vertices;
    coneVerts = new Float32Array(((capVerts * 6) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 

    // Create circle-shaped top cap of cone at z=+1.0, radius 1.0
    // v counts vertices: j counts array elements (vertices * elements per vertex)
    for (v = 1, j = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
        // skip the first vertex--not needed.
        if (v % 2 == 0) { // put even# vertices at center of cone's top cap:
            coneVerts[j] = 0.0; // x,y,z,w == 0,0,1,1
            coneVerts[j + 1] = 0.0;
            coneVerts[j + 2] = 1.0;
            coneVerts[j + 3] = 1.0; // r,g,b = topColr[]
            coneVerts[j + 4] = ctrColr[0];
            coneVerts[j + 5] = ctrColr[1];
            coneVerts[j + 6] = ctrColr[2];
        } else { // put odd# vertices around the top cap's outer edge;
            // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
            //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
            coneVerts[j] = topRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            coneVerts[j + 1] = topRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            //  (Why not 2*PI? because 0 < =v < 2*capVerts, so we
            //   can simplify cos(2*PI * (v-1)/(2*capVerts))
            coneVerts[j + 2] = 1.0; // z
            coneVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            coneVerts[j + 4] = topColr[0];
            coneVerts[j + 5] = topColr[1];
            coneVerts[j + 6] = topColr[2];
        }
    }
    // Create the cone side walls, made of 2*capVerts vertices.
    // v counts vertices within the wall; j continues to count array elements
    for (v = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
        if (v % 2 == 0) // position all even# vertices along top cap:
        {
            coneVerts[j] = topRadius * Math.cos(Math.PI * (v) / capVerts); // x
            coneVerts[j + 1] = topRadius * Math.sin(Math.PI * (v) / capVerts); // y
            coneVerts[j + 2] = 1.0; // z
            coneVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            coneVerts[j + 4] = topColr[0];
            coneVerts[j + 5] = topColr[1];
            coneVerts[j + 6] = topColr[2];
        } else // position all odd# vertices along the bottom cap:
        {
            coneVerts[j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            coneVerts[j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            coneVerts[j + 2] = -1.0; // z
            coneVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            coneVerts[j + 4] = botColr[0];
            coneVerts[j + 5] = botColr[1];
            coneVerts[j + 6] = botColr[2];
        }
    }
    // Create the cone bottom cap, made of 2*capVerts -1 vertices.
    // v counts the vertices in the cap; j continues to count array elements
    for (v = 0; v < (2 * capVerts - 1); v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // position even #'d vertices around bot cap's outer edge
            coneVerts[j] = botRadius * Math.cos(Math.PI * (v) / capVerts); // x
            coneVerts[j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
            coneVerts[j + 2] = -1.0; // z
            coneVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            coneVerts[j + 4] = botColr[0];
            coneVerts[j + 5] = botColr[1];
            coneVerts[j + 6] = botColr[2];
        } else { // position odd#'d vertices at center of the bottom cap:
            coneVerts[j] = 0.0; // x,y,z,w == 0,0,-1,1
            coneVerts[j + 1] = 0.0;
            coneVerts[j + 2] = -1.0;
            coneVerts[j + 3] = 1.0; // r,g,b = botColr[]
            coneVerts[j + 4] = botColr[0];
            coneVerts[j + 5] = botColr[1];
            coneVerts[j + 6] = botColr[2];
        }
    }
}

function makeHemiSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 30; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = slices * 2 + 1; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var topColr = new Float32Array([0.7, 0.7, 0.7]); // North Pole: light gray
    var equColr = new Float32Array([0.3, 0.7, 0.3]); // Equator:    bright green
    var botColr = new Float32Array([0.9, 0.9, 0.9]); // South Pole: brightest gray.
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    hsphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices / 2; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                hsphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 2] = cos0;
                hsphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                hsphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                hsphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                hsphVerts[j + 2] = cos1; // z
                hsphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                hsphVerts[j + 4] = topColr[0];
                hsphVerts[j + 5] = topColr[1];
                hsphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                hsphVerts[j + 4] = botColr[0];
                hsphVerts[j + 5] = botColr[1];
                hsphVerts[j + 6] = botColr[2];
            } else {
                hsphVerts[j + 4] = Math.random(); // equColr[0]; 
                hsphVerts[j + 5] = Math.random(); // equColr[1]; 
                hsphVerts[j + 6] = Math.random(); // equColr[2];                 
            }
        }
    }
    for (s = slices / 2; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                hsphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                hsphVerts[j + 2] = hsphVerts[j - floatsPerVertex + 2];
                hsphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                hsphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                hsphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                hsphVerts[j + 2] = hsphVerts[j - floatsPerVertex + 2];
                hsphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                hsphVerts[j + 4] = topColr[0];
                hsphVerts[j + 5] = topColr[1];
                hsphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                hsphVerts[j + 4] = botColr[0];
                hsphVerts[j + 5] = botColr[1];
                hsphVerts[j + 6] = botColr[2];
            } else {
                hsphVerts[j + 4] = Math.random(); // equColr[0]; 
                hsphVerts[j + 5] = Math.random(); // equColr[1]; 
                hsphVerts[j + 6] = Math.random(); // equColr[2];                 
            }
        }
    }
}

function makeHemiCube() {
    //==============================================================================
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    hcubeVerts = new Float32Array([
        // Vertex coordinates and color
        // v2->v1, v3->v0
        -1.0, -1.0, -1.0, 1.0, 250 / 255, 250 / 255, 210 / 255, // v7 Black
        -1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 Magenta
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 White
        1.0, -1.0, -1.0, 1.0, 0.0, 1.0, 0.0, // v4 Green
        1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 1.0, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 0.3, 0.3, 0.3, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 Magenta
        -1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 Magenta
        -1.0, -1.0, -1.0, 1.0, 250 / 255, 250 / 255, 210 / 255, // v7 Black

        //---------------------
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 White
        -1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 Magenta
        -1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 Magenta
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 White
        1.0, -1.0, -1.0, 1.0, 0.0, 1.0, 0.0, // v4 Green
        1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 1.0, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 0.3, 0.3, 0.3, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 Magenta
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 // v0 White
    ]);
}

function makeHollowCylinder() {
    //==============================================================================
    // Make a cone shape from one TRIANGLE_STRIP drawing primitive, using the
    // 'stepped spiral' design described in notes.
    // Cone center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
    //
    var ctrColr = new Float32Array([255 / 255, 248 / 255, 220 / 255]); // dark gray
    var topColr = new Float32Array([135 / 255, 206 / 255, 250 / 255]); // light green
    var botColr = new Float32Array([255 / 255, 192 / 255, 203 / 255]); // light blue
    var capVerts = 30; // # of vertices around the topmost 'cap' of the shape
    var botRadius = 1.6; // radius of bottom of cone (top always 1.0)
    var topRadius = 1.6; // radius of bottom of cone
    var wallThickness = 0.6;

    // Create a (global) array to hold this cone's vertices;
    hcyldVerts = new Float32Array(((capVerts + 5) * 6) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 

    // Create circle-shaped top cap of cone at z=+1.0, radius 1.0
    // v counts vertices: j counts array elements (vertices * elements per vertex)
    for (v = 1, j = 0; v < 2 * (capVerts + 2); v++, j += floatsPerVertex) {
        // skip the first vertex--not needed.
        if (v % 2 == 0) { // put even# vertices at center of cone's top cap:
            hcyldVerts[j] = (topRadius - wallThickness) * Math.cos(Math.PI * (v - 1) / capVerts); // x
            hcyldVerts[j + 1] = (topRadius - wallThickness) * Math.sin(Math.PI * (v - 1) / capVerts); // y
            hcyldVerts[j + 2] = 1.0;
            hcyldVerts[j + 3] = 1.0; // r,g,b = topColr[]
            hcyldVerts[j + 4] = ctrColr[0];
            hcyldVerts[j + 5] = ctrColr[1];
            hcyldVerts[j + 6] = ctrColr[2];
        } else { // put odd# vertices around the top cap's outer edge;
            // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
            //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
            hcyldVerts[j] = topRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            hcyldVerts[j + 1] = topRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            //  (Why not 2*PI? because 0 < =v < 2*capVerts, so we
            //   can simplify cos(2*PI * (v-1)/(2*capVerts))
            hcyldVerts[j + 2] = 1.0; // z
            hcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            hcyldVerts[j + 4] = topColr[0];
            hcyldVerts[j + 5] = topColr[1];
            hcyldVerts[j + 6] = topColr[2];
        }
    }
    // Create the cone side walls, made of 2*capVerts vertices.
    // v counts vertices within the wall; j continues to count array elements
    for (v = 0; v < 2 * (capVerts + 2); v++, j += floatsPerVertex) {
        if (v % 2 == 0) // position all even# vertices along top cap:
        {
            hcyldVerts[j] = topRadius * Math.cos(Math.PI * (v) / capVerts); // x
            hcyldVerts[j + 1] = topRadius * Math.sin(Math.PI * (v) / capVerts); // y
            hcyldVerts[j + 2] = 1.0; // z
            hcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            hcyldVerts[j + 4] = topColr[0];
            hcyldVerts[j + 5] = topColr[1];
            hcyldVerts[j + 6] = topColr[2];
        } else // position all odd# vertices along the bottom cap:
        {
            hcyldVerts[j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            hcyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            hcyldVerts[j + 2] = -1.0; // z
            hcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            hcyldVerts[j + 4] = botColr[0];
            hcyldVerts[j + 5] = botColr[1];
            hcyldVerts[j + 6] = botColr[2];
        }
    }
    // Create the cone inner side walls, made of 2*capVerts vertices.
    // v counts vertices within the wall; j continues to count array elements
    for (v = 0; v < 2 * (capVerts + 2); v++, j += floatsPerVertex) {
        if (v % 2 == 0) // position all even# vertices along top cap:
        {
            hcyldVerts[j] = (topRadius - wallThickness) * Math.cos(Math.PI * (v) / capVerts); // x
            hcyldVerts[j + 1] = (topRadius - wallThickness) * Math.sin(Math.PI * (v) / capVerts); // y
            hcyldVerts[j + 2] = 1.0; // z
            hcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            hcyldVerts[j + 4] = topColr[0];
            hcyldVerts[j + 5] = topColr[1];
            hcyldVerts[j + 6] = topColr[2];
        } else // position all odd# vertices along the bottom cap:
        {
            hcyldVerts[j] = (botRadius - wallThickness) * Math.cos(Math.PI * (v - 1) / capVerts); // x
            hcyldVerts[j + 1] = (botRadius - wallThickness) * Math.sin(Math.PI * (v - 1) / capVerts); // y
            hcyldVerts[j + 2] = -1.0; // z
            hcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            hcyldVerts[j + 4] = botColr[0];
            hcyldVerts[j + 5] = botColr[1];
            hcyldVerts[j + 6] = botColr[2];
        }
    }
    // Create the cone bottom cap, made of 2*capVerts -1 vertices.
    // v counts the vertices in the cap; j continues to count array elements
    for (v = 0; v < (2 * capVerts + 1); v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // position even #'d vertices around bot cap's outer edge
            hcyldVerts[j] = botRadius * Math.cos(Math.PI * (v) / capVerts); // x
            hcyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
            hcyldVerts[j + 2] = -1.0; // z
            hcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            hcyldVerts[j + 4] = botColr[0];
            hcyldVerts[j + 5] = botColr[1];
            hcyldVerts[j + 6] = botColr[2];
        } else { // position odd#'d vertices at center of the bottom cap:
            hcyldVerts[j] = (botRadius - wallThickness) * Math.cos(Math.PI * (v) / capVerts); // x
            hcyldVerts[j + 1] = (botRadius - wallThickness) * Math.sin(Math.PI * (v) / capVerts); // y
            hcyldVerts[j + 2] = -1.0;
            hcyldVerts[j + 3] = 1.0; // r,g,b = botColr[]
            hcyldVerts[j + 4] = botColr[0];
            hcyldVerts[j + 5] = botColr[1];
            hcyldVerts[j + 6] = botColr[2];
        }
    }
}

function makeHollowCylinderAxes() {
    hcyldAxesVerts = new Float32Array([
        // Drawing Axes: Draw them using gl.LINES drawing primitive;
        // +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
        0.0, 0.0, 0.0, 1.0, 0.3, 0.3, 0.3, // X axis line (origin: gray)
        -5, 0.0, 0.0, 1.0, 1.0, 0.3, 0.3, //                       (endpoint: red)

        0.0, 0.0, 0.0, 1.0, 0.3, 0.3, 0.3, // Y axis line (origin: white)
        0.0, 5, 0.0, 1.0, 0.3, 1.0, 0.3, //                       (endpoint: green)

        0.0, 0.0, 0.0, 1.0, 0.3, 0.3, 0.3, // Z axis line (origin:white)
        0.0, 0.0, 5, 1.0, 0.3, 0.3, 1.0, //                       (endpoint: blue)
    ]);
}

function makeBodyCubes() {
    //==============================================================================
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    ubCubeVerts = new Float32Array([
        // Vertex coordinates and color
        -1.0, -1.0, -1.0, 1.0, 1, 1, 42 / 255, // v7 Black
        -1.0, -1.0, 1.0, 1.0, 227 / 255, 238 / 255, 81 / 255, // v2 Red
        1.0, -1.0, 1.0, 1.0, 223 / 255, 237 / 255, 72 / 255, // v3 Yellow
        1.0, -1.0, -1.0, 1.0, 254 / 255, 1, 43 / 255, // v4 Green
        1.0, 1.0, -1.0, 1.0, 227 / 255, 238 / 255, 81 / 255, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 254 / 255, 1, 43 / 255, // v1 Magenta
        -1.0, -1.0, 1.0, 1.0, 227 / 255, 238 / 255, 81 / 255, // v2 Red
        -1.0, -1.0, -1.0, 1.0, 1, 1, 42 / 255, // v7 Black

        //---------------------
        1.0, 1.0, 1.0, 1.0, 1, 1, 42 / 255, // v0 White
        -1.0, 1.0, 1.0, 1.0, 254 / 255, 1, 43 / 255, // v1 Magenta
        -1.0, -1.0, 1.0, 1.0, 227 / 255, 238 / 255, 81 / 255, // v2 Red
        1.0, -1.0, 1.0, 1.0, 223 / 255, 237 / 255, 72 / 255, // v3 Yellow
        1.0, -1.0, -1.0, 1.0, 254 / 255, 1, 43 / 255, // v4 Green
        1.0, 1.0, -1.0, 1.0, 227 / 255, 238 / 255, 81 / 255, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 254 / 255, 1, 43 / 255, // v1 Magenta
        1.0, 1.0, 1.0, 1.0, 1, 1, 42 / 255, // v0 White
    ]);

    mbCubeVerts = new Float32Array([
        // Vertex coordinates and color
        -1.0, -1.0, -1.0, 1.0, 1, 1, 1, // v7 Black
        -1.0, -1.0, 1.0, 1.0, 1, 1, 1, // v2 Red
        1.0, -1.0, 1.0, 1.0, 1, 1, 1, // v3 Yellow
        1.0, -1.0, -1.0, 1.0, 1, 1, 1, // v4 Green
        1.0, 1.0, -1.0, 1.0, 1, 1, 1, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 1, 1, 1, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 1, 1, 1, // v1 Magenta
        -1.0, -1.0, 1.0, 1.0, 1, 1, 1, // v2 Red
        -1.0, -1.0, -1.0, 1.0, 1, 1, 1, // v7 Black

        //---------------------
        1.0, 1.0, 1.0, 1.0, 1, 1, 1, // v0 White
        -1.0, 1.0, 1.0, 1.0, 1, 1, 1, // v1 Magenta
        -1.0, -1.0, 1.0, 1.0, 1, 1, 1, // v2 Red
        1.0, -1.0, 1.0, 1.0, 1, 1, 1, // v3 Yellow
        1.0, -1.0, -1.0, 1.0, 1, 1, 1, // v4 Green
        1.0, 1.0, -1.0, 1.0, 1, 1, 1, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 1, 1, 1, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 1, 1, 1, // v1 Magenta
        1.0, 1.0, 1.0, 1.0, 1, 1, 1 // v0 White
    ]);

    lbCubeVerts = new Float32Array([
        // Vertex coordinates and color
        -1.0, -1.0, -1.0, 1.0, 183 / 255, 99 / 255, 60 / 255, // v7 Black
        -1.0, -1.0, 1.0, 1.0, 92 / 255, 40 / 255, 25 / 255, // v2 Red
        1.0, -1.0, 1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v3 Yellow
        1.0, -1.0, -1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v4 Green
        1.0, 1.0, -1.0, 1.0, 183 / 255, 99 / 255, 60 / 255, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v1 Magenta
        -1.0, -1.0, 1.0, 1.0, 92 / 255, 40 / 255, 25 / 255, // v2 Red
        -1.0, -1.0, -1.0, 1.0, 183 / 255, 99 / 255, 60 / 255, // v7 Black

        //---------------------
        1.0, 1.0, 1.0, 1.0, 239 / 255, 182 / 255, 76 / 255, // v0 White
        -1.0, 1.0, 1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v1 Magenta
        -1.0, -1.0, 1.0, 1.0, 92 / 255, 40 / 255, 25 / 255, // v2 Red
        1.0, -1.0, 1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v3 Yellow
        1.0, -1.0, -1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v4 Green
        1.0, 1.0, -1.0, 1.0, 183 / 255, 99 / 255, 60 / 255, // v5 Cyan
        -1.0, 1.0, -1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v6 Blue
        -1.0, 1.0, 1.0, 1.0, 237 / 255, 177 / 255, 80 / 255, // v1 Magenta
        1.0, 1.0, 1.0, 1.0, 239 / 255, 182 / 255, 76 / 255 // v0 White
    ]);
}

function makeArmCylinder() {
    //==============================================================================
    // Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
    // 'stepped spiral' design described in notes.
    // Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
    //
    var ctrColr = new Float32Array([0.2, 0.2, 0.2]); // dark gray
    var topColr = new Float32Array([0.4, 0.7, 0.4]); // light green
    var botColr = new Float32Array([0.5, 0.5, 1.0]); // light blue
    // var ctrColr = new Float32Array([0.8, 0.8, 0.2]); // dark gray
    // // var topColr = new Float32Array([0.5, 0.5, 0.05]); // light green
    // var topColr = new Float32Array([0.1, 0.2, 0.6]); // light green

    var botColr = new Float32Array([0.9, 0.9, 0.1]); // light blue
    var capVerts = 30; // # of vertices around the topmost 'cap' of the shape
    var botRadius = 1.6 / 50; // radius of bottom of cylinder (top always 1.0)

    var clyLength = 0.25;

    // Create a (global) array to hold this cylinder's vertices;
    armcyldVerts = new Float32Array(((capVerts * 6) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 

    // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
    // v counts vertices: j counts array elements (vertices * elements per vertex)
    for (v = 1, j = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
        // skip the first vertex--not needed.
        if (v % 2 == 0) { // put even# vertices at center of cylinder's top cap:
            armcyldVerts[j] = 0.0; // x,y,z,w == 0,0,1,1
            armcyldVerts[j + 1] = 0.0;
            armcyldVerts[j + 2] = clyLength;
            armcyldVerts[j + 3] = 1.0; // r,g,b = topColr[]
            armcyldVerts[j + 4] = ctrColr[0];
            armcyldVerts[j + 5] = ctrColr[1];
            armcyldVerts[j + 6] = ctrColr[2];
        } else { // put odd# vertices around the top cap's outer edge;
            // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
            //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
            armcyldVerts[j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            armcyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            //  (Why not 2*PI? because 0 < =v < 2*capVerts, so we
            //   can simplify cos(2*PI * (v-1)/(2*capVerts))
            armcyldVerts[j + 2] = clyLength; // z
            armcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            armcyldVerts[j + 4] = topColr[0];
            armcyldVerts[j + 5] = topColr[1];
            armcyldVerts[j + 6] = topColr[2];
        }
    }
    // Create the cylinder side walls, made of 2*capVerts vertices.
    // v counts vertices within the wall; j continues to count array elements
    for (v = 0; v < 2 * capVerts; v++, j += floatsPerVertex) {
        if (v % 2 == 0) // position all even# vertices along top cap:
        {
            armcyldVerts[j] = botRadius * Math.cos(Math.PI * (v) / capVerts); // x
            armcyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
            armcyldVerts[j + 2] = clyLength; // z
            armcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            armcyldVerts[j + 4] = topColr[0];
            armcyldVerts[j + 5] = topColr[1];
            armcyldVerts[j + 6] = topColr[2];
        } else // position all odd# vertices along the bottom cap:
        {
            armcyldVerts[j] = botRadius * Math.cos(Math.PI * (v - 1) / capVerts); // x
            armcyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v - 1) / capVerts); // y
            armcyldVerts[j + 2] = 0.0; // z
            armcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            armcyldVerts[j + 4] = botColr[0];
            armcyldVerts[j + 5] = botColr[1];
            armcyldVerts[j + 6] = botColr[2];
        }
    }
    // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
    // v counts the vertices in the cap; j continues to count array elements
    for (v = 0; v < (2 * capVerts - 1); v++, j += floatsPerVertex) {
        if (v % 2 == 0) { // position even #'d vertices around bot cap's outer edge
            armcyldVerts[j] = botRadius * Math.cos(Math.PI * (v) / capVerts); // x
            armcyldVerts[j + 1] = botRadius * Math.sin(Math.PI * (v) / capVerts); // y
            armcyldVerts[j + 2] = 0.0; // z
            armcyldVerts[j + 3] = 1.0; // w.
            // r,g,b = topColr[]
            armcyldVerts[j + 4] = botColr[0];
            armcyldVerts[j + 5] = botColr[1];
            armcyldVerts[j + 6] = botColr[2];
        } else { // position odd#'d vertices at center of the bottom cap:
            armcyldVerts[j] = 0.0; // x,y,z,w == 0,0,-1,1
            armcyldVerts[j + 1] = 0.0;
            armcyldVerts[j + 2] = 0.0;
            armcyldVerts[j + 3] = 1.0; // r,g,b = botColr[]
            armcyldVerts[j + 4] = botColr[0];
            armcyldVerts[j + 5] = botColr[1];
            armcyldVerts[j + 6] = botColr[2];
        }
    }
}

function makeArmAxes() {
    armAxesVerts = new Float32Array([
        // Drawing Axes: Draw them using gl.LINES drawing primitive;
        // +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
        0.0, 0.0, 0.0, 1.0, 0.3, 0.3, 0.3, // X axis line (origin: gray)
        10, 0.0, 0.0, 1.0, 1.0, 0.3, 0.3, //                       (endpoint: red)

        0.0, 0.0, 0.0, 1.0, 0.3, 0.3, 0.3, // Y axis line (origin: white)
        0.0, 10, 0.0, 1.0, 0.3, 1.0, 0.3, //                       (endpoint: green)

        0.0, 0.0, 0.0, 1.0, 0.3, 0.3, 0.3, // Z axis line (origin:white)
        0.0, 0.0, 10, 1.0, 0.3, 0.3, 1.0 //                       (endpoint: blue)
    ]);
}

function makeEyeSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 100; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = slices * 2 + 1; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var topColr = new Float32Array([1, 1, 1]); // North Pole: light gray
    var equColr = new Float32Array([1, 1, 1]); // Equator:    bright green
    var botColr = new Float32Array([1, 1, 1]); // South Pole: brightest gray.
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    sphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                sphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts[j + 2] = cos0;
                sphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                sphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts[j + 2] = cos1; // z
                sphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                sphVerts[j + 4] = topColr[0];
                sphVerts[j + 5] = topColr[1];
                sphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                sphVerts[j + 4] = botColr[0];
                sphVerts[j + 5] = botColr[1];
                sphVerts[j + 6] = botColr[2];
            } else {
                sphVerts[j + 4] = botColr[0]; // equColr[0]; 
                sphVerts[j + 5] = botColr[1]; // equColr[1]; 
                sphVerts[j + 6] = botColr[2]; // equColr[2];                 
            }
        }
    }
}

function makeEyeballSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 100; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = slices * 2 + 1; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var topColr = new Float32Array([0, 0, 0]); // North Pole: light gray
    var equColr = new Float32Array([0, 0, 0]); // Equator:    bright green
    var botColr = new Float32Array([0, 0, 0]); // South Pole: brightest gray.
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    ebSphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                ebSphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                ebSphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                ebSphVerts[j + 2] = cos0;
                ebSphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                ebSphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                ebSphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                ebSphVerts[j + 2] = cos1; // z
                ebSphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                ebSphVerts[j + 4] = topColr[0];
                ebSphVerts[j + 5] = topColr[1];
                ebSphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                ebSphVerts[j + 4] = botColr[0];
                ebSphVerts[j + 5] = botColr[1];
                ebSphVerts[j + 6] = botColr[2];
            } else {
                ebSphVerts[j + 4] = botColr[0]; // equColr[0]; 
                ebSphVerts[j + 5] = botColr[1]; // equColr[1]; 
                ebSphVerts[j + 6] = botColr[2]; // equColr[2];                 
            }
        }
    }
}

function makeNoseSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 30; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = slices * 2 + 1; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var topColr = new Float32Array([0.9, 0.9, 0]); // North Pole: light gray
    var equColr = new Float32Array([1, 1, 0]); // Equator:    bright green
    var botColr = new Float32Array([0.9, 0.9, 0]); // South Pole: brightest gray.
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    noseSphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices / 2; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                noseSphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                noseSphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                noseSphVerts[j + 2] = cos0;
                noseSphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                noseSphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                noseSphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                noseSphVerts[j + 2] = cos1; // z
                noseSphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                noseSphVerts[j + 4] = topColr[0];
                noseSphVerts[j + 5] = topColr[1];
                noseSphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                noseSphVerts[j + 4] = botColr[0];
                noseSphVerts[j + 5] = botColr[1];
                noseSphVerts[j + 6] = botColr[2];
            } else {
                noseSphVerts[j + 4] = botColr[0]; // equColr[0]; 
                noseSphVerts[j + 5] = botColr[1]; // equColr[1]; 
                noseSphVerts[j + 6] = botColr[2]; // equColr[2];               
            }
        }
    }
    for (s = slices / 2; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                noseSphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                noseSphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                noseSphVerts[j + 2] = noseSphVerts[j - floatsPerVertex + 2];
                noseSphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                noseSphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                noseSphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                noseSphVerts[j + 2] = noseSphVerts[j - floatsPerVertex + 2];
                noseSphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                noseSphVerts[j + 4] = topColr[0];
                noseSphVerts[j + 5] = topColr[1];
                noseSphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                noseSphVerts[j + 4] = botColr[0];
                noseSphVerts[j + 5] = botColr[1];
                noseSphVerts[j + 6] = botColr[2];
            } else {
                noseSphVerts[j + 4] = botColr[0]; // equColr[0]; 
                noseSphVerts[j + 5] = botColr[1]; // equColr[1]; 
                noseSphVerts[j + 6] = botColr[2]; // equColr[2];                 
            }
        }
    }
}

function makeMouseSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 30; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = slices * 2 + 1; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var topColr = new Float32Array([103 / 255, 0, 0]); // North Pole: light gray
    var equColr = new Float32Array([1, 0, 0]); // Equator:    bright green
    var botColr = new Float32Array([103 / 255, 0, 0]); // South Pole: brightest gray.
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    mouseSphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them. 
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices; 
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices / 2; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                mouseSphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                mouseSphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                if (mouseSphVerts[j + 1] < 0) {
                    mouseSphVerts[j + 1] = 0;
                }
                mouseSphVerts[j + 2] = cos0;
                mouseSphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                mouseSphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                mouseSphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                if (mouseSphVerts[j + 1] < 0) {
                    mouseSphVerts[j + 1] = 0;
                }
                mouseSphVerts[j + 2] = cos1; // z
                mouseSphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                mouseSphVerts[j + 4] = topColr[0];
                mouseSphVerts[j + 5] = topColr[1];
                mouseSphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                mouseSphVerts[j + 4] = botColr[0];
                mouseSphVerts[j + 5] = botColr[1];
                mouseSphVerts[j + 6] = botColr[2];
            } else {
                mouseSphVerts[j + 4] = botColr[0]; // equColr[0]; 
                mouseSphVerts[j + 5] = botColr[1]; // equColr[1]; 
                mouseSphVerts[j + 6] = botColr[2]; // equColr[2];               
            }
        }
    }
    for (s = slices / 2; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
                mouseSphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                mouseSphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                if (mouseSphVerts[j + 1] < 0) {
                    mouseSphVerts[j + 1] = 0;
                }
                mouseSphVerts[j + 2] = mouseSphVerts[j - floatsPerVertex + 2];
                mouseSphVerts[j + 3] = 1.0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //                  theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                mouseSphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                mouseSphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                if (mouseSphVerts[j + 1] < 0) {
                    mouseSphVerts[j + 1] = 0;
                }
                mouseSphVerts[j + 2] = mouseSphVerts[j - floatsPerVertex + 2];
                mouseSphVerts[j + 3] = 1.0; // w.        
            }
            if (s == 0) { // finally, set some interesting colors for vertices:
                mouseSphVerts[j + 4] = topColr[0];
                mouseSphVerts[j + 5] = topColr[1];
                mouseSphVerts[j + 6] = topColr[2];
            } else if (s == slices - 1) {
                mouseSphVerts[j + 4] = botColr[0];
                mouseSphVerts[j + 5] = botColr[1];
                mouseSphVerts[j + 6] = botColr[2];
            } else {
                mouseSphVerts[j + 4] = botColr[0]; // equColr[0]; 
                mouseSphVerts[j + 5] = botColr[1]; // equColr[1]; 
                mouseSphVerts[j + 6] = botColr[2]; // equColr[2];                 
            }
        }
    }
}