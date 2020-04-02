// keep track of object and players we know about
const players = new Map()
const objects = new Map()

// object events
const newObjectEvent = eventmonger.newEvent()

// player events
const newPlayerEvent = eventmonger.newEvent()
const updatePlayerEvent = eventmonger.newEvent()
const removePlayerEvent = eventmonger.newEvent()

// the controlled player id, -1 means no player
let ID = -1

// spawn a new player
function spawnPlayer() {
    // -1 means no player, so do that
    ID = -1

    // ask the server to spawn us an player
    emit("spawn", on => [
        on(barter.response, id => {
            ID = id
        })
    ])
}

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
        if (id == ID) {
            // we were removed!
        }

        eventmonger.fire(removePlayerEvent, players.get(id))

        players.delete(id)
    }

    // connect to the server and register the callbacks and return the connection
    return barter("ws://127.0.0.1:4242", on => [
        on("newObject", newObject),
        on("playerJoin", newPlayer),
        on("playerLeft", removePlayer),
        on("update", updatePlayer),
        on("turn", callback => onTurn(callback))
    ])
})()