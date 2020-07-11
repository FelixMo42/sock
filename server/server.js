import { on } from "eventmonger"
import express from "express"
import { createServer } from "http"
import fs from "fs"

import { isEmptyPosition, wait, random } from "./util/util.js"
import barter, { enter, leave, reply }   from "./util/barter.js"
import {
    createObject, updateObject,
    objectCreated, objectUpdated, objectRemoved,
    getObject, getObjects, hasObject
} from "./core/object.js"
import { getAction, getActions, applyAction } from "./core/action.js"
import { player } from "./game/main.js"

// the min and max time for how long object have to select moves
const minTime = 500
const maxTime = 1000

/*///////////////////////*/
/*| core loop managment |*/
/*///////////////////////*/

const doObjectMoves = () => new Promise(done => {
    let responses = new Set()
    let changes   = new Map()

    let numSent = emit("turn", on => [
        on( leave, client => {
            // remove are record of this client responding
            responses.delete(client)

            // welp, one less response we need to wait for
            numSent -= 1

            // there are no more connected clients, so were done
            if (numSent == 0) done(changes)
        } ),

        on( reply, (client, move) => {
            // mark that weve recived this clients response
            responses.add( client )

            // bind the move to the client the client is acting for
            applyAction(
                getAction( move.action ),
                getObject( move.source ),
                move.inputs,
                changes
            )
            
            // everyone has responded, were done here
            if (responses.size == numSent) done(changes)
        } )
    ]).length

    // the maxiumum amount of time people have to respond
    wait(maxTime).then(() => done(changes))
})

const tick = async () => {
    // ask the objects what they want to do
    let delay = wait(minTime)
    let changes = await doObjectMoves()
    await delay

    // change the objects
    changes.forEach(updateObject)
}

const play = async () => {
    while (true) await tick()
}


/*////////////////////*/
/*| socket maintnace |*/
/*////////////////////*/

on(objectCreated, object => emit("objectCreated", object))
on(objectUpdated, update => emit("objectUpdated", update))
on(objectRemoved, object => emit("objectRemoved", object.id))

const spawnPlayer = id => {
    //  get a postion in the spawn box
    let position = { x: random(1, 5), y: random(1, 5) }

    // make sure the postion is clear, if not regenerate it
    while ( !isEmptyPosition(position) ) position = { x: random(1, 5), y: random(1, 5) }

    // make the object
    return createObject(player, { id, position })
}

const addClient = (client, {ids}) => {
    // tell the new client of all the objects in the world
    for (let object of getObjects()) client("objectCreated", object)

    // make sure we have all the objects the client wants
    for (let id of ids)  if ( !hasObject(id) ) spawnPlayer(id)
}

// set up express app
const app = express()
app.use(express.static('public'))

// create the http server
const server = createServer(app)

// create the websocket server
const emit = barter(server, on => [
    on(enter, addClient),
    on(leave, () => {})
])

/*////////////*/
/*| game api |*/
/*////////////*/

app.get("/actions", (_req, res) => {
    res.send( JSON.stringify( getActions() ) )
})

/*/////////////////*/
/*| initilization |*/
/*/////////////////*/

// listen in on our fav port
server.listen(4242)

// run the main game logic
play()