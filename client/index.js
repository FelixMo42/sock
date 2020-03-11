const connection = io(window.location.search)

let agents = new Map()

let player = {x: 0, y: 0}
let target = {x: 0, y: 0}

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight) 
}

function updateTarget(x, y) {
    let vec = createVector(x - player.x, y - player.y)
    
    vec.limit(100)

    target.x = player.x + vec.x
    target.y = player.y + vec.y
}

function draw() {
    clear()

    // draw all the agents
    stroke("black")
    agents.forEach(({x, y}) => {
        ellipse(x, y, 20, 20)
    })

    if (mouseIsPressed) {
        updateTarget(mouseX, mouseY)
    }

    // draw you target location
    stroke("blue")
    ellipse(target.x, target.y, 15, 15)
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

// connection.on("connect", () => console.log("hi"))

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
    if (id == connection.id) {
        player = position
    }

    agents.set(id, position)
})