import { players, actions, objects } from "./database.js"
import { fire, on } from "eventmonger"
import { isEmptyPosition, wait, getDistance, random } from "./util.js"
import {
    createPlayer, removePlayer,
    createPlayerEvent, updatePlayerEvent, removePlayerEvent,
    createObjectEvent, updateObjectEvent, removeObjectEvent
} from "./manager.js"

// the min and max time for how long player have to select moves
const minTime = 500
const maxTime = 1000

/*/////////////////////*/
/*| do the moves baby |*/
/*/////////////////////*/

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
    effect.apply(target, value).forEach(change => applyChange(target, change, changes))
}

const applyChange = (target, [aspect, value], changes) => {
    if ( !changes.has(target) ) changes.set(target, new Map())

    let change = changes.get( target )

    change.set(aspect.name, aspect.type.add( value, 
        change.has(aspect.name) ? change.get(aspect.name) : target[aspect.name]
    ) )
}

/*///////////////////////*/
/*| core loop managment |*/
/*///////////////////////*/

const updatePlayer = (changes, player) => {
    for (let [aspect, value] of changes.entries()) {
        if ( aspect.type.eq( player[aspect.name], value ) ) {
            changes.delete(aspect)
        } else {
            players.get(player.id).set(aspect.name, aspect.update(player, value))
        }
    }
}

const tick = async () => {
    // ask the players what they want to do
    let delay = wait(minTime)
    let changes = await doPlayerMoves()
    await delay
    
    // change the players
    changes.forEach(updatePlayer)

    // tell the world news of the players changes
    for (let player of changes.keys()) fire(updatePlayerEvent, player)
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

on(createPlayerEvent, player => emit("createPlayerEvent", players.get(player).value()))
on(updatePlayerEvent, player => emit("updatePlayerEvent", players.get(player).value()))
on(removePlayerEvent, player => emit("removePlayerEvent", player))

on(createObjectEvent, object => emit("createObjectEvent", objects.get(object).value()))
on(updateObjectEvent, object => emit("updateObjectEvent", objects.get(object).value()))
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
    for (let object of objects.values()) client("createObjectEvent", object)

    // tell the new client of all the players in the server
    for (let player of players.values()) client("createPlayerEvent", player)

    // make sure we have all the players the agent wants
    for (let id of ids) if ( !players.has(id).value() ) spawnPlayer(id)
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