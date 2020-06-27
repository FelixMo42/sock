import { v1 as uuidv1 } from "uuid"
import { Event, fire, on } from "./eventmonger"
import barter, * as socketEvent from "./barter"

/*/////////////////////*/
/*| utility functions |*/
/*/////////////////////*/

export const getDistance = (a, b) => Math.abs( a.x - b.x ) + Math.abs( a.y - b.y )

export const getPlayerAtPosition = (position) => {
    for (let player of players.values()) {
        if (player.position.x == position.x && player.position.y == position.y) return player
    }
}

// check if our player exist
export const hasPlayer = () =>  players.has(name)

// get the player their controlling
export const getPlayer = () => players.get(name)

// define the callback for what you do on your turn
let onTurnCallback = () => {}
export const onTurn = (callback) => {
    onTurnCallback = callback
}

/*////////////////////////*/
/*| variables and events |*/
/*////////////////////////*/

// keep track of object and players we know about
export const players = new Map()
export const objects = new Map()

// server events
export const connectEvent = Event()
export const disconnectEvent = Event()

// object events
export const newObjectEvent = Event()

// player events
export const newPlayerEvent    = Event()
export const updatePlayerEvent = Event()
export const removePlayerEvent = Event()

/*///////////////////////*/
/*| backend setup stuff |*/
/*///////////////////////*/

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
    }
    return ""
}

// load the name if it can be found, outherwise generate a random one
export const name =
    new URLSearchParams(window.location.search).get("name") ||
    getCookie("name") ||
    uuidv1()

document.cookie = `name=${name}`


// setup the callbacks in their own seperate blocks and then get the connection
const emit = (() => {
    // object callbacks

    function newObject(object) {
        objects.set(object.id, object)
    
        fire(newObjectEvent, object)
    }

    // player callbacks

    function newPlayer(player) {
        
        players.set(player.id, player)

        fire(newPlayerEvent, player)
    }

    function updatePlayer(player) {
        players.set(player.id, player)

        fire(updatePlayerEvent, player)
    }

    function removePlayer(id) {
        fire(removePlayerEvent, players.get(id))

        players.delete(id)
    }

    // connect to the server and register the callbacks and return the connection
    return barter(`ws://127.0.0.1:4242?$ids@=${name}`, on => [
        on(socketEvent.enter, () => fire(connectEvent)),
        on(socketEvent.leave, () => fire(disconnectEvent)),
        on("newObject", newObject),
        on("playerJoin", newPlayer),
        on("playerLeft", removePlayer),
        on("update", updatePlayer),
        on("turn", callback => onTurnCallback((turn) => callback({id: name, turn})))
    ])
})()

// log that the server disconnected
on( disconnectEvent, () => console.log("server closed") )