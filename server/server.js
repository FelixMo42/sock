import express from "express"
import http from "http"
import barter, { enter, leave, reply } from "./barter.js"
import { players, actions, objects } from "./database.js"
import { fire, on } from "eventmonger"
import { isEmptyPosition, wait, getDistance, addVector, addNumber } from "./util.js"
import {
    createPlayer, removePlayer,
    createPlayerEvent, updatePlayerEvent, removePlayerEvent,
    createObjectEvent, updateObjectEvent, removeObjectEvent
} from "./manager.js"

// the min and max time for how long player have to select moves
const minTime = 500
const maxTime = 1000

// list of aspects that agents can have
const HP       = Symbol("aspect#hp")
const POSITION = Symbol("aspect#position")

/*////////*/
/*| misc |*/
/*////////*/

on(createPlayerEvent, player => emit("createPlayerEvent", players.get(player).value()))
on(updatePlayerEvent, player => emit("updatePlayerEvent", players.get(player).value()))
on(removePlayerEvent, player => emit("removePlayerEvent", player))

on(createObjectEvent, object => emit("createObjectEvent", objects.get(object).value()))
on(updateObjectEvent, object => emit("updateObjectEvent", objects.get(object).value()))
on(removeObjectEvent, object => emit("removeObjectEvent", object))

const addClient = (client, {ids}) => {
    // tell the new client of all the objects in the world
    for (let object of objects.values()) client("createObjectEvent", object)

    // tell the new client of all the players in the server
    for (let player of players.values()) client("createPlayerEvent", player)

    // make sure we have all the players the agent wants
    for (let id of ids) if ( !players.has(id).value() ) spawnPlayer(id)
}

const getPlayersActions = () => new Promise(done => {
    let responses = new Set()
    let moves     = new Map()

    let numSent = emit("turn", on => [
        on( leave, client => {
            // remove are record of this client responding
            responses.delete(client)

            // welp, one less response we need to wait for
            numSent -= 1

            // there are no more connected agents, so were done
            if (numSent == 0) done(moves)
        } ),

        on( reply, (client, {id, turn}) => {
            // mark that weve recived this clients respons
            responses.add( client )

            // bind the move to the agent the client is acting for
            moves.set( id, turn)
            
            // everyone has responded, were done here
            if (responses.size == numSent) done(moves)
        } )
    ]).length

    // the maxiumum amount of time people have to respond
    wait(maxTime).then(() => done(moves))
})

const applyAction = (action, source) => {
    // were being told to just chill for a turn
    if ( action.type == "wait" ) return

    // if were moving then just dirently apply it
    if ( action.type == "move" ) return applyEffect({ type: POSITION, value: action.target }, source)

    // make sure the action exist
    if ( actions.has(action.type).value() ) {
        // we have no valid target, let bail
        if ( !players.has(action.target).value() ) return console.error(`unknown target ${action.target}`)

        // get the player were targeting
        let target = players.get(action.target).value()

        // make sure the target is out of range
        if ( getDistance( players.get(source).value().position, target.position ) > actions.get(action.type).value().range ) return

        // apply the damage effect
        applyEffect({ type: HP, value: actions.get(action.type).value().value }, action.target)
    } else {
        console.error(`unknown action ${action.type}`)
    }
}

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

/*////////////////////*/
/*| effect managment |*/
/*////////////////////*/

// maps to keep track of all the users and outher stuff
const effects = new Map()

const setEffect = (aspect, target, callback) => {
    // we dont have the effects map of this aspect yet, lets add it
    if ( !effects.has(aspect) ) effects.set(aspect, new Map())

    // get the effects map for this aspect
    let effect = effects.get(aspect)

    // get the previus effect for this 
    let previous = effect.get(target)

    // and finally set it to the new value
    effect.set( target, callback( previous ) )
}

const applyEffect = (effect, target) => {
    if (effect.type == POSITION) setEffect(POSITION, target, addVector(effect.value))

    if (effect.type == HP) setEffect(HP, target, addNumber(effect.value))
}

const processEffect = (aspect, callback) => {
    if ( effects.has(aspect) ) effects.get(aspect).forEach(callback)
}

/*///////////////////////*/
/*| core loop managment |*/
/*///////////////////////*/

const tick = async () => {
    // ask the players what they want to do
    let delay = wait(minTime)
    let moves = await getPlayersActions()
    await delay
    
    // clear the list of effects so that we can repopulate it
    effects.clear()

    // apply the actions
    moves.forEach( applyAction )

    // look at the change in everyones hp
    processEffect(HP, (damage, player) => {
        // take that damage, feel the pain (or get healed, I dont know)
        players.get(player).update("hp", hp => Math.min(hp + damage, players.get(player).get("maxhp").value())).write()

        // were out of health, and therefore dead
        if (players.get(player).value().hp <= 0) removePlayer(player)
    })

    processEffect(POSITION, (target, player) => {
        // we need the players position a lot for this
        const position = players.get(player).value().position

        // if were not moving, then were done here 
        if ( position.x == target.x && position.y == target.y ) return false

        // if the target location is empty move there
        if ( isEmptyPosition( target ) ) players.get(player).set(`position`, target).write()
    })

    // tell the world news of the players changes
    for (let player of players.keys()) fire(updatePlayerEvent, player)
}

const play = async () => {
    while (true) await tick()
}

/*/////////////////*/
/*| initilization |*/
/*/////////////////*/

// set up express app
const app = express()
app.use(express.static('public'))

// create the http server
const server = http.createServer(app)

// create the websocket server
const emit = barter(server, on => [
    on(enter, addClient),
    on(leave, () => {})
])

// listen in on our fav port
server.listen(4242)

// run the main game logic
play()