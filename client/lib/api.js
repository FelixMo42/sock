const name = "Alice"

// keep track of object and players we know about
const players = new Map()
const objects = new Map()

// server events
const connectEvent = eventmonger.newEvent()
const disconnectEvent = eventmonger.newEvent()

// object events
const newObjectEvent = eventmonger.newEvent()

// player events
const newPlayerEvent    = eventmonger.newEvent()
const updatePlayerEvent = eventmonger.newEvent()
const removePlayerEvent = eventmonger.newEvent()

const getDistance = (a, b) => Math.abs( a.x - b.x ) + Math.abs( a.y - b.y )

let ID = name

// // spawn a new player
// function spawnPlayer() {
//     // ask the server to spawn us an player
//     emit("spawn", on => [
//         on(barter.response, id => {
//             ID = id
//         })
//     ])
// }

// check if our player exist
function hasPlayer() {
    return players.has(ID)
}

// get the player their controlling
function getPlayer() {
    return players.get(ID)
}

// setup the callbacks in their own seperate blocks and then get the connection
const emit = (() => {
    // object callbacks

    function newObject(object) {
        objects.set(object.id, object)
    
        eventmonger.fire(newObjectEvent, object)
    }

    // player callbacks

    function newPlayer(player) {
        players.set(player.id, player)

        eventmonger.fire(newPlayerEvent, player)
    }

    function updatePlayer(player) {
        players.set(player.id, player)

        eventmonger.fire(updatePlayerEvent, player)
    }

    function removePlayer(id) {
        eventmonger.fire(removePlayerEvent, players.get(id))

        players.delete(id)
    }

    // connect to the server and register the callbacks and return the connection
    return barter(`ws://127.0.0.1:4242?$ids@=${name}`, on => [
        on(barter.join, () => eventmonger.fire(connectEvent)),
        on(barter.leave, () => eventmonger.fire(disconnectEvent)),
        on("newObject", newObject),
        on("playerJoin", newPlayer),
        on("playerLeft", removePlayer),
        on("update", updatePlayer),
        on("turn", callback => onTurn((turn) => callback({id: ID, turn})))
    ])
})()