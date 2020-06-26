/*/////////////////////////////////*/
/*| utility functions + variables |*/
/*/////////////////////////////////*/

const moves = new EventQueue()

const meter = 60
const center = meter / 2

const clamp = (min, max) => value => Math.max(Math.min(value, max), min)

const div = (a, b) => Math.floor(a / b)

/*////////////////////*/
/*| handle callbacks |*/
/*////////////////////*/

// handle object events
const drawObject = p5state(({x, y, width, height}) => {
    fill(51)
    rect(x * meter, y * meter, width * meter, height * meter)
})
eventmonger.on(newObjectEvent, object => addSprite(object, ({ ...object, draw: drawObject })) )

// handle player events
const drawPlayer = p5state(({x, y, id}) => {
    // draw a circle for the player
    strokeWeight(8)
    noFill()
    ellipse(x * meter + center, y * meter + center, 40, 40)

    // load the player were drawing
    let player = players.get(id)

    // what percent health are we at?
    let percent = player.hp / 100

    // draw a health bar
    stroke(139, 0, 0)
    arc(
        x * meter + center, y * meter + center,
        40, 40,
        -HALF_PI - percent * PI,
        -HALF_PI + percent * PI
    )

    // if the player is not us, give it a name tag
    if ( getPlayer().id !== player.id ) {
        textAlign(CENTER, CENTER)
        strokeWeight(1)
        fill(0)
        stroke(51)
        textSize(20)
        text(player.id, x * meter + center, y * meter - 5)
    }
})

eventmonger.on(newPlayerEvent, player => {
    // add a friendly little sprite for this new player
    addSprite(player.id, ({ ...player.position, id: player.id, draw: drawPlayer }))

    // is this me?
    if (player == getPlayer()) {
        document.getElementById("hp").style.width = `${player.hp / 100 * 100}%`
        document.getElementById("mp").style.width = `${player.mp / 100 * 100}%`
        document.getElementById("name").innerHTML = player.id
    }    
} )
eventmonger.on(removePlayerEvent, player => removeSprite(player.id))
eventmonger.on(updatePlayerEvent, player => {
    // slide the player over to the right position
    goto(player.id, player.position, 500)

    // is this me?
    if (player == getPlayer()) {
        document.getElementById("hp").style.width = `${player.hp / 100 * 100}%`
        document.getElementById("mp").style.width = `${player.mp / 100 * 100}%`
    }
})

// handle a turn
let currentMove = { type: "wait" }
const onTurn = callback => moves.next(move => {
    currentMove = move
    callback(move)
})

/*/////////////////*/
/*| p5 functions  |*/
/*/////////////////*/

function setup() {
    createCanvas(windowWidth, windowHeight).parent("game")
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function keyPressed() {
    // was a number key pressed?
    if (keyCode >= 49 && keyCode <= 57) {
        // get the numb pressed - 1
        let num = keyCode - 49

        
    } 
}

function mouseReleased() {
    // we dont have a player, we cant do anything
    if ( !hasPlayer() ) return

    // clear the previous path
    moves.clear()

    // is the shift key down?
    if ( keyIsDown(16) ) {
        // attack a target
        attack({ x: mouseTileX(), y: mouseTileY() })
    } else {
        // tell the player to where were pressing
        goToPoint(getPlayer().position, { x: mouseTileX(), y: mouseTileY() })
    }
}

function drawMove({type, target}) {
    if (type == "move") vertex(target.x * meter + center, target.y * meter + center)
}

function draw() {
    // move around the canvas
    translate( ...getCameraPosition() )
    
    // clear the screen
    clear()

    // draw you target locations
    push()
    noFill()
    strokeWeight(4)
    stroke(51)
    noFill()

    beginShape()
    moves.forEach(drawMove)
    vertex( drawMove(currentMove) )
    vertex( getPlayer().position.x * meter + center,  getPlayer().position.y * meter + center)
    vertex(
        sprites.get(getPlayer().id).x * meter + center, 
        sprites.get(getPlayer().id).y * meter + center
    )
    endShape()
    pop()

    // hightlight the tile with the mouse over it
    noFill()
    strokeWeight(4)
    rect(mouseTileX() * meter + 5, mouseTileY() * meter + 5, meter - 10, meter - 10, 10)

    // tick all the animations
    animate()

    // draw all the sprites
    drawSprites()
}

/*///////////////////////*/
/*| viewpoint functions |*/
/*///////////////////////*/

function getCameraPosition() {
    if ( hasPlayer() ) {
        return [
            Math.floor(-sprites.get(getPlayer().id).x * meter + width / 2),
            Math.floor(-sprites.get(getPlayer().id).y * meter + height / 2)
        ]
    } else {
        return [ 0, 0 ]
    }
}

const mouseTileX = () => div(mouseX - getCameraPosition()[0], meter)
const mouseTileY = () => div(mouseY - getCameraPosition()[1], meter)

/*///////////////////*/
/*| moves functions |*/
/*///////////////////*/

function attack(target) {
    // get the player at the target position
    let player = getPlayerAtPosition(target)

    // theres no player here, its a lie
    if ( !player ) return false

    // add this attack to our list of moves
    moves.add({ type: "punch", target: player.id })

    // return news of are success
    return true
}

function goToPoint(source, target) {
    // pathfind to the target location then add all the points in the path to the event queue
    pathfind(source, target).forEach(point => moves.add({type: "move", target: point}))
}

const knowMoves = [
    "move",
    "punch",
    "slice"
]

const movesBox = document.getElementById("moves")
const selected = 0

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)

for (let i in knowMoves) {
    let el = document.createElement("p")

    el.innerHTML = `${i}. ${capitalize(knowMoves[i])}`

    if (i == selected) el.className = "selected"

    movesBox.appendChild( el )
}