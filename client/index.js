class Stream {
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

const moves = new Stream()

const meter = 60
const center = meter / 2

const clamp = (min, max) => value => Math.max(Math.min(value, max), min)

function div(a, b) {
    return (a - a % b) / b
}

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}


function getCameraPosition() {
    return [
        -getPlayer().position.x * meter + width / 2,
        -getPlayer().position.y * meter + height / 2
    ]
}

function draw() {
    // move around the canvas
    translate( ...getCameraPosition() )

    // clear the screen
    clear()

    // draw all the agents and objects
    stroke("black")
    agents.forEach(({position: {x, y}}) => ellipse(x * meter + center, y * meter + center, 30, 30))
    objects.forEach(({x, y, width, height}) => rect(x * meter, y * meter, width * meter, height * meter))

    // draw you target locations
    noFill()
    stroke("blue")
    moves.forEach(({x, y}) => ellipse(x * meter + center, y * meter + center, 20, 20))

    // hightlight the tile with the mouse over it
    rect(mouseTileX() * meter + 5, mouseTileY() * meter + 5, meter - 10, meter - 10, 10)
}

function *range(min, max) {
    let sign = Math.sign(max)

    for (let i = min; i < Math.abs(max); i++) {
        yield sign * i
    }
}

function mouseTileX() {
    return div(mouseX - getCameraPosition()[0], meter)
}

function mouseTileY() {
    return div(mouseY - getCameraPosition()[1], meter)
}

function mouseReleased() {
    goToPoint(getPlayer().position, {x: mouseTileX(), y: mouseTileY()})
}

function goToPoint(source, target) {
    // how far do we want to go?
    let deltaX = target.x - source.x
    let deltaY = target.y - source.y

    // clear the previus path
    moves.clear()

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
    console.log("on turn")
    moves.next(callback)
}