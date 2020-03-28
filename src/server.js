const express = require("express")
const http = require("http")
const barter = require("./barter")
const uuid = require("uuid").v1

let addAgent = client => {
    // tell the new agent of all the objects in the world
    for (let object of objects.values()) client("newObject", object)

    // tell the new agent of all the outher agents on the server
    for (let outher of agents.values()) client("agentJoin", outher)

    // what data do we want to store about the agent?
    let agent = { position: {x: 0, y: 0}, target: {x: 0, y: 0}, id: uuid() }

    // tell the client their id
    client("connect", agent.id)

    // add the new agent to the list of agents
    agents.set(agent.id, agent)

    // add the socket to are list of sockets
    clients.set(client, agent)

    // tell all the agents that a new agent has connected (including the new agent)
    emit("agentJoin", agent)
}

let removeAgent = client => {
    // tell the gang that the clients agent left
    emit("onAgentLeft", clients.get(client).id)

    // remove the agent from the list of agents
    agents.delete(clients.get(client).id)

    // remove the client from are list of active clients
    clients.delete(client)
}

let wait = ms => new Promise(done => setTimeout(done, ms))

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
    wait(1000).then(() => { done(moves) })
})

let applyEffect = (effect, agent) => {
    if (effect.type == "move") {
        agent.target.x = effect.x
        agent.target.y = effect.y
    }
}

let tick = async () => {
    // ask the agents what they want to do
    let moves = await getAgentsMoves()
    
    // apply the effects
    moves.forEach(applyEffect)

    // move around agents that need to be moved
    moves.forEach((move, agent) => {
        // its not moving, so were done here
        if (agent.position.x == agent.target.x && agent.position.y == agent.target.y) return

        // make sure the new position dosent overlap with anything
        for (let object of objects.values()) {
            if (
                agent.target.x >= object.x && agent.target.x < object.x + object.width &&
                agent.target.y >= object.y && agent.target.y < object.y + object.height
            ) return
        }

        // make sure the agent is only moving to an adjacent square
        if (
            Math.abs( agent.position.x - agent.target.x ) > 1 ||
            Math.abs( agent.position.y - agent.target.y ) > 1
        ) return

        // update the agents positions
        agent.position.x = agent.target.x
        agent.position.y = agent.target.y

        // tell the world news of the agents changes
        emit("update", agent)
    })
}

let play = async () => {
    while (true) {
        // do the turn
        console.log("start turn")
        await tick()
        console.log("end turn")
    }
}

// maps to keep track of all the users and outher stuff
const agents = new Map()
const clients = new Map()
const objects = new Map()

// add an object for testing perpuses
objects.set(0, { id: 0, x: 5, y: 0, width: 1, height: 10 })

// set up express app
const app = express()
app.use("/client", express.static('client'))

// create the http server
const server = http.createServer(app)

// create the websocket server
const emit = barter(server, on => [
    on(barter.join, addAgent),
    on(barter.leave, removeAgent)
])

// listen in on our fav port
server.listen(4242)

// run the main game logic
play()