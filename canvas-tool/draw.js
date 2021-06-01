var canvas;
var ctx;
var canvasOffset;
var offsetX;
var offsetY;
var storedEdges;
var storedNodes;
var startX;
var startY;
var tool = "node";
var selectedElem;
var firstNode = null;
var secondNode = null;
var movingElem = null;
var grid = 5;

function init() {
    canvas = document.getElementById("canvas");
    output = document.getElementById("output");
    ctx = canvas.getContext("2d");
    ctx.textAlign = "center"; 
    canvasOffset = $("#canvas").offset();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
    storedEdges = {};
    storedNodes = {};
    startX = 0;
    startY = 0;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    setTool(tool);

    $("#canvas").mouseup(function(e) {
      mouseUp(e);
    });
    $("#canvas").mouseout(function(e) {
      mouseOut(e);
    });
    $("#canvas").mousedown(function(e) {
        mousedown(e);
    });
    $("#canvas").mousemove(function(e) {
        mousemove(e);
    });
    
    
    window.addEventListener('keypress',this.keyPress,false);
    window.addEventListener('keydown',this.keyDown,false);

}


function mouseUp(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = parseInt(e.clientX - offsetX);
    var mouseY = parseInt(e.clientY - offsetY); 
    
    switch (tool) {
        case "node":
            var x = Math.round(snapToGrid(mouseX,mouseY)[0]);
            var y = Math.round(snapToGrid(mouseX,mouseY)[1]);
            addNode({
                x: x,
                y: y,
                label: "",
                color: "black",
                style: "circle"
            });
            break;
        case "edge":
            if (firstNode == null) {
                firstNode = getClosestNode(mouseX,mouseY,10).id;
                console.log(firstNode);
            }
            else {
                secondNode = getClosestNode(mouseX,mouseY,10).id;
                if (secondNode != null) {
                    addEdge({
                        node1: firstNode,
                        node2: secondNode,
                        label: "",
                        color: "black",
                        style: "line_full"
                    });
                }

                firstNode = null;
                secondNode = null;
            }
            break;
        case "label":
            res1 = getClosestNode(mouseX,mouseY,10);
            res2 = getClosestEdge(mouseX,mouseY,10);
            if (res1.elem == null && res2.elem != null) {
                selectedElem = res2.elem;
                console.log("edge");
            }
            else if (res2.elem == null && res1.elem != null) {
                selectedElem = res1.elem;
                console.log("node");
            }
            else if (res1.elem == null && res2.elem == null) {
                selectedElem = null;
                console.log("null");
            }
            else {
                selectedElem = res1.elem;
            }
            break;
        case "move":
            movingElem = null;
            updateOutput();
            break;
        case "delete":
            res1 = getClosestNode(mouseX,mouseY,10);
            res2 = getClosestEdge(mouseX,mouseY,10);
            console.log(`Closest node: ${res1.id}, closest edge ${res2.id}`);
            if (res1.elem == null && res2.elem != null) {
                console.log("removing edge "+res2.id);
                delete storedEdges[res2.id];
            }
            else if (res2.elem == null && res1.elem != null) {
                console.log("removing node "+res1.id);
                removeNode(res1.elem,res1.id);
            }
            else if (res2.elem != null && res1.elem != null) {
                console.log("Choosing to delete node before edge");
                removeNode(res1.elem,res1.id);
            }
            else {
                console.log("No element to delete");
            }
            updateOutput();
            break;
        case "color":
            res1 = getClosestNode(mouseX,mouseY,10);
            res2 = getClosestEdge(mouseX,mouseY,10);
            console.log(`Closest node: ${res1.id}, closest edge ${res2.id}`);
            if (res1.elem == null && res2.elem != null) {
                console.log("Change color for edge "+res2.id);
                //Change color
                storedEdges[res2.id].color = nextColor(storedEdges[res2.id].color);
            }
            else if (res2.elem == null && res1.elem != null) {
                console.log("Change color for node "+res1.id);
                storedNodes[res1.id].color = nextColor(storedNodes[res1.id].color);
            }
            else if (res2.elem != null && res1.elem != null) {
                console.log("Choosing to change color for node before edge");
                storedNodes[res1.id].color = nextColor(storedNodes[res1.id].color);
            }
            else {
                console.log("No element to change");
            }
            updateOutput();
            break;            
        case "style":
            res1 = getClosestNode(mouseX,mouseY,10);
            res2 = getClosestEdge(mouseX,mouseY,10);
            console.log(`Closest node: ${res1.id}, closest edge ${res2.id}`);
            if (res1.elem == null && res2.elem != null) {
                console.log("Change style for edge "+res2.id);
                //Change color
                storedEdges[res2.id].style = nextEdgeStyle(storedEdges[res2.id].style);
            }
            else if (res2.elem == null && res1.elem != null) {
                console.log("Change style for node "+res1.id);
                storedNodes[res1.id].style = nextNodeStyle(storedNodes[res1.id].style);
            }
            else if (res2.elem != null && res1.elem != null) {
                console.log("Choosing to style color for node before edge");
                storedNodes[res1.id].style = nextNodeStyle(storedNodes[res1.id].style);
            }
            else {
                console.log("No element to change");
            }
            updateOutput();
            break;   
    }

    draw();    

}

function mousedown(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = parseInt(e.clientX - offsetX);
    var mouseY = parseInt(e.clientY - offsetY); 

    if (tool == 'move') {
        movingElem = getClosestNode(mouseX,mouseY,10).elem;
        console.log(movingElem);
    }

}

function mousemove(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = parseInt(e.clientX - offsetX);
    var mouseY = parseInt(e.clientY - offsetY); 

    if (tool == 'move' && movingElem != null) {
        moveNode(movingElem,mouseX,mouseY);
    }

    draw();

}
    

function mouseOut(e) {
  e.preventDefault();
  e.stopPropagation();

  draw();
}

function keyPress(e) {
    e.preventDefault();
    e.stopPropagation();

    
    if (selectedElem != null) {
        selectedElem.label = selectedElem.label + String.fromCharCode(e.keyCode);
        updateOutput();
        draw();
    }
}

function keyDown(e) {
    const key = e.key;
    if (key === "Backspace" && selectedElem != null) {
        console.log(selectedElem.label.slice(0,-1));
        selectedElem.label = selectedElem.label.slice(0,-1);
        draw();
    }
    if ((key === "Escape" || key === "Enter") && selectedElem != null) {
        selectedElem = null;
        draw();
    }
}


function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var oldWidth = ctx.lineWidth;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;


    // redraw grid
    if (grid == 0) {
        // Free drawing: no grid
    }
    else if (grid == 1) {
        // 10x10 grid
        for (var i=0;i<500;i+=10) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }
    else if (grid == 2) {
        // 15x15 grid
        for (var i=0;i<500;i+=15) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }

    else if (grid == 3) {
        // 25x25 grid
        for (var i=0;i<500;i+=25) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }

    else if (grid == 4) {
        // 50x50 grid
        for (var i=0;i<500;i+=50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 500);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(500,i);
            ctx.stroke();
        }
    }

    else if (grid == 5) {
        // Triangular grid
        var h = 27
        for (var y=0;y<500;y+=h) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(500,y);
            ctx.stroke();
        }

        for (var y=-650;y<500;y+=2*h) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(Math.tan(Math.PI/6)*(500-y),500);
            ctx.stroke();
        }

        for (var y=2*h;y<1050;y+=2*h) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(Math.tan(Math.PI/6)*(y),0);
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1;        
    ctx.lineWidth = oldWidth;


    // redraw all edges
    for (var i in storedEdges) {
        var edge = storedEdges[i];
        ctx.strokeStyle = edge.color;

        if (edge == selectedElem) {
            ctx.lineWidth = 4;
        }

        if (edge.style == "line_dashed" || edge.style == "arrow_dashed" || edge.style == "arrow2_dashed") {
            ctx.setLineDash([10, 6]);
        }

        ctx.beginPath();
        ctx.moveTo(storedNodes[edge.node1].x, storedNodes[edge.node1].y);
        ctx.lineTo(storedNodes[edge.node2].x, storedNodes[edge.node2].y);
        ctx.lineWidth = 2;
        if (edge.label != "") {
            ctx.fillText(edge.label,(storedNodes[edge.node1].x+storedNodes[edge.node2].x)/2,(storedNodes[edge.node1].y+storedNodes[edge.node2].y)/2-15);
            // console.log(edge.label);
        }
        ctx.stroke();
        ctx.setLineDash([]);

    }  

    // redraw each stored node
    for (var key in storedNodes) {
        var node =  storedNodes[key];
        ctx.beginPath();
        ctx.strokeStyle = node.color;
        ctx.fillStyle = node.color;
        ctx.lineWidth=4;

        var nodeSize = ((node == selectedElem || key == firstNode || node == firstNode)? 4:2);
        switch (node.style) {
            case "circle":
                ctx.arc(node.x,node.y,nodeSize*2,0,2*Math.PI);
                break;
            case "square":
                ctx.fillRect(node.x-nodeSize*3,node.y-nodeSize*3,2*nodeSize*3,2*nodeSize*3);
                break;
            case "triangle":
                ctx.lineWidth=1;
                ctx.beginPath();
                ctx.moveTo(node.x,node.y-nodeSize*4);
                ctx.lineTo(node.x+nodeSize*4,node.y+nodeSize*4);
                ctx.lineTo(node.x-nodeSize*4,node.y+nodeSize*4);
                ctx.lineTo(node.x,node.y-nodeSize*4);
                ctx.fill();
                break;
        }
        

        if (node.label != "") {
            ctx.font = "15px Arial";
            ctx.fillText(node.label,node.x,node.y-15);
        }
        ctx.fill();
        ctx.stroke();
    }
    ctx.strokeStyle = "black";

}

function setTool(x) {
    if (x != "label") {
        selectedElem = null;
        selectedEdge = null;
    }
    
    if (x != "edge") {
        firstNode = null;
        secondNode = null;
    }
    tool = x;

    draw();

    txt = document.getElementById("current_tool");
    txt.innerHTML = x;
}

function getClosestNode(x,y,maxdist) {
    // Find closest node
    var minDist = 9999;
    var minElem;
    var id=null;

    for (var i in storedNodes) {
        if (Math.sqrt(Math.pow(x-storedNodes[i].x,2) + Math.pow(y-storedNodes[i].y,2)) < minDist) {
            minDist = Math.sqrt(Math.pow(x-storedNodes[i].x,2) + Math.pow(y-storedNodes[i].y,2));
            minElem = storedNodes[i];
            id = i;
        }
    }
    if (minDist > maxdist) {
        return {elem: null,dist:null,id:null}
    }
    return {elem: minElem,dist:minDist,id:id}
}

function getClosestEdge(x,y,maxdist) {
    var minDist = 9999;
    var dist;
    var minElem;
    var x1,x2,y1,y2,x0,y0;
    var id;

    for (var i in storedEdges) {
        x1 = storedNodes[storedEdges[i].node1].x;
        x2 = storedNodes[storedEdges[i].node2].x;
        y1 = storedNodes[storedEdges[i].node1].y;
        y2 = storedNodes[storedEdges[i].node2].y;
        x0 = x;
        y0 = y;
        
        dist = Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1) / Math.sqrt((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1));
        if (dist < minDist) {
            minElem = storedEdges[i];
            minDist = dist;
            id = i;
        }
    }
    if (minDist > 10) {
        return {elem: null,dist:null,id:null};
    }
    return {elem: minElem,dist:minDist,id:id};
}

function addEdge(e) {
    // find identical edge (ignoring label)
    if (e.node1 == e.node2) {
        return;
    }

    for (var i in storedEdges) {
        e2 = storedEdges[i];
        if (e.node1 == e2.node1 && e.node2 == e2.node2) {
            console.log("Edge already exists!");
            return;
        }
    } 

    if (Object.keys(storedEdges).length == 0) {
        storedEdges[0] = e;
        updateOutput();
        return;
    }

    var max = -1;
    for (var i in storedEdges) {
        if (parseInt(i) > max) {
            max = parseInt(i);
        }
    }

    storedEdges[max+1] = e;
    console.log(`Added edge ${max+1}`);
    updateOutput();
}

function moveNode(node,toX,toY) {
    var res = snapToGrid(toX,toY);
    node.y = res[1];
    node.x = res[0];

}

function nextGrid() {
    // 0: no grid, 1: 10x10 square grid, 2: 5x5 square grid
    grid = (grid + 1) % 6;

    // Snap old nodes to new grid
    for (var i in storedNodes) {
        var node =  storedNodes[i];
        node.x = snapToGrid(node.x,0)[0];
        node.y = snapToGrid(0,node.y)[1];
    }

    draw();
}

function snapToGrid(x,y) {
    if (grid == 0) {
        return {0:x,1:y};
    }
    if (grid == 1) {
        return {0:10*Math.round(x/10),1:10*Math.round(y/10)};
    }
    if (grid == 2) {
        return {0:15*Math.round(x/15),1:15*Math.round(y/15)};
    }
    if (grid == 3) {
        return {0:25*Math.round(x/25),1:25*Math.round(y/25)};
    }
    if (grid == 4) {
        return {0:50*Math.round(x/50),1:50*Math.round(y/50)};
    }
    if (grid == 5) {
        //Snap y to horizontal
        var new_y = 27*Math.round(y/27);

        // Length of triangle side
        var z = (2*Math.sqrt(3)*27)/3;

        if (new_y % 54 == 0) {
            new_x = Math.round(z*Math.round(x/z))
        }
        else {
            new_x = Math.round(z/2+z*Math.round((x-z/2)/z));
        }
        return {0:new_x,1:new_y};
    }
}

function nextColor(col) {
    var colors = ["black", "red", "green", "blue"];
    return colors[(colors.indexOf(col)+1) % colors.length];
}

function nextNodeStyle(style) {
    var nodeStyles = ["circle", "square", "triangle"];
    return nodeStyles[(nodeStyles.indexOf(style)+1) % nodeStyles.length];

}

function nextEdgeStyle(style) {
    var edgeStyles = ["line_full","arrow_full","arrow2_full","line_dashed","arrow_dashed","arrow2_dashed"];
    return edgeStyles[(edgeStyles.indexOf(style)+1) % edgeStyles.length];
}

function removeNode(elem,key) {
    for (var i in storedNodes) {
        if (storedNodes[i] == elem) {
            delete storedNodes[i];
            console.log(`Removed node ${i}`);
        }
    }
    for (var i in storedEdges) {
        if (storedEdges[i].node1 == key || storedEdges[i].node2 == key) {
            delete storedEdges[i];
            i = 0;
            console.log(`Removed edge ${i}`);
        }
    }
}

function addNode(elem) {
    if (Object.keys(storedNodes).length == 0) {
        storedNodes[0] = elem;   
        updateOutput();    
    }

    var max = -1;
    for (var node in storedNodes) {
        if (storedNodes[node].x == elem.x && storedNodes[node].y == elem.y) {
            console.log("Node already exists at this position!");
            return;
        }
        if (parseInt(node) > max) {
            max = parseInt(node);
        }
    }
    console.log(`Using index ${max+1}`);
    storedNodes[max+1] = elem;
    console.log("Added node at "+elem.x+",",elem.y);
    updateOutput();

}

function updateOutput() {
    output.textContent = JSON.stringify({"nodes":storedNodes,"edges":storedEdges});
}