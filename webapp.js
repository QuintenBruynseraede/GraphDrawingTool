var graph_jsons = [];
var old_json = "";
var currently_editing = -1;
  

function clear_problem() {
    this.graph_jsons = [];
    currently_editing = -1;

    ex = document.getElementById('example-list');
    ex.innerHTML = "";
    addExample();
}

function load_problem() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        // getting a hold of the file reference
        var file = e.target.files[0]; 
     
        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
     
        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            console.log( content );

            content_json = JSON.parse(content);
            var examples = content_json["examples"];
            var problem = content_json["problem"]

            // Reset examples and editor
            clear_problem();
            init();


            // Load new examples
            for (var i = 0; i < examples.length; i++) {
                addExample();
                // Set nodes and edges text
                var nodes_text = document.getElementById("nodes"+String(i));
                nodes_text.value = examples[i]["nodes"];
                var edges_text = document.getElementById("edges"+String(i));
                edges_text.value = examples[i]["edges"];
                // Add JSON
                graph_jsons[i] = examples[i]["graph"];
                output.value = examples[i].graph;
                currently_editing = i;
                readGraph();
                save_graph();
            }
            // Load problem
            addExample();
            // Set nodes and edges text
            var nodes_text = document.getElementById("nodes"+String(examples.length));
            nodes_text.value = problem["nodes"];
            var edges_text = document.getElementById("edges"+String(examples.length));
            edges_text.value = problem["edges"];

        }
     }
    input.click();
}

function load_example(url) {
    var json_obj = JSON.parse(Get(url));
    console.log(json_obj);
}

function save_problem() {
    build_problem();
}

function addExample() {
    example_code = 
    `<div class="example" id="exampleINDEX">
        <div class="row">
            <div class="col-3 d-flex justify-content-center">
                <div class="input-group" style="display: flex;">
                    <div class="col-3"><textarea placeholder="Describe nodes" id="nodesINDEX" rows=7 cols=28></textarea></div>
                </div>
            </div>
            <div class="col-3 d-flex justify-content-center">
                <div class="input-group" style="display: flex;">
                    <div class="col-3"><textarea contenteditable="true" placeholder="Describe edges" cols=28 id="edgesINDEX" rows=7></textarea></div>
                </div>
            </div>
            <div class="col-1 my-auto" align="center" style="float:none;margin:0 auto;"><h2>⇔</h2></div>
            <div class="col-5">
                <!--<label for="outputINDEX">Graph drawing</label>-->
                <div id="outputINDEX">
                    <div class="row">
                        <div class="col-4 nested1">
                            <img src="images/sample_graph.png" id="graphiconINDEX" width=180px/>
                        </div>
                        <div style="margin-left:15px" class="col-1 nested2">
                            <button title="Edit" class="btn" data-toggle="modal" onclick="open_editor(INDEX)" data-target="#exampleModal"><i class="fas fa-pencil-alt"></i></button>
                            <button title="Download as image" class="btn" onclick="save_image(INDEX);"><i class="fa fa-download"></i></button>
                            <button title="Download as JSON"class="btn" onclick="save_json(INDEX);"><i class="fa fa-code"></i></button>
                            <button title="Duplicate" class="btn" onclick="duplicate_example(INDEX);"><i class="far fa-clone"></i></button>
                            <button title="Remove image"class="btn btn-info" onclick="remove_example(INDEX);"><i class="fa fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <hr width="78%">
    </div>`;

    // popover_content = `<img src='images/sample_graph.png' id='graphiconINDEX' width=500px/>`;


    // Replace INDEX
    var count = graph_jsons.length;
    new_example_code = example_code.replaceAll("INDEX",count);
    // new_example_code = new_example_code.replaceAll("POPOVER_CONTENT",popover_content.replaceAll("INDEX",count));

    //Find example list and add HTML
    ex = document.getElementById('example-list');
    new_example = createElementFromHTML(new_example_code);
    ex.appendChild(new_example)

    // Add new empty graph to list
    graph_jsons.push("");
    
    // Return new index
    return count;
}

function save_image(x) {
    if (graph_jsons[x] == "") {
        return;
    }
    img = document.getElementById("graphicon"+String(x));
    var a = document.createElement("a"); //Create <a>
    a.target = "_blank";
    a.href = img.src;
    a.download = "graph.png"; //File name Here
    a.click(); //Downloaded file
}

function save_json(x) {
    if (graph_jsons[x] == "") {
        return;
    }

    var a = document.createElement("a"); //Create <a>
    a.href = "data:text/json;charset=utf-8,"+graph_jsons[x];
    a.download = "graph.json"; //File name Here
    a.click(); //Downloaded file
}

function duplicate_example(x) {
    console.log("Duplicating "+String(x));
    // Add example
    new_id = addExample();
    
    // Copy graph and description into new example
    graph_jsons[new_id] = graph_jsons[x];
    document.getElementById("nodes"+String(new_id)).value = document.getElementById("nodes"+String(x)).value;
    document.getElementById("edges"+String(new_id)).value = document.getElementById("edges"+String(x)).value;

    currently_editing = new_id;
    save_graph();
}

function open_editor(graph) {
    init();
    // Simulate click to select 'node' tool visually
    ex = document.getElementById('nodebutton').click();

    console.log("Editing graph "+String(graph));
    currently_editing = graph;
    if (graph_jsons[graph] != "") {
        old_json = graph_jsons[graph];
        output.value = graph_jsons[graph];
        readGraph();
    } else {
        output.value = "";
        storedNodes = [];
        storedEdges = [];
        old_json = graph_jsons[graph];
        draw();
    }
    
}

function save_graph() {
    // Unselect any nodes and update visualization
    firstNode = null;
    draw();

    console.log("Saving to graph "+String(currently_editing));
    graph_jsons[currently_editing] = output.value;

    // Export to image and update graphiconX
    var img=canvas.toDataURL("image/png");
    console.log(img);
    document.getElementById("graphicon"+String(currently_editing)).setAttribute('src', img);

    currently_editing = -1;

    // Allow editing textareas again
    removeKeyListeners();
}

function discard_edit() {
    graph_jsons[currently_editing] = old_json;

    removeKeyListeners();
}

function remove_example(x) {
    console.log("Remove"+String(x));
    document.getElementById("example"+String(x)).remove();
    graph_jsons[x] = "";
}

function submit() {
    var problem = build_problem();
    post("/",{"x":1,"y":1});
    console.log("Submitting!")
}

function download_problem() {
    var problem = build_problem();

    var a = document.createElement("a"); //Create <a>
    a.href = "data:text/json;charset=utf-8,"+JSON.stringify(problem);
    a.download = "problem.json"; //File name Here
    a.click(); //Downloaded file 
}

function build_problem() {
    var examples = [];
    var problem_output;
    var c = 0;

    // Collect examples
    for (var i = 0; i < graph_jsons.length; i++) {
        if (graph_jsons[i] != "") {
            var input_nodes = document.getElementById("nodes"+String(i)).value;
            var input_edges = document.getElementById("edges"+String(i)).value;
            examples[c] = {"nodes":input_nodes,"edges":input_edges,"graph":graph_jsons[i]};
            c++;
        }
    }

    // Collect test example (output)
    problem_output = {"nodes":"","edges":""};

    problem = {"examples":examples,"problem":problem_output};
    console.log(problem);
    return problem
}

function build_problem_dataset() {
    var examples = [];
    var problem_output;
    var c = 0;

    // Collect N-1 examples
    for (var i = 0; i < graph_jsons.length-1; i++) {
        if (graph_jsons[i] != "") {
            var input_nodes = document.getElementById("nodes"+String(i)).value;
            var input_edges = document.getElementById("edges"+String(i)).value;
            examples[c] = {"nodes":input_nodes,"edges":input_edges,"graph":graph_jsons[i]};
            c++;
        }
    }

    // Collect problem example (output)
    var last_idx = graph_jsons.length-1;
    var problem_text_nodes = document.getElementById("nodes"+String(last_idx)).value;
    var problem_text_edges = document.getElementById("edges"+String(last_idx)).value;
    problem_output = {"nodes":problem_text_nodes,"edges":problem_text_edges};

    problem = {"examples":examples,"problem":problem_output};
    console.log(problem);

    var a = document.createElement("a"); //Create <a>
    a.href = "data:text/json;charset=utf-8,"+JSON.stringify(problem);
    a.download = "problem.json"; //File name Here
    a.click(); //Downloaded file
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; 
}
///////////////////////////////// CANVAS TOOL /////////////////////////

var canvas;
var ctx;
var canvasOffset;
var offsetX;
var offsetY;
var storedEdges = {};
var storedNodes = {};
var startX;
var startY;
var tool = "node";
var selectedElem;
var firstNode = null;
var secondNode = null;
var movingElem = null;
var grid = 2;

var init_handlers = false;

function init() {
    canvas = document.getElementById("canvas");
    output = document.getElementById("output");
    ctx = canvas.getContext("2d");
    ctx.textAlign = "center"; 
    canvasOffset = $("#canvas").offset();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
    startX = 0;
    startY = 0;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    tool = "node";

    setTool(tool);

    if (!init_handlers) {
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

        init_handlers = true;
    }

    window.addEventListener('keypress',this.keyPress,false);
    window.addEventListener('keydown',this.keyDown,false);
}

function removeKeyListeners() {
    window.removeEventListener('keypress',this.keyPress,false);
    window.removeEventListener('keydown',this.keyDown,false);
}


function mouseUp(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = getMousePos(e)[0];
    var mouseY = getMousePos(e)[1]; 
    
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
                // console.log("First node: "+String(firstNode));
                break;
            } else {
                secondNode = getClosestNode(mouseX,mouseY,10).id;
                // console.log("Second node: "+String(secondNode));
                if (secondNode != null) {
                    addEdge({
                        node1: firstNode,
                        node2: secondNode,
                        label: "",
                        color: "black",
                        style: "line_full"
                    });
                }

                firstNode = secondNode;
                secondNode = null;
                break;
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
                storedEdges.splice(res2.id,1);
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

    var mouseX = getMousePos(e)[0];
    var mouseY = getMousePos(e)[1]; 

    if (tool == 'move') {
        movingElem = getClosestNode(mouseX,mouseY,10).elem;
    }

}

function getMousePos(e) {
    return {0:parseInt(e.clientX - offsetX)-661,1:parseInt(e.clientY - offsetY)-110};
}

function mousemove(e) {
    e.preventDefault();
    e.stopPropagation();    

    var mouseX = getMousePos(e)[0];
    var mouseY = getMousePos(e)[1]; 

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
        // Draw arrowheads
        if (edge.style == "arrow_full" || edge.style == "arrow_dashed" || edge.style == "arrow2_full" || edge.style == "arrow2_dashed") {
            arrowhead(ctx,storedNodes[edge.node1].x,storedNodes[edge.node1].y,storedNodes[edge.node2].x, storedNodes[edge.node2].y);
        }
        if (edge.style == "arrow2_full" || edge.style == "arrow2_dashed") {
            arrowhead(ctx,storedNodes[edge.node2].x,storedNodes[edge.node2].y,storedNodes[edge.node1].x, storedNodes[edge.node1].y);
        }

        ctx.beginPath();
        // Draw line
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
        
        dist = pDistance(x0,y0,x1,y1,x2,y2);
        if (dist < minDist) {
            minElem = storedEdges[i];
            minDist = dist;
            id = i;
        }
    }
    if (minDist > maxdist) {
        return {elem: null,dist:null,id:null};
    }
    return {elem: minElem,dist:minDist,id:id};
}

function pDistance(x, y, x1, y1, x2, y2) {
    //https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
  
    var xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

function addEdge(e) {
    // find identical edge (ignoring label)
    if (e.node1 == e.node2) {
        console.log("Ignoring loop...");
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
            storedNodes.splice(i,1);
            console.log(`Removed node ${i}`);
        }
    }
    for (var i in storedEdges) {
        if (storedEdges[i].node1 == key || storedEdges[i].node2 == key) {
            storedEdges.splice(i,1);
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
    storedNodes[max+1] = elem;
    console.log("Added node at "+elem.x+",",elem.y);
    updateOutput();

}

function updateOutput() {
    output.value = JSON.stringify({"nodes":storedNodes,"edges":storedEdges});
}

function readGraph() {
    storedNodes = JSON.parse(output.value)["nodes"];
    storedEdges = JSON.parse(output.value)["edges"];
    draw();
}

function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}


function arrowhead(context, fromx, fromy, tox, toy) {
    var headlen = 11; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    var old_linewith = context.lineWidth;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.moveTo(tox-5*Math.cos(angle), toy-5*Math.sin(angle));
    context.lineTo(tox-5*Math.cos(angle) - headlen * Math.cos(angle - Math.PI / 6), toy-5*Math.sin(angle) - headlen * Math.sin(angle - Math.PI / 6));
    context.stroke();
    context.moveTo(tox-5*Math.cos(angle), toy-5*Math.sin(angle));
    context.lineTo(tox-5*Math.cos(angle) - headlen * Math.cos(angle + Math.PI / 6), toy-5*Math.sin(angle) - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
    context.lineWidth = old_linewith;
  }