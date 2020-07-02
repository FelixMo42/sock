import { v1 as uuidv1 } from "uuid"
import { Event, fire, on } from "eventmonger"
import barter, { enter, leave } from "./barter"

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

// get our player
export const getPlayer = () => players.get(name)

// cheack if this is out player
export const isOurPlayer = player => player == getPlayer()

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
export const enterServerEvent = Event()
export const leaveServerEvent = Event()

// object events
export const objectCreated = Event()
export const objectUpdated = Event()
export const objectRemoved = Event()

// player events
export const playerCreated = Event()
export const playerUpdated = Event()
export const playerRemoved = Event()

export const playerUpdateDone = Event()

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

// connect to the server and register the callbacks and return the connection
export const emit = barter(`ws://127.0.0.1:4242?$ids@=${name}`, on => [
    //server callbacks
    on(enter, () => fire(enterServerEvent)),
    on(leave, () => fire(leaveServerEvent)),

    // object callbacks
    on("objectCreated", object => {
        objects.set(object.id, object)
        fire(objectCreated, object)
    }),
    on("objectUpdated", object => {
        objects.set(object.id, object)
        fire(objectUpdated, object)
    }),
    on("objectRemoved", id => {
        fire(objectRemoved, objects.get(id))
        objects.delete(id)
    }),

    // player callbacks
    on("playerCreated", player => {
        players.set(player.id, player)
        fire(playerCreated, player)
    }),
    on("playerUpdated", update => {
        let player = update.player = players.get(update.player)

        // tell people what parts of the player updated
        fire(playerUpdated, update)

        // update the player!
        for (let [aspect, value] of Object.entries(update.update)) player[aspect] = value

        fire(playerUpdateDone, player)
    }),
    on("playerRemoved", id => {
        fire(playerRemoved, players.get(id))
        players.delete(id)
    }),
    
    // outher callbaks
    on("turn", callback => onTurnCallback(callback))
])

// log that the server disconnected
on( leaveServerEvent, () => console.log("server closed") )