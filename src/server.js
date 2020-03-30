const express = require("express")
const http = require("http")
const barter = require("./barter")
const uuid = require("uuid").v1

let random = max => Math.floor(Math.random() * max)

let addAgent = client => {
    // tell the new agent of all the objects in the world
    for (let object of objects.values()) client("newObject", object)

    // tell the new agent of all the outher agents on the server
    for (let outher of agents.values()) client("agentJoin", outher)

    // what data do we want to store about the agent?
    let agent = {
        id: uuid(),
        hp: 100, mp: 100,
        position: { x: 0, y: 0 },
        target: { x: 0, y: 0 }
    }

    // tell the client their id
    client("connect", agent.id)

    // add the new agent to the list of agents
    agents.set(agent.id, agent)

    // add the socket to are list of sockets
    clients.set(client, agent)

    // tell all the agents that a new agent has connected (including the new agent)
    emit("agentJoin", agent)
}

let removeAgent = agent => {
    // tell the gang that the agent left
    emit("agentLeft", agent.id)

    // remove the agent from the list of agents
    agents.delete(agent.id)
}

let removeClient = client => {
    // remove the agent that the client is controlling
    removeAgent( clients.get(client) )

    // remove the client from are list of active clients
    clients.delete(client)
}

let wait = ms => new Promise(done => setTimeout(done, ms))

const minTime = 500
const maxTime = 1000

let getAgentsMoves = () => new Promise(done => {
    let moves = new Map()

    let numSent = emit("turn", on => [
        on( barter.leave, client => {
            // delete the move from the set
            moves.delete(client)

            // welp, one less response we need to wait for
            numSent -= 1

            // there are no more connected agents, so were done
            if (numSent == 0) done(moves)
        } ),

        on( barter.response, (client, move) => {
            // bind the move to the client
            moves.set( clients.get(client), move )
            
            // everyone has responded, were done here
            if (moves.size == numSent) done(moves)
        } )
    ]).length

    // the maxiumum amount of time people have to respond
    wait(maxTime).then(() => done(moves))
})

let applyEffect = (effect, agent) => {
    if (effect.type == "move") {
        agent.target.x = effect.x
        agent.target.y = effect.y
    }

    if (effect.type == "damage") {
        agents.get(effect.target).hp -= effect.value
    }
}

let tick = async () => {
    // ask the agents what they want to do
    let delay = wait(minTime)
    let moves = await getAgentsMoves()
    await delay
    
    // apply the effects
    moves.forEach(applyEffect)

    // figure out if anyone is dead
    agents.forEach(agent => {
        // were out of health, and therefore dead
        if (agent.hp <= 0) removeAgent(agent)
    })

    // figure out if the requested movement is allowed
    moves.forEach((move, agent) => {
        // if were not moving, then were done here 
        if (agent.position.x == agent.target.x && agent.position.y == agent.target.y) return

        // make sure the agent is only moving to an adjacent square
        if (
            Math.abs( agent.position.x - agent.target.x ) > 1 ||
            Math.abs( agent.position.y - agent.target.y ) > 1
        ) return

        // make sure the new position dosent overlap with any objects
        for (let object of objects.values()) {
            if (
                agent.target.x >= object.x && agent.target.x < object.x + object.width &&
                agent.target.y >= object.y && agent.target.y < object.y + object.height
            ) return
        }

        // make sure it dosent overlap with any outher players
        for (let outher of agents.values()) {
            // just me, skip
            if (outher == agent) continue

            // were both going to the same place, not cool
            if (agent.target.x == outher.target.x && agent.target.y == outher.target.y) return

            // were going to were the outher guy left from, also not cool, for now
            if (agent.target.x == outher.position.x && agent.target.y == outher.position.y) return
        }

        // update the agents positions
        agent.position.x = agent.target.x
        agent.position.y = agent.target.y
    })

    // reset the target position
    moves.forEach((move, agent) => {
        agent.target.x = agent.position.x
        agent.target.y = agent.position.y
    })

    // tell the world news of the agents changes
    moves.forEach((move, agent) => emit("update", agent))
}

let play = async () => {
    while (true) await tick()
}

// maps to keep track of all the users and outher stuff
const agents = new Map()
const clients = new Map()
const objects = new Map()

// add an object for testing perpuses
objects.set(0, { id: 0, x: 6, y: 0, width: 1, height: 10 })

// set up express app
const app = express()
app.use(express.static('client'))

// create the http server
const server = http.createServer(app)

// create the websocket server
const emit = barter(server, on => [
    on(barter.join, addAgent),
    on(barter.leave, removeClient)
])

// listen in on our fav port
server.listen(4242)

// run the main game logic
play()