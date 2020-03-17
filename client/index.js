class Stream {
    list = []

    set(list) {
        this.list = list

        this.triggerCallback()
    }

    add(item) {
        this.list.push(item)

        this.triggerCallback()
    }

    forEach(callback) {
        this.list.forEach(callback)
    }

    map(callback) {
        return this.list.map(callback)
    }

    triggerCallback() {
        if (this.list.length > 0) {
            return
        }

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
    moves.forEach(({x, y}) => ellipse(x * meter + center, y * meter + center, 20, 20))

    // hightlight the tile with the mouse over it
    rect(div(mouseX, meter) * meter + 5, div(mouseY, meter) * meter + 5, meter - 10, meter - 10, 10)
}

function mouseReleased() {
    // update the target if the mouse is down
    moves.set([{
        type: "move",
        x: div(mouseX, meter),
        y: div(mouseY, meter)
    }])
}

function onTurn(callback) {
    moves.next(callback)
}