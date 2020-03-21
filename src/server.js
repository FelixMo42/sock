// set up express app
const app = require("express")()
app.use("/client", require("express").static('client'))

// create the socket.io instance
const server = require("http").Server(app)
const io = require("socket.io")(server, { pingTimeout: 60000 })

// set up the socket.io events
const send = event => id => (...data) => clients.get(id).emit(event, ...data)
const emit = event => (...data) => io.emit(event, ...data)
const emitUpdate = emit("update")
const getTurn = send("turn")

let getAgentMove = agent => new Promise(resolve => getTurn(agent.id)(move => resolve([agent, move])))

let getAgentsMoves = agents => Promise.all([...agents.values()].map(getAgentMove))

let applyEffect = (agent, effect) => {
    if (effect.type == "move") {
        agent.target.x = effect.x
        agent.target.y = effect.y
    }
}

let tick = async () => {
    let moves = await getAgentsMoves(agents)
    
    // apply the effects
    moves.forEach(([agent, move]) => applyEffect(agent, move))

    // move around agents that need to be moved
    moves.forEach(([agent]) => {
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
        emitUpdate(agent.id, agent)
    })
}

let wait = ms => new Promise((r, j)=>setTimeout(r, ms))

let play = async () => {
    while (true) {
        await wait(1000)

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
objects.set("0", { id: 0, x: 5, y: 0, width: 1, height: 10 })

// plug the authenication in here
io.use((agent, next) => next())

// handle an new user connecting
io.on("connect", client => {
    console.log("new client")

    // tell the new agent of all the outher agents on ther server
    for (let outher of agents.values()) {
        client.emit("onAgentJoin", outher)
    }

    // tell the new agent of all the objects
    for (let object of objects.values()) {
        client.emit("onNewObject", object)
    }

    // what data do we want to store about the agent    
    let agent = {
        name: client.handshake.query.name,
        position: {x: 0, y: 0},
        target: {x: 0, y: 0},
        id: client.id,
    }

    // add the new agent to the map
    agents.set(client.id, agent)

    // add the socket to are list of sockets
    clients.set(client.id, client)

    // tell all the agents that a new agent has connected (including the new agent)
    io.emit("onAgentJoin", agent)

    client.on("disconnect", reason => {
        io.emit("onAgentLeft", client.id)

        clients.delete(client)
        agents.delete(agent.id)
    })
})

// listen in on out tots fav port
server.listen(4242)

// run the main game logic
play()