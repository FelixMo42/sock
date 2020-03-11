const connection = io(window.location.search)

let agents = new Map()

let player = {x: 0, y: 0}

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight) 
}

function draw() {
    clear()

    agents.forEach(({x, y}) => {
        ellipse(x, y, 20, 20)
    })

    if (mouseIsPressed) {
        player.x = mouseX
        player.y = mouseY
    }

    ellipse(player.x, player.y, 20, 20)

    connection.emit("update", player)
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
    console.log("turn")
    callback("hi")
})

connection.on("update", (id, position) => {
    agents.set(id, position)
})