import { fire, on } from "eventmonger"
import { isEmptyPosition, wait, getDistance, random } from "./util.js"
import {
    createPlayer, removePlayer,
    createPlayerEvent, updatePlayerEvent, removePlayerEvent,
    createObjectEvent, updateObjectEvent, removeObjectEvent,
    getPlayer, getObject, getAction,
    getPlayers, getObjects, hasPlayer, setPlayer
} from "./manager.js"
import { effects } from "./effect.js"

// the min and max time for how long player have to select moves
const minTime = 500
const maxTime = 1000

/*/////////////////////*/
/*| do the moves baby |*/
/*/////////////////////*/

const isValidTarget = (action, source, target) => {
    // make sure the target is in range
    return getDistance(source.position, target.position) <= action.range
}

const applyMove = (move, changes) => {
    let action = getAction( move.action )
    let player = getPlayer( move.source )
    let target = getPlayer( move.target )

    if ( !action ) return console.error(`unknow action ${move.action}.`)

    if ( !isValidTarget(action, player, target) ) return

    for (let effect of action.effects) applyEffect(target, effect, changes)
}

const applyEffect = (target, [effect, value], changes) => {
    effects.get(effect).apply(target, value).forEach(change => applyChange(target, change, changes))
}

const applyChange = (target, [aspect, value], changes) => {
    if ( !changes.has(target) ) changes.set(target, new Map())

    let change = changes.get( target )

    change.set(aspect, aspect.type.add(value, change.has(aspect) ? change.get(aspect) : target[aspect.name]))
}

const updatePlayer = (changes, player) => {
    let update = {}

    for (let [aspect, value] of changes.entries()) {
        let newValue = aspect.update(player, value)

        update[aspect.name] = newValue

        setPlayer(player, aspect, newValue)
    }

    fire(updatePlayerEvent, { player : player.id , update })
}

/*///////////////////////*/
/*| core loop managment |*/
/*///////////////////////*/

const doPlayerMoves = () => new Promise(done => {
    let responses = new Set()
    let changes   = new Map()

    let numSent = emit("turn", on => [
        on( leave, client => {
            // remove are record of this client responding
            responses.delete(client)

            // welp, one less response we need to wait for
            numSent -= 1

            // there are no more connected agents, so were done
            if (numSent == 0) done(changes)
        } ),

        on( reply, (client, move) => {
            // mark that weve recived this clients response
            responses.add( client )

            // bind the move to the agent the client is acting for
            applyMove( move, changes )
            
            // everyone has responded, were done here
            if (responses.size == numSent) done(changes)
        } )
    ]).length

    // the maxiumum amount of time people have to respond
    wait(maxTime).then(() => done(changes))
})

const tick = async () => {
    // ask the players what they want to do
    let delay = wait(minTime)
    let changes = await doPlayerMoves()
    await delay

    // change the players
    changes.forEach(updatePlayer)
}

const play = async () => {
    while (true) await tick()
}


/*////////////////////*/
/*| socket maintnace |*/
/*////////////////////*/

import express from "express"
import { createServer } from "http"
import barter, { enter, leave, reply } from "./barter.js"
import { players } from "./database.js"

on(createPlayerEvent, player => emit("createPlayerEvent", getPlayer(player)))
on(updatePlayerEvent, update => emit("updatePlayerEvent", update))
on(removePlayerEvent, player => emit("removePlayerEvent", player))

on(createObjectEvent, object => emit("createObjectEvent", getObject(object)))
on(updateObjectEvent, update => emit("updateObjectEvent", update))
on(removeObjectEvent, object => emit("removeObjectEvent", object))

const spawnPlayer = id => {
    //  get a postion in the spawn box
    let position = { x: random(1, 5), y: random(1, 5) }

    // make sure the postion is clear, if not regenerate it
    while ( !isEmptyPosition(position) )
        position = { x: random(1, 5), y: random(1, 5) }

    // make the player
    return createPlayer({
        id, position,
        hp: 100, maxhp: 100,
        mp: 100, maxmp: 100
    })
}

const addClient = (client, {ids}) => {
    // tell the new client of all the objects in the world
    for (let object of getObjects()) client("createObjectEvent", object)

    // tell the new client of all the players in the server
    for (let player of getPlayers()) client("createPlayerEvent", player)

    // make sure we have all the players the agent wants
    for (let id of ids) if ( !hasPlayer(id) ) spawnPlayer(id)
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

/*/////////////////*/
/*| initilization |*/
/*/////////////////*/

// listen in on our fav port
server.listen(4242)

// run the main game logic
play()