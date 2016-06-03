//position  et event de la souris
var mouseX = mouseY = dropX = dropY = dragX = dragY = 0,
    mouseClick = false;
//Repertoire de tous les points

var draggables = [];
var pointSelectedId = -1;
var touchstart = function (e) {
    e.preventDefault();
    dragX = e.touches[0].pageX;
    dragY = e.touches[0].pageY;

    var mousePoint = new point(dragX, dragY, 0);
    mouseClick = true;
    for (var p in draggables) {
        var d = new distance(mousePoint, draggables[p]);
        if (draggables[p].type != "triangle") {
            if (d.pointToCircle() < 0) {
                pointSelectedId = p;
                draggables[p].color = "rgba(255,0,0,0.5)";
                break;
            }
        }
        else if (draggables[p].type == "triangle") {
            if (pointToTriangle(mousePoint, draggables[p].p1, draggables[p].p2, draggables[p].p3)) {
                draggables[p].setGrab(dragX, dragY);
                pointSelectedId = p;
                draggables[p].color = "rgba(255,0,0,0.5)";
                break;
            }
        }
    }

}
var touchend = function (e) {
    e.preventDefault();
    mouseClick = false;
    if (pointSelectedId >= 0) {
        draggables[pointSelectedId].color = "rgba(0,0,0,0.2)";
        pointSelectedId = -1;
    }
}
var touchmove = function (e) {
    e.preventDefault();
    mouseX = e.touches[0].pageX;
    mouseY = e.touches[0].pageY;
    if (pointSelectedId >= 0) {
        if (draggables[pointSelectedId].type == "point") {
            draggables[pointSelectedId].x = mouseX;
            draggables[pointSelectedId].y = mouseY;
        }
        if (draggables[pointSelectedId].type == "line") {
            draggables[pointSelectedId].moveCenterPoint(mouseX, mouseY);
        }
        if (draggables[pointSelectedId].type == "triangle") {
            draggables[pointSelectedId].move(mouseX, mouseY);

        }
    }
}

var mousemove = function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (pointSelectedId >= 0) {
        if (draggables[pointSelectedId].type == "point") {
            draggables[pointSelectedId].x = mouseX;
            draggables[pointSelectedId].y = mouseY;
        }
        if (draggables[pointSelectedId].type == "line") {
            draggables[pointSelectedId].moveCenterPoint(mouseX, mouseY);
        }
        if (draggables[pointSelectedId].type == "triangle") {
            draggables[pointSelectedId].move(mouseX, mouseY);

        }
    }
}
var mousedrag = function (e) {
    dragX = e.clientX;
    dragY = e.clientY;
    var mousePoint = new point(dragX, dragY, 0);
    mouseClick = true;
    for (var p in draggables) {
        var d = new distance(mousePoint, draggables[p]);
        if (draggables[p].type != "triangle") {
            if (d.pointToCircle() < 0) {
                pointSelectedId = p;
                draggables[p].color = "rgba(255,0,0,0.5)";
                break;
            }
        }
        else if (draggables[p].type == "triangle") {
            if (pointToTriangle(mousePoint, draggables[p].p1, draggables[p].p2, draggables[p].p3)) {
                draggables[p].setGrab(dragX, dragY);
                pointSelectedId = p;
                draggables[p].color = "rgba(255,0,0,0.5)";
                break;
            }
        }
    }
    console.log(draggables[pointSelectedId]);
}
var mousedrop = function (e) {
    dropX = e.clientX;
    dropY = e.clientY;
    mouseClick = false;
    if (pointSelectedId >= 0) {
        draggables[pointSelectedId].color = "rgba(0,0,0,0.2)";
        pointSelectedId = -1;
    }
}
// Création du canvas
var width = window.innerWidth;
var height = window.innerHeight;
var canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;

canvas.addEventListener("touchstart", touchstart, false);
canvas.addEventListener("touchend", touchend, false);
canvas.addEventListener("touchcancel", touchend, false);
canvas.addEventListener("touchleave", touchend, false);
canvas.addEventListener("touchmove", touchmove, false);

canvas.onmousemove = mousemove;
canvas.onmousedown = mousedrag;
canvas.onmouseup = mousedrop;
canvas.onmouseleave = mousedrop;
document.getElementById('section').appendChild(canvas);
var context = canvas.getContext('2d');

//RESIZE windows
window.onresize = resize;
function resize() {
    canvas.width = width = window.innerWidth;
    canvas.height = height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}

/*
* Point
*/
var point = function (x, y, r, draggable, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.type = "point";
    this.color = color;
    if (draggable) {
        draggables.push(this);
    }
}
point.prototype.translate = function (dx, dy) {
    this.x += dx;
    this.y += dy;
}
point.prototype.move = function (force) {
    this.translate(
        force.distance * Math.cos(force.radian),
        force.distance * Math.sin(force.radian)
    )
}
point.prototype.draw = function (context) {
    context.beginPath();
    context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
}
/*
* Line
*/
var line = function (p1, p2, width, draggable, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
    this.setCenterPoint();

    this.r = width;
    this.width = width;
    this.type = "line"
    if (draggable) {
        draggables.push(this);
    }
}
/*
* @return integer
*/
line.prototype.getLength = function () {
    var l = new distance(this.p1, this.p2);
    return l.pointToPoint();
}
/*
* @return point object
*/
line.prototype.moveCenterPoint = function (x, y) {
    var dx = x - this.x;
    var dy = y - this.y;
    this.x = x;
    this.y = y;
    this.p1.x += dx;
    this.p1.y += dy;
    this.p2.x += dx;
    this.p2.y += dy;

}
line.prototype.setCenterPoint = function () {
    this.x = (this.p1.x + this.p2.x) / 2;
    this.y = (this.p1.y + this.p2.y) / 2;
}
line.prototype.draw = function (context) {
    context.beginPath();
    context.moveTo(this.p1.x, this.p1.y);
    context.lineWidth = this.width;
    context.lineTo(this.p2.x, this.p2.y);
    context.strokeStyle = this.color;
    context.stroke();
    this.setCenterPoint();
    this.pC = new point(this.x, this.y, this.width / 2, false, this.color);
    this.pC.draw(context);
}
var triangle = function (p1, p2, p3, width, draggable, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.width = width;
    this.r = width;
    this.color = color;
    this.l1 = new line(this.p1, this.p2, this.width, true, color);
    this.l2 = new line(this.p2, this.p3, this.width, true, color);
    this.l3 = new line(this.p3, this.p1, this.width, true, color);
    this.type = "triangle";
    if (draggable) {
        draggables.push(this);
    }
    this.x;
    this.y;
    this.grabX;
    this.grabY;
}
triangle.prototype.setGrab = function (x, y) {
    this.grabX = x;
    this.grabY = y;
}
triangle.prototype.move = function (x, y) {
    var dx = x - this.grabX;
    var dy = y - this.grabY;
    this.grabX = x;
    this.grabY = y;
    this.p1.x += dx;
    this.p1.y += dy;
    this.p2.x += dx;
    this.p2.y += dy;
    this.p3.x += dx;
    this.p3.y += dy;
}
triangle.prototype.draw = function (context) {
    this.p1.draw(context);
    this.p2.draw(context);
    this.p3.draw(context);
    this.l1.draw(context);
    this.l2.draw(context);
    this.l3.draw(context);
    context.beginPath();
    context.moveTo(this.p1.x, this.p1.y);
    context.lineTo(this.p2.x, this.p2.y);
    context.lineTo(this.p3.x, this.p3.y);
    context.fillStyle = this.color;
    context.fill();
}
var rect = function (x0, y0, width, height, rotation, draggable, color) {
    this.rotation = rotation;
    this.width = width;
    this.height = height;
    this.r = 9;
    this.x0 = x0;
    this.y0 = y0;
    this.setCorner();
    this.p0 = new point(this.x0, this.y0, this.r, false, color);
    this.p1 = new point(this.x1, this.y1, this.r, false, color);
    this.p2 = new point(this.x2, this.y2, this.r, false, color);
    this.p3 = new point(this.x3, this.y3, this.r, false, color);
    this.t1 = new triangle(this.p0, this.p1, this.p2, this.r, false, color);
    this.t2 = new triangle(this.p0, this.p3, this.p2, this.r, false, color);

}
rect.prototype.setCorner = function () {
    this.x1 = this.x0 + this.width * Math.cos(this.rotation);
    this.y1 = this.y0 + this.width * Math.sin(this.rotation);
    this.x3 = this.x0 + this.height * Math.cos(this.rotation + Math.PI / 2);
    this.y3 = this.y0 + this.height * Math.sin(this.rotation + Math.PI / 2);
    this.x2 = this.x1;
    this.y2 = this.y3;
}
rect.prototype.draw = function (context) {
    this.t1.draw(context);
    this.t2.draw(context);
}

/*
* Distance entre deux points
*/
/*
* Check Collisions
*/
var distance = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}
distance.prototype.pointToPoint = function () {
    var dx = this.p2.x - this.p1.x,
        dy = this.p2.y - this.p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
distance.prototype.pointToCircle = function () {
    return this.pointToPoint() - this.p2.r;
}
distance.prototype.circleToCircle = function () {
    return this.pointToPoint() - (this.p1.r + this.p2.r);
}

var pointToRect = function (p, rect) {
    return inRange(p.x, rect.x, rect.x + rect.width) &&
        inRange(p.y, rect.y, rect.y + rect.height);
}

var inRange = function (value, min, max) {
    return value >= Math.min(min, max) && value <= Math.max(min, max);
}

var sign = function (p1, p2, p3) {
    return ((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) < 0;
}

var pointToTriangle = function (p, v1, v2, v3) {
    var b1, b2, b3;

    b1 = sign(p, v1, v2);
    b2 = sign(p, v2, v3);
    b3 = sign(p, v3, v1);

    return ((b1 == b2) && (b2 == b3));
}

/*
* vecteur de forces
*/
var force = function (radian, distance) {
    this.radian = radian;
    this.distance = distance;
}
var sommeForces = function (forces) {
    var f = new force(0, 0)
    for (var p in forces) {
        f.radian += forces[p].radian;
        f.distance += forces[p].distance;
    }
    return f;
}
var moyenne = function (array) {
    var somme = 0;
    for (var i in array) {
        somme += array[i];
    }
    return somme / array.length;
}
// var po1 = new point(50, 50, 0, false, 'rgba(0,0,0,0.2)');
// var po2 = new point(100, 100, 0, false, 'rgba(0,0,0,0.2)');
// var po3 = new point(150, 75, 0, false, 'rgba(0,0,0,0.2)');
// var po4 = new point(200, 120, 0, false, 'rgba(0,0,0,0.2)');

// var tr1 = new triangle(po1, po2, po3, 0, true, 'rgba(0,0,0,0.2)');
// var tr2 = new triangle(po1, po2, po4, 0, true, 'rgba(0,0,0,0.2)');
// var recta = new rect(400, 400, 200, 50, 0, false, 'rgba(0,0,0,0.2)');


var po1 = new point(400, 100, 7, true, 'rgba(0,0,0,0.2)');
var po2 = new point(550, 150, 7, true, 'rgba(0,0,0,0.2)');
var po3 = new point(600, 300, 7, true, 'rgba(0,0,0,0.2)');
var po4 = new point(550, 450, 7, true, 'rgba(0,0,0,0.2)');
var po5 = new point(400, 500, 7, true, 'rgba(0,0,0,0.2)');
var po6 = new point(250, 450, 7, true, 'rgba(0,0,0,0.2)');
var po7 = new point(200, 300, 7, true, 'rgba(0,0,0,0.2)');
var po8 = new point(250, 150, 7, true, 'rgba(0,0,0,0.2)');
var tr1 = new triangle(po1, po2, po3, 7, true, 'rgba(0,0,0,0.2)');
var tr2 = new triangle(po1, po2, po4, 7, true, 'rgba(0,0,0,0.2)');
var tr3 = new triangle(po1, po2, po5, 7, true, 'rgba(0,0,0,0.2)');
var tr4 = new triangle(po1, po2, po6, 7, true, 'rgba(0,0,0,0.2)');
var tr5 = new triangle(po1, po2, po7, 7, true, 'rgba(0,0,0,0.2)');
var tr6 = new triangle(po1, po2, po8, 7, true, 'rgba(0,0,0,0.2)');

var tr7 = new triangle(po5, po6, po7, 7, true, 'rgba(0,0,0,0.2)');
var tr8 = new triangle(po5, po6, po8, 7, true, 'rgba(0,0,0,0.2)');
var tr9 = new triangle(po5, po6, po1, 7, true, 'rgba(0,0,0,0.2)');
var tr10 = new triangle(po5, po6, po2, 7, true, 'rgba(0,0,0,0.2)');
var tr11 = new triangle(po5, po6, po3, 7, true, 'rgba(0,0,0,0.2)');
var tr12 = new triangle(po5, po6, po4, 7, true, 'rgba(0,0,0,0.2)');

var tr13 = new triangle(po3, po4, po5, 7, true, 'rgba(0,0,0,0.2)');
var tr14 = new triangle(po3, po4, po6, 7, true, 'rgba(0,0,0,0.2)');
var tr15 = new triangle(po3, po4, po7, 7, true, 'rgba(0,0,0,0.2)');
var tr16 = new triangle(po3, po4, po8, 7, true, 'rgba(0,0,0,0.2)');
var tr17 = new triangle(po3, po4, po1, 7, true, 'rgba(0,0,0,0.2)');
var tr18 = new triangle(po3, po4, po2, 7, true, 'rgba(0,0,0,0.2)');

var tr19 = new triangle(po7, po8, po1, 7, true, 'rgba(0,0,0,0.2)');
var tr20 = new triangle(po7, po8, po2, 7, true, 'rgba(0,0,0,0.2)');
var tr21 = new triangle(po7, po8, po3, 7, true, 'rgba(0,0,0,0.2)');
var tr22 = new triangle(po7, po8, po4, 7, true, 'rgba(0,0,0,0.2)');
var tr23 = new triangle(po7, po8, po5, 7, true, 'rgba(0,0,0,0.2)');
var tr24 = new triangle(po7, po8, po6, 7, true, 'rgba(0,0,0,0.2)');
// Dessinons !
var animation = setInterval(function () {
    context.clearRect(0, 0, width, height);
    // tr2.draw(context);
    // tr1.draw(context);
    // recta.draw(context)
    po1.draw(context);
    po2.draw(context);
    po3.draw(context);
    po4.draw(context);
    po5.draw(context);
    po6.draw(context);
    po7.draw(context);
    po8.draw(context);
    tr1.draw(context);
    tr2.draw(context);
    tr3.draw(context);
    tr4.draw(context);
    tr5.draw(context);
    tr6.draw(context);

    tr7.draw(context);
    tr8.draw(context);
    tr9.draw(context);
    tr10.draw(context);
    tr11.draw(context);
    tr12.draw(context);

    tr13.draw(context);
    tr14.draw(context);
    tr15.draw(context);
    tr16.draw(context);
    tr17.draw(context);
    tr18.draw(context);

    tr19.draw(context);
    tr20.draw(context);
    tr21.draw(context);
    tr22.draw(context);
    tr23.draw(context);
    tr24.draw(context);
}, 30);
console.log(draggables);
