import { v1 as uuidv1 } from "uuid"
import { Event, fire, on } from "eventmonger"
import barter, { enter, leave } from "./barter"

/*/////////////////////*/
/*| utility functions |*/
/*/////////////////////*/

export const getDistance = (a, b) => Math.abs( a.x - b.x ) + Math.abs( a.y - b.y )

export const getObjectAtPosition = (position) => {
    for (let object of objects.values()) {
        if (object.position.x == position.x && object.position.y == position.y) return object
    }
}

/*////////////////////////*/
/*| our player functions |*/
/*////////////////////////*/

// check if our player exist
export const hasOurPlayer = () =>  objects.has(name)

// get our object
export const getOurPlayer = () => objects.get(name)

// cheack if this is out object
export const isOurPlayer = object => object.id == name

/*////////////////////////*/
/*| variables and events |*/
/*////////////////////////*/

// keep track of object and objects we know about
export const objects = new Map()

// server events
export const enterServerEvent = Event()
export const leaveServerEvent = Event()

// object events
export const objectCreated = Event()
export const objectUpdated = Event()
export const objectRemoved = Event()

export const objectUpdateDone = Event()

// define the callback for what you do on your turn
let onTurnCallback = () => {}
export const onTurn = (callback) => {
    onTurnCallback = callback
}

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
    on("objectUpdated", update => {
        let object = update.object = objects.get(update.object)

        // tell people what parts of the object updated
        fire(objectUpdated, update)

        for (let [aspect, value] of Object.entries(update.update)) object[aspect] = value

        fire(objectUpdateDone, object)
    }),
    on("objectRemoved", id => {
        fire(objectRemoved, objects.get(id))

        objects.delete(id)
    }),
    
    // outher callbaks
    on("turn", callback => onTurnCallback(callback))
])

// log that the server disconnected
on( leaveServerEvent, () => console.log("server closed") )