function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
    }
    return ""
}

let name =
    new URLSearchParams(window.location.search).get("name") ||
    getCookie("name")
    uuidv1()

document.cookie = `name=${name}`

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

// check if our player exist
function hasPlayer() {
    return players.has(name)
}

// get the player their controlling
function getPlayer() {
    return players.get(name)
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
        on(barter.enter, () => eventmonger.fire(connectEvent)),
        on(barter.leave, () => eventmonger.fire(disconnectEvent)),
        on("newObject", newObject),
        on("playerJoin", newPlayer),
        on("playerLeft", removePlayer),
        on("update", updatePlayer),
        on("turn", callback => onTurn((turn) => callback({id: name, turn})))
    ])
})()

// log that the server disconnected
eventmonger.on( disconnectEvent, () => console.log("server closed") )