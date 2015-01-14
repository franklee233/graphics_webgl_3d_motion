// Hangbin Li - EECS 351 Project B
// main javascript file

// todo: multiple vbo

// Vertex shader program
var VSHADER_SOURCE =
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ModelMatrix * a_Position;\n' +
    '  gl_PointSize = 1.0;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

function globalVariableDeclare() {
    // Global variables
    ANGLE_STEP = 45.0; // Rotation angle rate (degrees/second)
    floatsPerVertex = 7; // # of Float32Array elements used for each vertex

    // Global variables of perspective camera parameters
    // need cavans pre-defined
    projectionFlag = 1; // projection type of lower-right canvas, '=1' means perspective projection
    persFov = 40, persAspect = canvas.width / canvas.height, persNear = 1, persFar = 12;
    g_orthLeft = -2.5, g_orthRight = 2.5, g_orthBottom = -2.0, g_orthTop = 2.0, g_orthNear = -28.0, g_orthFar = 40.0;

    // Global vars for Eye position. 
    // NOTE!  I moved eyepoint BACKWARDS from the forest: from g_EyeZ=0.25
    // a distance far enough away to see the whole 'forest' of trees within the
    // 30-degree field-of-view of our 'perspective' camera.  I ALSO increased
    // the 'keydown()' function's effect on g_EyeX position.
    g_EyeX = -1, g_EyeY = -5, g_EyeZ = -1;
    g_LookX = 0, g_LookY = 0, g_LookZ = 0;
    g_UpX = 0, g_UpY = 0, g_UpZ = -1;
    g_lookRadius = Math.sqrt((g_EyeX - g_LookX) * (g_EyeX - g_LookX) +
        (g_EyeY - g_LookY) * (g_EyeY - g_LookY) + (g_EyeZ - g_LookZ) * (g_EyeZ - g_LookZ));
    // console.log(g_lookRadius);
    g_xyRotateAngle = (Math.asin((g_EyeX - g_LookX) / g_lookRadius) / Math.PI * 180) % 360;
    // console.log(g_xyRotateAngle);
    g_zRotateAngle = (Math.asin((g_EyeZ - g_LookZ) / g_lookRadius) / Math.PI * 180) % 360;

    // Flying-airplane control, cube
    g_velocity = 0.05;
    g_planeAngleX = 0, g_planeAngleY = 0, g_planeAngleZ = 0;
    g_autoTransX = 0, g_autoTransY = 0, g_autoTransZ = 0;

    // toy parametes
    g_noseScale = 1;
}

function main() {
    //==============================================================================
    // Retrieve <canvas> element
    // var canvas = document.getElementById('webgl');
    writeHelp2Html();
    // re-size that canvas to fit the browser-window size:
    // canvas defined inside
    winResize(); // (HTML file also calls it on browser-resize events)

    // declare global variables
    globalVariableDeclare();

    // Get the rendering context for WebGL
    // var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
    // unless the new Z value is closer to the eye than the old one..
    //  gl.depthFunc(gl.LESS);           // WebGL default setting: (default)
    gl.enable(gl.DEPTH_TEST);

    var currentAngle = 45.0;

    //register in another file
    registerQuaternion();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.2, 0.2, 0.2, 1.0);

    // Get the storage locations of u_ModelMatrix and u_ProjMatrix variables, Global variables
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ModelMatrix || !u_ProjMatrix) {
        console.log('Failed to get u_ModelMatrix or u_ProjMatrix');
        return;
    }

    // Create the matrix to specify the view matrix, Global variable
    modelMatrix = new Matrix4();

    // Set the vertex coordinates and color (the blue triangle is in the front)
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to specify the vertex infromation');
        return;
    }

    // Start drawing: create 'tick' variable whose value is this function:
    var tick = function() {
        // Register the event handler to be called on key press
        document.onkeydown = function(ev) {
            keydown(ev, currentAngle);
        };
        winResize();

        currentAngle = animate(currentAngle); // Update the rotation angle
        draw(gl, currentAngle); // Draw shapes

        // initVertexBuffer2();
        requestAnimationFrame(tick, canvas);
        // Request that the browser re-draw the webpage
    };
    tick(); // start (and continue) animation: draw current image
}

function initVertexBuffers(gl) {
    //==============================================================================
    // Create one giant vertex buffer object (VBO) that holds all vertices for all
    // shapes.

    // Make our 'ground plane'
    makeGroundGrid();

    // make 3d axis
    makeAxes();

    // create, fill the coneVerts array
    makeCone();

    // make hemisphere
    makeHemiSphere();

    // make hemicube
    makeHemiCube();

    // make hollow cylinder
    makeHollowCylinder();
    makeHollowCylinderAxes();

    //------------------------------------------
    // make toy body cubes
    makeBodyCubes();

    // make toy arm cylinder
    makeArmCylinder();
    makeArmAxes();

    // make eye sphere
    makeEyeSphere();

    // make eyeball sphere
    makeEyeballSphere();

    // make nose hemisphere
    makeNoseSphere();

    // make nose hemisphere
    makeMouseSphere();

    // How much space to store all the shapes in one array?
    // (no 'var' means this is a global variable)
    mySiz = gndVerts.length + axesVerts.length + coneVerts.length + hsphVerts.length;
    mySiz += hcubeVerts.length + hcyldVerts.length + hcyldAxesVerts.length + ubCubeVerts.length;
    mySiz += mbCubeVerts.length + lbCubeVerts.length + armcyldVerts.length + armAxesVerts.length;
    mySiz += sphVerts.length + ebSphVerts.length + noseSphVerts.length + mouseSphVerts.length;

    // How many vertices total?
    var nn = mySiz / floatsPerVertex;
    // console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

    // Copy all shapes into one big Float32 array:
    var colorShapes = new Float32Array(mySiz);

    // Copy them:  remember where to start for each shape:
    gndStart = 0;
    for (i = 0, j = 0; j < gndVerts.length; i++, j++) {
        colorShapes[i] = gndVerts[j];
    }
    axesStart = i;
    for (j = 0; j < axesVerts.length; i++, j++) {
        colorShapes[i] = axesVerts[j];
    }
    coneStart = i;
    for (j = 0; j < coneVerts.length; i++, j++) {
        colorShapes[i] = coneVerts[j];
    }
    hsphStart = i;
    for (j = 0; j < hsphVerts.length; i++, j++) {
        colorShapes[i] = hsphVerts[j];
    }
    hcubeStart = i;
    for (j = 0; j < hcubeVerts.length; i++, j++) {
        colorShapes[i] = hcubeVerts[j];
    }
    hcyldStart = i;
    for (j = 0; j < hcyldVerts.length; i++, j++) {
        colorShapes[i] = hcyldVerts[j];
    }
    hcyldAxesStart = i;
    for (j = 0; j < hcyldAxesVerts.length; i++, j++) {
        colorShapes[i] = hcyldAxesVerts[j];
    }
    ubCubeStart = i;
    for (j = 0; j < ubCubeVerts.length; i++, j++) {
        colorShapes[i] = ubCubeVerts[j];
    }
    mbCubeStart = i;
    for (j = 0; j < mbCubeVerts.length; i++, j++) {
        colorShapes[i] = mbCubeVerts[j];
    }
    lbCubeStart = i;
    for (j = 0; j < lbCubeVerts.length; i++, j++) {
        colorShapes[i] = lbCubeVerts[j];
    }
    armcyldStart = i;
    for (j = 0; j < armcyldVerts.length; i++, j++) {
        colorShapes[i] = armcyldVerts[j];
    }
    armAxesStart = i;
    for (j = 0; j < armAxesVerts.length; i++, j++) {
        colorShapes[i] = armAxesVerts[j];
    }
    sphStart = i;
    for (j = 0; j < sphVerts.length; i++, j++) {
        colorShapes[i] = sphVerts[j];
    }
    ebSphStart = i;
    for (j = 0; j < ebSphVerts.length; i++, j++) {
        colorShapes[i] = ebSphVerts[j];
    }
    noseSphStart = i;
    for (j = 0; j < noseSphVerts.length; i++, j++) {
        colorShapes[i] = noseSphVerts[j];
    }
    mouseSphStart = i;
    for (j = 0; j < mouseSphVerts.length; i++, j++) {
        colorShapes[i] = mouseSphVerts[j];
    }

    // Create a buffer object
    var shapeBuffer = gl.createBuffer();
    if (!shapeBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Write vertex information to buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    var FSIZE = colorShapes.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(a_Position, floatsPerVertex - 3, gl.FLOAT, false, FSIZE * floatsPerVertex, 0);
    gl.enableVertexAttribArray(a_Position);
    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * floatsPerVertex, FSIZE * (floatsPerVertex - 3));
    gl.enableVertexAttribArray(a_Color);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return nn; // return # of vertices
}

function draw(gl, currentAngle) {
    //==============================================================================
    // Clear <canvas> color AND DEPTH buffer
    projMatrix = new Matrix4();
    projMatrix.setOrtho(g_orthLeft, g_orthRight, // left,right;
        g_orthBottom, g_orthTop, // bottom, top;
        g_orthNear, g_orthFar); // near, far; (always >=0)
    // projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw in the upper-left of several 'viewports'
    //------------------------------------------
    gl.viewport(0, // Viewport lower-left corner
        gl.drawingBufferHeight / 2, // location(in pixels)
        gl.drawingBufferWidth / 2, // viewport width, height.
        gl.drawingBufferHeight / 2);

    // but use a different 'view' matrix:
    modelMatrix.setLookAt(0, 0, -8, // eye position,
        0, 0, 0, // look-at point,
        0, 1, 0); // 'up' vector.

    // Pass the view projection matrix to our shaders:
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Draw the scene:
    drawMyScene(gl, currentAngle, u_ModelMatrix, modelMatrix);

    // Draw in the upper-right of several 'viewports'
    //------------------------------------------
    gl.viewport(gl.drawingBufferWidth / 2, // Viewport lower-left corner
        gl.drawingBufferHeight / 2, // location(in pixels)
        gl.drawingBufferWidth / 2, // viewport width, height.
        gl.drawingBufferHeight / 2);

    // but use a different 'view' matrix:
    modelMatrix.setLookAt(-0.5, -7, -0.7, // eye position,
        0, 0, 0, // look-at point,
        0, 0, -1); // 'up' vector.

    // Pass the view projection matrix to our shaders:
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Draw the scene:
    drawMyScene(gl, currentAngle, u_ModelMatrix, modelMatrix);

    // Draw in the lower-left of several 'viewports'
    //------------------------------------------
    gl.viewport(0, // Viewport lower-left corner
        0, // (x,y) location(in pixels)
        gl.drawingBufferWidth / 2, // viewport width, height.
        gl.drawingBufferHeight / 2);

    // Set the matrix to be used for to set the camera view
    modelMatrix.setLookAt(5, -0.5, -0.3, // eye position
        0, 0, 0, // look-at point (origin)
        0, 0, -1); // up vector (+y)

    // Pass the view projection matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Draw the scene:
    drawMyScene(gl, currentAngle, u_ModelMatrix, modelMatrix);

    // change orthographic to perspective
    if (projectionFlag == 1) {
        // global variables
        projMatrix.setPerspective(persFov, persAspect, persNear, persFar);
        gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    }

    // Draw in the lower-right of several 'viewports'
    //------------------------------------------
    gl.viewport(gl.drawingBufferWidth / 2, // Viewport lower-left corner
        0, // location(in pixels)
        gl.drawingBufferWidth / 2, // viewport width, height.
        gl.drawingBufferHeight / 2);

    // but use a different 'view' matrix:
    modelMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
        g_LookX, g_LookY, g_LookZ, // look-at point 
        g_UpX, g_UpY, g_UpZ); // up vector

    // Pass the view projection matrix to our shaders:
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Draw the scene:
    drawMyScene(gl, currentAngle, u_ModelMatrix, modelMatrix);
}

function drawMyScene(myGL, myCurrentAngle, myu_ModelMatrix, myModelMatrix) {
    //===============================================================================
    // Called ONLY from within the 'draw()' function
    // Assumes already-correctly-set View matrix and Proj matrix; 
    // draws all items in 'world' coords.

    // DON'T clear <canvas> or you'll WIPE OUT what you drew 
    // in all previous viewports!
    // myGL.clear(gl.COLOR_BUFFER_BIT);

    //===============================================================================
    // ground

    pushMatrix(myModelMatrix);
    myModelMatrix.scale(1, 1, -1); // convert to left-handed coord sys
    myModelMatrix.scale(0.2, 0.2, 0.2); // shrink the drawing axes

    //for nicer-looking ground-plane, and
    // Pass the modified view matrix to our shaders:
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);

    // Now, using these drawing axes, draw our ground plane: 
    myGL.drawArrays(myGL.LINES, // use this drawing primitive, and
        gndStart / floatsPerVertex, // start at this vertex number, and
        gndVerts.length / floatsPerVertex); // draw this many vertices

    //===============================================================================
    // world axes

    myModelMatrix.rotate(180, 0, 0, 1); // spin around y axis.
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.LINES, // use this drawing primitive, and
        axesStart / floatsPerVertex, // start at this vertex number, and
        6); // draw this many vertices.

    //===============================================================================
    // cone

    myModelMatrix.rotate(-180, 0, 0, 1); // spin around y axis.
    myModelMatrix.translate(-6, 3, 5.5);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        coneStart / floatsPerVertex, // start at this vertex number, and
        coneVerts.length / floatsPerVertex); // draw this many vertices.

    //===============================================================================
    // hemisphere

    myModelMatrix.scale(1.5, 1.5, 1.5);
    myModelMatrix.translate(3, 0, 0.3);
    myModelMatrix.rotate(180, 1, 0, 0); // spin around y axis.
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        hsphStart / floatsPerVertex, // start at this vertex number, and
        hsphVerts.length / floatsPerVertex); // draw this many vertices.

    //===============================================================================
    // extra credit: ‘flying-airplane’ navigation controls: forward velocity;; aiming by roll, pitch, yaw
    // hemicube

    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-1, 0, -0.5);
    myModelMatrix.scale(1, 1, 1);
    myModelMatrix.translate(4 + g_autoTransX, 0 + g_autoTransY, 1 + g_autoTransZ);
    myModelMatrix.rotate(-180 + g_planeAngleX, 1, 0, 0); // spin around y axis.
    myModelMatrix.rotate(g_planeAngleY, 0, 0, 1); // spin around y axis.
    myModelMatrix.rotate(g_planeAngleZ, 0, 1, 0); // spin around y axis.
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        hcubeStart / floatsPerVertex, // start at this vertex number, and
        hcubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        (hcubeStart + hcubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        hcubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //===============================================================================
    // extra credit: quanternion-based ‘trackball’ control of orientation for at least one on-screen object.
    // hollow cylinder and its axes

    myModelMatrix.translate(5.6, 0, 0.5);
    myModelMatrix.rotate(-90, 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.6, 0.6, 0.6);

    quatMatrix.setFromQuat(qTot.x, -qTot.y, -qTot.z, qTot.w); // Quaternion-->Matrix
    myModelMatrix.concat(quatMatrix); // apply that matrix.

    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        hcyldStart / floatsPerVertex, // start at this vertex number, and
        hcyldVerts.length / floatsPerVertex); // draw this many vertices.
    myGL.drawArrays(myGL.LINES, hcyldAxesStart / floatsPerVertex, hcyldAxesVerts.length / floatsPerVertex); // start at vertex #12; draw 6 vertices

    myModelMatrix = popMatrix();

    //===============================================================================
    //-------------------------------------------------------------------------------
    // toy upper body cube
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.625, -0.3925, -0.72);
    myModelMatrix.scale(0.22, 0.1, 0.25);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        ubCubeStart / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        (ubCubeStart + ubCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // toy mid body cube
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.625, -0.395, -0.4);
    myModelMatrix.scale(0.23, 0.1, 0.05);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        mbCubeStart / floatsPerVertex, // start at this vertex number, and
        mbCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        (mbCubeStart + mbCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        mbCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // toy lower body cube
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.625, -0.395, -0.3);
    myModelMatrix.scale(0.22, 0.1, 0.06);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        lbCubeStart / floatsPerVertex, // start at this vertex number, and
        lbCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        (lbCubeStart + lbCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        lbCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // left arm cylinder and hand
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.38, -0.38, -0.62);
    myModelMatrix.rotate(myCurrentAngle, 0, 1, 0);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        armcyldStart / floatsPerVertex, // start at this vertex number, and
        armcyldVerts.length / floatsPerVertex);

    myModelMatrix.translate(0, 0, 0.25);
    myModelMatrix.rotate((myCurrentAngle - 45) * 2, 1, 0, 0);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        armcyldStart / floatsPerVertex, // start at this vertex number, and
        armcyldVerts.length / floatsPerVertex);

    myModelMatrix.translate(0, -0.02, 0.25);
    myModelMatrix.rotate((myCurrentAngle - 75), 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.05, 0.05, 0.02);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        ubCubeStart / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        (ubCubeStart + ubCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.

    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // right arm cylinder and hand and axes
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.88, -0.38, -0.62);
    myModelMatrix.rotate(-myCurrentAngle, 0, 1, 0);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        armcyldStart / floatsPerVertex, // start at this vertex number, and
        armcyldVerts.length / floatsPerVertex); // draw this many vertices.


    myModelMatrix.translate(0, 0, 0.25);
    myModelMatrix.rotate(-(myCurrentAngle - 45) * 2, 1, 0, 0);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        armcyldStart / floatsPerVertex, // start at this vertex number, and
        armcyldVerts.length / floatsPerVertex);

    // axes
    myModelMatrix.translate(0, 0, 0.25);
    myModelMatrix.scale(0.1, 0.1, 0.1);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.LINES, // use this drawing primitive, and
        armAxesStart / floatsPerVertex, // start at this vertex number, and
        armAxesVerts.length / floatsPerVertex); // draw this many vertices.

    // hand
    myModelMatrix.translate(0, -0.02, 0.25);
    myModelMatrix.rotate((myCurrentAngle - 75), 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.5, 0.5, 0.2);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        ubCubeStart / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        (ubCubeStart + ubCubeVerts.length / 2) / floatsPerVertex, // start at this vertex number, and
        ubCubeVerts.length / 2 / floatsPerVertex); // draw this many vertices.

    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // left leg cylinder
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.48, -0.38, -0.22);
    myModelMatrix.rotate((myCurrentAngle - 45), 1, 0, 0);
    myModelMatrix.scale(0.8, 0.8, 1);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        armcyldStart / floatsPerVertex, // start at this vertex number, and
        armcyldVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // right leg cylinder
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.78, -0.38, -0.22);
    myModelMatrix.rotate(-(myCurrentAngle - 45), 1, 0, 0);
    myModelMatrix.scale(0.8, 0.8, 1);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        armcyldStart / floatsPerVertex, // start at this vertex number, and
        armcyldVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // left eye sphere
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.52, -0.48, -0.82);
    myModelMatrix.rotate(0, 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.09, 0.09, 0.09);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        sphStart / floatsPerVertex, // start at this vertex number, and
        sphVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // left eyeball sphere
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.53 - myCurrentAngle / 5000, -0.56, -0.81 + myCurrentAngle / 5000);
    myModelMatrix.rotate(0, 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.03, 0.03, 0.03);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        ebSphStart / floatsPerVertex, // start at this vertex number, and
        ebSphVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // right eye sphere
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.72, -0.48, -0.82);
    myModelMatrix.rotate(0, 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.09, 0.09, 0.09);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        sphStart / floatsPerVertex, // start at this vertex number, and
        sphVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // right eyeball sphere
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.70 - myCurrentAngle / 5000, -0.56, -0.81 + myCurrentAngle / 5000);
    myModelMatrix.rotate(0, 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.03, 0.03, 0.03);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_FAN, // use this drawing primitive, and
        ebSphStart / floatsPerVertex, // start at this vertex number, and
        ebSphVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // nose
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.62, -0.38, -0.72);
    myModelMatrix.rotate(90 - myCurrentAngle / 5, 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.03, 0.03, 0.3 * g_noseScale);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        noseSphStart / floatsPerVertex, // start at this vertex number, and
        noseSphVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();

    //-------------------------------------------------------------------------------
    // mouse
    pushMatrix(myModelMatrix);
    myModelMatrix.translate(-0.62, -0.5, -0.62);
    myModelMatrix.rotate(myCurrentAngle / 5 - 15, 1, 0, 0); // spin around y axis.
    myModelMatrix.scale(0.1, 0.1, 0.1);
    myGL.uniformMatrix4fv(myu_ModelMatrix, false, myModelMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, // use this drawing primitive, and
        mouseSphStart / floatsPerVertex, // start at this vertex number, and
        mouseSphVerts.length / floatsPerVertex); // draw this many vertices.
    myModelMatrix = popMatrix();
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
    //==============================================================================
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;

    // Hemicube
    if (g_autoTransX >= 2.5 || g_autoTransX <= -2.5) {
        g_velocity *= -1;
    }
    if (g_autoTransY >= 2.5 || g_autoTransY <= -2.5) {
        g_velocity *= -1;
    }
    if (g_autoTransZ >= 2.5 || g_autoTransZ <= -2.5) {
        g_velocity *= -1;
    }
    g_autoTransX += g_velocity * Math.cos(g_planeAngleX / 180 * Math.PI) * Math.sin(g_planeAngleY / 180 * Math.PI);
    g_autoTransY += g_velocity * Math.cos(g_planeAngleX / 180 * Math.PI) * Math.cos(g_planeAngleY / 180 * Math.PI);
    g_autoTransZ += g_velocity * Math.sin(g_planeAngleX / 180 * Math.PI);

    if (angle > 75.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
    if (angle < 15.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;

    return newAngle %= 360;
}

//==================HTML Button Callbacks==================

function keydown(ev, currentAngle) {
    //HTML calls this'Event handler' or 'callback function' when we press a key:

    var e = ev.keyCode;

    if (e == 112 || e == 27) { // F1 Esc Help
        writeHelp2Html();
    }
    if (e == 191) {
        toggleProjection();
    }

    if (e == 219) { // [ - toy nose length decrease
        g_noseScale -= 0.05;
        if (g_noseScale < 0) {
            g_noseScale = 0;
        }
    }
    if (e == 221) { // ] - toy nose length increase
        g_noseScale += 0.05;
    }

    // arrow keys - viewing angle
    if (e == 37) { // The left arrow key was pressed
        g_xyRotateAngle -= 2;
        g_xyRotateAngle %= 360;
        // console.log(g_xyRotateAngle);
        var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
        // console.log(xyLookRadius);
        g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
        g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
        // console.log(g_LookX, g_LookY, g_LookZ);
    }
    if (e == 39) { // The right arrow key was pressed
        g_xyRotateAngle += 2;
        g_xyRotateAngle %= 360;
        // console.log(g_xyRotateAngle);
        var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
        // console.log(xyLookRadius);
        g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
        g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
        // console.log(g_LookX, g_LookY, g_LookZ);
    }
    if (e == 38) { // The up arrow key was pressed
        g_zRotateAngle += 2;
        g_zRotateAngle %= 360;
        var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
        var zLookRadius = g_lookRadius * Math.sin(g_zRotateAngle / 180 * Math.PI);
        g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
        g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
        g_LookZ = g_EyeZ - zLookRadius;
    }
    if (e == 40) { // The down arrow key was pressed
        g_zRotateAngle -= 2;
        g_zRotateAngle %= 360;
        var xyLookRadius = g_lookRadius * Math.cos(g_zRotateAngle / 180 * Math.PI);
        var zLookRadius = g_lookRadius * Math.sin(g_zRotateAngle / 180 * Math.PI);
        g_LookX = g_EyeX - xyLookRadius * Math.sin(g_xyRotateAngle / 180 * Math.PI);
        g_LookY = g_EyeY + xyLookRadius * Math.cos(g_xyRotateAngle / 180 * Math.PI);
        g_LookZ = g_EyeZ - zLookRadius;
    }

    // ASDW FR, eye point position move
    if (e == 65) { // A
        g_EyeX += Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookX += Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeY += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookY += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
        g_LookZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
    }
    if (e == 68) { // D
        g_EyeX -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookX -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
        g_LookZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
    }
    if (e == 83) { // S
        g_EyeX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeY -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookY -= Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
        g_LookZ += Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
    }
    if (e == 87) { // W
        g_EyeX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeY += Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookY += Math.cos(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
        g_LookZ -= Math.sin(g_zRotateAngle / 180 * Math.PI) / 5;
    }
    if (e == 82) { // R
        g_EyeX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookX -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeY += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookY += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeZ -= Math.cos(g_zRotateAngle / 180 * Math.PI) / 5;
        g_LookZ -= Math.cos(g_zRotateAngle / 180 * Math.PI) / 5;
    }
    if (e == 70) { // F
        g_EyeX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookX += Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_LookY -= Math.sin(g_xyRotateAngle / 180 * Math.PI) / 5;
        g_EyeZ += Math.cos(g_zRotateAngle / 180 * Math.PI) / 5;
        g_LookZ += Math.cos(g_zRotateAngle / 180 * Math.PI) / 5;
    }

    draw(gl, currentAngle);
}

function toggleProjection() {
    if (projectionFlag == 0) {
        projectionFlag = 1;
    } else {
        projectionFlag = 0;
    }
}

function changeOrthParam(paramNum, paramFlag) {
    // projMatrix.setPerspective(persFov, persAspect, persNear, persFar);
    if (paramNum == 0) {
        if (paramFlag == 0) {
            g_orthLeft -= 1;
        }
        if (paramFlag == 1) {
            g_orthLeft += 1;
        }
    }
    if (paramNum == 1) {
        if (paramFlag == 0) {
            g_orthRight -= 0.01;
        }
        if (paramFlag == 1) {
            g_orthRight += 0.01;
        }
    }
    if (paramNum == 2) {
        if (paramFlag == 0) {
            g_orthBottom -= 1;
        }
        if (paramFlag == 1) {
            g_orthBottom += 1;
        }
    }
    if (paramNum == 3) {
        if (paramFlag == 0) {
            g_orthTop -= 1;
        }
        if (paramFlag == 1) {
            g_orthTop += 1;
        }
    }
    if (paramNum == 4) {
        if (paramFlag == 0) {
            g_orthNear -= 1;
        }
        if (paramFlag == 1) {
            g_orthNear += 1;
        }
    }
    if (paramNum == 5) {
        if (paramFlag == 0) {
            g_orthFar -= 1;
        }
        if (paramFlag == 1) {
            g_orthFar += 1;
        }
    }
    if (paramNum == 6) {
        g_orthLeft = -2.5, g_orthRight = 2.5, g_orthBottom = -2.0, g_orthTop = 2.0, g_orthNear = -28.0, g_orthFar = 40.0;
    }
}

function changePersParam(paramNum, paramFlag) {
    // projMatrix.setPerspective(persFov, persAspect, persNear, persFar);
    if (paramNum == 0) {
        if (paramFlag == 0) {
            persFov -= 1;
        }
        if (paramFlag == 1) {
            persFov += 1;
        }
    }
    if (paramNum == 1) {
        if (paramFlag == 0) {
            persAspect -= 0.01;
        }
        if (paramFlag == 1) {
            persAspect += 0.01;
        }
    }
    if (paramNum == 2) {
        if (paramFlag == 0 && persNear >= 2) {
            persNear -= 1;
        }
        if (paramFlag == 1 && persFar - persNear >= 2) {
            persNear += 1;
        }
    }
    if (paramNum == 3) {
        if (paramFlag == 0 && persFar >= 3 && persFar - persNear >= 2) {
            persFar -= 1;
        }
        if (paramFlag == 1) {
            persFar += 1;
        }
    }
    if (paramNum == 4) {
        persFov = 40;
        persAspect = canvas.width / canvas.height; // need cavans pre-defined
        persNear = 1;
        persFar = 100;
    }
}

function changePlaneParam(paramNum, paramFlag) {
    // forward velocity; aiming by roll, pitch, yaw
    if (paramNum == 0) {
        if (paramFlag == 0) {
            g_velocity -= 0.01;
            g_velocity -= 0.01;
        }
        if (paramFlag == 1) {
            g_velocity += 0.01;
            g_velocity += 0.01;
        }
    }
    if (paramNum == 1) {
        if (paramFlag == 0) {
            g_planeAngleX -= 1;
        }
        if (paramFlag == 1) {
            g_planeAngleX += 1;
        }
    }
    if (paramNum == 2) {
        if (paramFlag == 0) {
            g_planeAngleY -= 1;
        }
        if (paramFlag == 1) {
            g_planeAngleY += 1;
        }
    }
    if (paramNum == 3) {
        if (paramFlag == 0) {
            g_planeAngleZ -= 1;
        }
        if (paramFlag == 1) {
            g_planeAngleZ += 1;
        }
    }
    if (paramNum == 4) {
        g_velocityX = -0.04, g_velocityY = -0.04;
        g_planeAngleX = 0, g_planeAngleY = 0, g_planeAngleZ = 0;
        g_autoTransX = 0, g_autoTransY = 0, g_autoTransZ = 0;
    }
}

function writeHelp2Html() {
    var helpContent;
    if (document.getElementById("help_control_div").innerHTML == "") {
        helpContent =
            "F1 / Esc: show / hide help. <br>" +
            "'/' Key:  toggle projection. <br>" +
            "Left / Right Arrow Key: y-axis rotate of last view. <br>" +
            "Up / Down Arrow Keys: x-axis rotate of last view.<br>" +
            "[  ]: adjust nose length <br>" +
            "A / S / D / W: move camera in plain. <br>" +
            "F / R: move camera in altitude. <br>";

        document.getElementById("help_control_div").innerHTML = helpContent;
        document.getElementById("help_btn").value = " Hide Help ";
    } else {
        document.getElementById("help_control_div").innerHTML = "";
        document.getElementById("help_btn").value = " Show Help ";
    }

    var helpContent;
    if (document.getElementById("help_animation_div").innerHTML == "") {
        helpContent =
            "<p>Animation: <br>" +
            "1. (body+arm1+arm2+hand) rotate<br>" +
            "2. legs rotate <br>" +
            "3. mouse open / close (rorate)<br>" +
            "4. nose swing <br>" +
            "5. eyeboll rotate <br>";

        document.getElementById("help_animation_div").innerHTML = helpContent;
        document.getElementById("help_btn").value = " Hide Help ";
    } else {
        document.getElementById("help_animation_div").innerHTML = "";
        document.getElementById("help_btn").value = " Show Help ";
    }
}

function winResize() {
    //==============================================================================
    // Called when user re-sizes their browser window , because our HTML file
    // contains:  <body onload="main()" onresize="winResize()">
    canvas = document.getElementById('webgl'); // get current canvas, Global
    gl = getWebGLContext(canvas); // and context:, Global
    //Make canvas fill the top 3/4 of our browser window:
    canvas.width = innerWidth * 3 / 4;
    canvas.height = innerHeight;
    //IMPORTANT!  need to re-draw screen contents
    // draw(nuGL);
}