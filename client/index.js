const connection = io(window.location.search)

const agents = new Map()
const objects = new Map()

const meter = 60
const center = meter / 2

const clamp = (min, max) => value => Math.max(Math.min(value, max), min)

class Queue {
    list = []

    callback

    set(list) {
        this.list = list

        if (this.callback) {
            this.callback( this.list.pop() )
            this.callback = null
        }
    }

    next(callback) {
        if (this.list.length > 0) {
            callback( this.list.pop() )
        } else {
            this.callback = callback
        }
    }
}

const queue = new Queue()

function div(a, b) {
    return (a - a % b) / b
}

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function draw() {
    // clear the screen
    clear()

    // draw all the agents and objects
    stroke("black")
    agents.forEach(({position: {x, y}}) => ellipse(x * meter + center, y * meter + center, 30, 30))
    objects.forEach(({x, y, width, height}) => rect(x * meter, y * meter, width * meter, height * meter))

    // draw you target locations
    noFill()
    stroke("blue")
    queue.list.forEach(({x, y}) => ellipse(x * meter + center, y * meter + center, 20, 20))

    // hightlight the tile with the mouse over it
    rect(div(mouseX, meter) * meter + 5, div(mouseY, meter) * meter + 5, meter - 10, meter - 10, 10)
}

function getPlayer() {
    return agents.get(connection.id)
}

function mouseReleased() {
    // update the target if the mouse is down
    queue.set([{
        type: "move",
        x: div(mouseX, meter),
        y: div(mouseY, meter)
    }])
}

function reset() {
    agents.clear()
    objects.clear()
}

function addAgent(agent) {
    agents.set(agent.id, agent)
}

function addObject(object) {
    objects.set(object.id, object)
}

// add socket.io callbacks
connection.on("disconnect", reset)
connection.on("onNewObject", addObject)
connection.on("onAgentJoin", addAgent)
connection.on("onAgentLeft", id => agents.delete(id))
connection.on("turn", callback => queue.next(callback))
connection.on("update", (id, agent) => agents.set(id, agent))