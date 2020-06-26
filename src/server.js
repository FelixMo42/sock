const express = require("express")
const barter = require("./barter")
const uuid = require("uuid").v1
const http = require("http")
const fs = require("fs-extra")
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// set up the databases
const loadJsonDB = (file) =>  low(new FileSync(file))
const players = loadJsonDB("./data/players.json")
const actions = loadJsonDB("./data/actions.json")
const objects = loadJsonDB("./data/objects.json")

const wait = ms => new Promise(done => setTimeout(done, ms))

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const objectIncludes = (object, {x, y}) => x >= object.x && x < object.x + object.width && y >= object.y && y < object.y + object.height

const getDistance = (a, b) => Math.abs( a.x - b.x ) + Math.abs( a.y - b.y )

const addVector = a => (b={x:0,y:0}) => ({x: a.x + b.x, y: a.y + b.y})
const addNumber = a => (b=0) => a + b

const isEmptyPosition = position => {
    for (let object of objects.values())
        if ( objectIncludes(object, position) ) return false

    for (let player of players.values())
        if ( player.position.x == position.x && player.position.y == position.y ) return false

    return true
}

const spawnPlayer = id => {
    //  get a postion in the spawn box
    let position = { x: random(1, 5), y: random(1, 5) }

    // make sure the postion is clear, if not regenerate it
    while ( !isEmptyPosition(position) )
        position = { x: random(1, 5), y: random(1, 5) }

    // make the player
    let player = { id, hp: 100, mp: 100, position }

    // add the new player to the list of players
    players.set(player.id, player).write()

    // tell all the cients that a new player has connected
    emit("playerJoin", player)

    // return the new player
    return player
}

const addClient = (client, {ids}) => {
    // tell the new client of all the objects in the world
    for (let object of objects.values()) client("newObject", object)

    // tell the new client of all the players in the server
    for (let outher of players.values()) client("playerJoin", outher)

    // make sure we have all the players the agent wants
    for (let id of ids) if ( !players.has(id).value() ) spawnPlayer(id)
}

const removePlayer = player => {
    // tell the gang that the player left
    emit("playerLeft", player)

    // remove the player from the list of players
    players.unset(player).write()
}

const minTime = 500
const maxTime = 1000

const getPlayersMoves = () => new Promise(done => {
    let responses = new Set()
    let moves     = new Map()

    let numSent = emit("turn", on => [
        on( barter.leave, client => {
            // remove are record of this client responding
            responses.delete(client)

            // todo: remove the clients players moves from the list

            // welp, one less response we need to wait for
            numSent -= 1

            // there are no more connected agents, so were done
            if (numSent == 0) done(moves)
        } ),

        on( barter.response, (client, {id, turn}) => {
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

// list of aspects that agents can have
const HP = Symbol("aspect#hp")
const POSITION = Symbol("aspect#position")

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

const tick = async () => {
    // ask the players what they want to do
    let delay = wait(minTime)
    let moves = await getPlayersMoves()
    await delay
    
    // clear the list of effects so that we can repopulate it
    effects.clear()

    // apply the actions
    moves.forEach( applyAction )

    // look at the change in everyones hp
    processEffect(HP, (hp, player) => {
        // set are hp to the new hp
        players.get(player).update("hp", addNumber(hp)).write()

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
    for (let player of players.values()) emit("update", player)
}

const play = async () => {
    while (true) await tick()
}

// maps to keep track of all the users and outher stuff
const effects = new Map()

// set up express app
const app = express()
app.use(express.static('client'))

// create the http server
const server = http.createServer(app)

// create the websocket server
const emit = barter(server, on => [
    // deal with users leaving and joining
    on(barter.join, addClient),
    on(barter.leave, () => {})
])

// listen in on our fav port
server.listen(4242)

// run the main game logic
play()