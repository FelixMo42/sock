// set up express app
const app = require("express")()
app.use("/client", require("express").static('client'))
app.get("/tick", (req, res) => {
    res.send('tick')

    tick()
})

// create the socket.io instance
const server = require("http").Server(app)
const io = require("socket.io")(server, { pingTimeout: 60000 })

const send = event => id => (...data) => clients.get(id).emit(event, ...data)
const emit = event => (...data) => io.emit(event, ...data)

const emitUpdate = emit("update")
const getTurn = send("turn")

let getAgentMove = agent => new Promise(resolve => getTurn(agent.id)(move => resolve([agent, move])))

let getAgentsMoves = agents => Promise.all([...agents.values()].map(getAgentMove))

let applyEffect = (agent, effect) => {
    if (effect.type == "move") {
        agent.x = effect.x
        agent.y = effect.y
    }
}

let tick = () => getAgentsMoves(agents).then(moves => moves.forEach(([agent, move]) => {
    applyEffect(agent, move)

    emitUpdate(agent.id, agent)
}))

// maps to keep track of all the users
const agents = new Map()
const clients = new Map()

// plug the authenication in here
io.use((agent, next) => next())

// handle an new user connecting
io.on("connect", client => {
    // tell the new agent of all the outher agents on ther server
    for (let outher of agents.values()) {
        client.emit("onAgentJoin", outher)
    }

    // what data do we want to store about the agent    
    let agent = {
        name: client.handshake.query.name,
        id: client.id,
        x: 0, y: 0
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

// listen in on out fav port
server.listen(4242)