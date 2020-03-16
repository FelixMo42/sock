const connection = io(window.location.search)

let agents = new Map()

let meter = 60

let player = { x: 0, y: 0 }
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
    clear()

    // draw all the agents
    stroke("black")
    agents.forEach(({x, y}) => {
        ellipse(x * meter, y * meter, 20, 20)
    })

    if (mouseIsPressed) {
        updateTarget( div(mouseX, meter), div(mouseY, meter) )
    }

    // draw you target location
    stroke("blue")
    ellipse(target.x * meter, target.y * meter, 15, 15)
}

function reset() {
    agents.clear()

    player.x = 0
    player.y = 0
}

function addAgent(agent) {
    console.log(`meet ${agent.name}!`)
    agents.set(agent.id, agent)
}

connection.on("disconnect", reset)

connection.on("onAgentJoin", addAgent)

connection.on("onAgentLeft", id => {
    agents.delete(id)
})

connection.on("turn", callback => {
    console.log("tick")

    callback(target)
})

connection.on("update", (id, position) => {
    console.log(position)

    if (id == connection.id) {
        player.x = position.x
        player.y = position.y
    }

    agents.set(id, position)
})