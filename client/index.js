class EventQueue {
    list = []

    clear() {
        this.list = []
    }

    set(list) {
        this.list = list

        this.triggerCallback()
    }

    add(item) {
        this.list.unshift(item)

        this.triggerCallback()
    }

    forEach(callback) {
        this.list.forEach(callback)
    }

    map(callback) {
        return this.list.map(callback)
    }

    triggerCallback() {
        if (this.list.length == 0)
            return

        if (this.callback != null) {
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

const moves = new EventQueue()

const meter = 60
const center = meter / 2

const clamp = (min, max) => value => Math.max(Math.min(value, max), min)

const div = (a, b) => (a - a % b) / b

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function getCameraPosition() {
    if ( hasPlayer() ) {
        return [
            -sprites.get(getPlayer().id).x * meter + width / 2,
            -sprites.get(getPlayer().id).y * meter + height / 2
        ]
    } else {
        return [ 0, 0 ]
    }
}

eventmonger.on(newObjectEvent, object => addSprite(object, ({ ...object, draw:
    ({x, y, width, height}) => rect(x * meter, y * meter, width * meter, height * meter)
})) )

eventmonger.on(newAgentEvent, agent => addSprite(agent.id, ({ ...agent.position, draw:
    ({x, y}) => ellipse(x * meter + center, y * meter + center, 30, 30)
})) )

eventmonger.on(updateAgentEvent, agent => goto(agent.id, agent.position, 500))

eventmonger.on(removeAgentEvent, agent => removeSprite(agent.id))

function draw() {
    // move around the canvas
    translate( ...getCameraPosition() )

    // clear the screen
    clear()

    // draw you target locations
    noFill()
    moves.forEach(({x, y}) => ellipse(x * meter + center, y * meter + center, 20, 20))

    // hightlight the tile with the mouse over it
    rect(mouseTileX() * meter + 5, mouseTileY() * meter + 5, meter - 10, meter - 10, 10)

    // tick all the animations
    animate()

    // draw all the sprites
    drawSprites()
}

function *range(min, max) {
    let sign = Math.sign(max)

    for (let i = min; i < Math.abs(max); i++) yield sign * i
}

function mouseTileX() {
    return div(mouseX - getCameraPosition()[0], meter)
}

function mouseTileY() {
    return div(mouseY - getCameraPosition()[1], meter)
}

function mouseReleased() {
    // clear the previus path
    moves.clear()

    // is the shift key down?
    if ( keyIsDown(16) ) {
        // attack a target
        attack({ x: mouseTileX(), y: mouseTileY() })
    } else {
        // tell the agent to where were pressing
        goToPoint(getPlayer().position, { x: mouseTileX(), y: mouseTileY() })
    }
}

function getAgentAtPosition(position) {
    for (let agent of agents.values()) {
        if (agent.position.x == position.x && agent.position.y == position.y) return agent
    }
}

function attack(target) {
    let agent = getAgentAtPosition(target)

    moves.add({
        type: "damage",
        value: 100,
        target: agent.id
    })
}

function goToPoint(source, target) {
    // how far do we want to go?
    let deltaX = target.x - source.x
    let deltaY = target.y - source.y

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        let slope = deltaY / deltaX
        
        for (let x of range(1, deltaX)) {
            moves.add({
                type: "move",
                x: source.x + x,
                y: source.y + Math.floor(slope * x)
            })
        }
    } else {
        let slope = deltaX / deltaY

        for (let y of range(1, deltaY)) {
            moves.add({
                type: "move",
                x: source.x + Math.floor(slope * y),
                y: source.y + y
            })
        }
    }

    // add the final point to the path
    moves.add({type: "move", x: target.x, y: target.y})
}

function onTurn(callback) {
    moves.next(callback)
}