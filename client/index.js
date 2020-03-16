const connection = io(window.location.search)

let agents = new Map()
let objects = new Map()

let meter = 60

let target = { type: "move", x: 0, y: 0 }

function div(a, b) {
    return (a - a % b) / b
}

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function updateTarget(x, y) {
    target.x = x
    target.y = y
}

function draw() {
    update()
    clear()

    // draw all the agents and objects
    stroke("black")
    agents.forEach(({position: {x, y}}) => ellipse(x * meter, y * meter, 20, 20))
    objects.forEach(({x, y, width, height}) => rect(x * meter, y * meter, width * meter, height * meter))

    // draw you target location
    stroke("blue")
    ellipse(target.x * meter, target.y * meter, 15, 15)
}

function update() {
    // update the target if the mouse is down
    if (mouseIsPressed) {
        updateTarget( div(mouseX, meter), div(mouseY, meter) )
    }
}

function reset() {
    agents.clear()
    objects.clear()
}

function addAgent(agent) {
    console.log(`meet ${agent.name}!`)
    agents.set(agent.id, agent)
}

function addObject(object) {
    objects.set(object.id, object)
}

connection.on("disconnect", reset)

connection.on("onNewObject", addObject)

connection.on("onAgentJoin", addAgent)

connection.on("onAgentLeft", id => agents.delete(id))

connection.on("turn", callback => callback(target))

connection.on("update", (id, agent) => agents.set(id, agent))