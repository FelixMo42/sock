const express = require("express")
const barter = require("./barter")
const uuid = require("uuid").v1
const http = require("http")
const fs = require("fs-extra")

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
    let player = {
        id, hp: 100, mp: 100,
        position: { ...position },
        target: { ...position }
    }

    // add the new player to the list of players
    players.set(player.id, player)

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
    for (let id of ids) if ( !players.has(id) ) spawnPlayer( id )
}

const removeClient = client => {}

const removePlayer = player => {
    // tell the gang that the player left
    emit("playerLeft", player.id)

    // remove the player from the list of players
    players.delete(player.id)
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
            moves.set( players.get(id), turn)
            
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
    // is were being told to just chill for a turn
    if ( action.type == "wait" ) return

    // if were moving then just dirently apply it
    if ( action.type == "move" ) return applyEffect({ type: POSITION, value: action.value }, source)

    // make sure the action exist
    if ( actions.has(action.type) ) {
        // get the player were targeting
        let target = players.get(action.target)

        // we have no valid target, let bail
        if ( target == undefined ) return console.error(`unknown target ${action.target}`)

        // make sure the target is out of range
        if ( getDistance( source.position, target.position ) > actions.get(action.type).range ) return

        // apply the damage effect
        applyEffect({ type: HP, value: -actions.get(action.type).value }, target)
    }

    console.error(`unknown action ${action.type}`)
}

const getEffect = aspect => effects.has(aspect) ? effects.get(aspect) : new Map()

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

const filterEffect = (aspect, callback) => {
    if ( !effects.has(aspect) ) return

    let effect = effects.get(aspect)

    for ( let [player] of effect ) if ( !callback(player, aspect) ) effect.delete( player )
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
    processEffect(HP, (player, hp) => {
        // set are hp to the new hp
        player.hp = hp

        // were out of health, and therefore dead
        if (player.hp <= 0) removePlayer(player)
    })

    processEffect(POSITION, (target, player) => {
        // if were not moving, then were done here 
        if (player.position.x == target.x && player.position.y == target.y) return false

        if ( isEmptyPosition( target ) ) {
            player.position.x = target.x
            player.position.y = target.y
        } else {
            target.x = player.position.x
            target.y = player.position.y          
        }
    })

    // tell the world news of the players changes
    players.forEach(player => emit("update", player))
}

const play = async () => {
    while (true) await tick()
}

// maps to keep track of all the users and outher stuff
const effects = new Map()
const players = new Map()
const actions = new Map()
const objects = new Map()

// set up express app
const app = express()
app.use(express.static('client'))

// create the http server
const server = http.createServer(app)

// create the websocket server
const emit = barter(server, on => [
    // deal with users leaving and joining
    on(barter.join, addClient),
    on(barter.leave, removeClient),
    
    // a users asked us to spawn an player for them
    on("spawn", (client, reportId) => {
        
    })
])

// load in the data from are database
fs.readJson('./db.json').then(db => {
    for (let player of db.players) {}

    for (let object of db.objects) objects.set( object.id , object )

    for (let action of db.actions) actions.set( action.id , action )
})

// listen in on our fav port
server.listen(4242)

// run the main game logic
play()