// Hangbin Li - EECS 351 Project B
// quaternion part javascript file

function registerQuaternion() {

    // Global vars for mouse click-and-drag for rotation.
    isDrag = false; // mouse-drag: true when user holds down mouse button
    xMclik = 0.0; // last mouse button-down position (in CVV coords)
    yMclik = 0.0;
    xMdragTot = 0.0; // total (accumulated) mouse-drag amounts (in CVV coords).
    yMdragTot = 0.0;

    qNew = new Quaternion(0, 0, 0, 1); // most-recent mouse drag's rotation
    qTot = new Quaternion(0, 0, 0, 1); // 'current' orientation (made from qNew)
    quatMatrix = new Matrix4(); // rotation matrix, made from latest qTot

    canvas.onmousedown = function(ev) {
        myMouseDown(ev, gl, canvas)
    };
    // when user's mouse button goes down, call mouseDown() function
    canvas.onmousemove = function(ev) {
        myMouseMove(ev, gl, canvas)
    };
    // when the mouse moves, call mouseMove() function                  
    canvas.onmouseup = function(ev) {
        myMouseUp(ev, gl, canvas)
    };
}

function myMouseDown(ev, gl, canvas) {
    //==============================================================================
    // Called when user PRESSES down any mouse button;
    //                                  (Which button?    console.log('ev.button='+ev.button);   )
    //      ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
    //      pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

    // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
    var xp = ev.clientX - rect.left; // x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
    //  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);

    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width / 2) / // move origin to center of canvas and
    (canvas.width / 2); // normalize canvas to -1 <= x < +1,
    var y = (yp - canvas.height / 2) / //                                        -1 <= y < +1.
    (canvas.height / 2);
    //  console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);

    isDrag = true; // set our mouse-dragging flag
    xMclik = x; // record where mouse-dragging began
    yMclik = y;
};


function myMouseMove(ev, gl, canvas) {
    //==============================================================================
    // Called when user MOVES the mouse with a button already pressed down.
    //                                  (Which button?   console.log('ev.button='+ev.button);    )
    //      ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
    //      pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

    if (isDrag == false) return; // IGNORE all mouse-moves except 'dragging'

    // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
    var xp = ev.clientX - rect.left; // x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
    //  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);

    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width / 2) / // move origin to center of canvas and
    (canvas.width / 2); // normalize canvas to -1 <= x < +1,
    var y = (yp - canvas.height / 2) / //                                        -1 <= y < +1.
    (canvas.height / 2);

    // find how far we dragged the mouse:
    xMdragTot += (x - xMclik); // Accumulate change-in-mouse-position,&
    yMdragTot += (y - yMclik);
    // AND use any mouse-dragging we found to update quaternions qNew and qTot.
    dragQuat(x - xMclik, y - yMclik);

    xMclik = x; // Make NEXT drag-measurement from here.
    yMclik = y;

    // // Show it on our webpage, in the <div> element named 'MouseText':
    document.getElementById('quaternion_mouse_text').innerHTML =
        'Mouse Drag totals (CVV x,y coords):\t' +
        xMdragTot.toFixed(5) + ', \t' +
        yMdragTot.toFixed(5);
};

function myMouseUp(ev, gl, canvas) {
    //==============================================================================
    // Called when user RELEASES mouse button pressed previously.
    //                                  (Which button?   console.log('ev.button='+ev.button);    )
    //      ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
    //      pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

    // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
    var xp = ev.clientX - rect.left; // x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
    //  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);

    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width / 2) / // move origin to center of canvas and
    (canvas.width / 2); // normalize canvas to -1 <= x < +1,
    var y = (yp - canvas.height / 2) / //                                        -1 <= y < +1.
    (canvas.height / 2);
    //  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);

    isDrag = false; // CLEAR our mouse-dragging flag, and
    // accumulate any final bit of mouse-dragging we did:
    xMdragTot += (x - xMclik);
    yMdragTot += (y - yMclik);
    //  console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);

    // AND use any mouse-dragging we found to update quaternions qNew and qTot;
    dragQuat(x - xMclik, y - yMclik);

    // Show it on our webpage, in the <div> element named 'MouseText':
    document.getElementById('quaternion_mouse_text').innerHTML =
        'Mouse Drag totals (CVV x,y coords):\t' +
        xMdragTot.toFixed(5) + ', \t' +
        yMdragTot.toFixed(5);
};

function dragQuat(xdrag, ydrag) {
    //==============================================================================
    // Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
    // We find a rotation axis perpendicular to the drag direction, and convert the 
    // drag distance to an angular rotation amount, and use both to set the value of 
    // the quaternion qNew.  We then combine this new rotation with the current 
    // rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
    // 'draw()' function converts this current 'qTot' quaternion to a rotation 
    // matrix for drawing. 
    var res = 5;
    var qTmp = new Quaternion(0, 0, 0, 1);

    var dist = Math.sqrt(xdrag * xdrag + ydrag * ydrag);
    // console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
    qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist * 150.0);
    // (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
    // why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
    // -- to rotate around +x axis, drag mouse in -y direction.
    // -- to rotate around +y axis, drag mouse in +x direction.

    qTmp.multiply(qNew, qTot); // apply new rotation to current rotation. 

    qTmp.normalize(); // normalize to ensure we stay at length==1.0.
    qTot.copy(qTmp);

    // show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
    document.getElementById('quaternion_value').innerHTML =
        'X=' + qTot.x.toFixed(res) +
        'i, Y=' + qTot.y.toFixed(res) +
        'j, Z=' + qTot.z.toFixed(res) +
        'k, <br>W=' + qTot.w.toFixed(res) +
        ', length=' + qTot.length().toFixed(res) + '.';
};