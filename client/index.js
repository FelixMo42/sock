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
const drawObject = ({x, y, width, height}) => rect(x * meter, y * meter, width * meter, height * meter)
eventmonger.on(newObjectEvent, object => addSprite(object, ({ ...object, draw: drawObject })) )

// handle player events
const drawPlayer = ({x, y}) => ellipse(x * meter + center, y * meter + center, 30, 30)
eventmonger.on(newPlayerEvent, player => addSprite(player.id, ({ ...player.position, draw: drawPlayer })) )
eventmonger.on(updatePlayerEvent, player => goto(player.id, player.position, 500))
eventmonger.on(removePlayerEvent, player => removeSprite(player.id))

// handle a turn
const onTurn = callback => moves.next(callback)

/*/////////////////*/
/*| p5 functions  |*/
/*/////////////////*/

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function keyPressed() {
    if ( keyCode == 32 ) spawnPlayer()
}

function mouseReleased() {
    // we dont have a player, we can do anything
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

/*///////////////////////*/
/*| viewpoint functions |*/
/*///////////////////////*/

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

const mouseTileX = () => div(mouseX - getCameraPosition()[0], meter)
const mouseTileY = () => div(mouseY - getCameraPosition()[1], meter)

/*///////////////////*/
/*| moves functions |*/
/*///////////////////*/

function getPlayerAtPosition(position) {
    for (let player of players.values()) {
        if (player.position.x == position.x && player.position.y == position.y) return player
    }
}

function attack(target) {
    // get the player at the target position
    let player = getPlayerAtPosition(target)

    // theres no player here, its a lie
    if ( !player ) return false

    // add this attack to our list of moves
    moves.add({
        type: 0,
        value: 100,
        target: player.id
    })

    // return news of are succses
    return true
}

function goToPoint(source, target) {
    // pathfind to the target location then add all the points in the path to the event queue
    pathfind(source, target).forEach(point => moves.add({type: "move", value: point}))
}