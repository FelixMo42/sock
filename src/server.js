// set up express app
const app = require("express")()
app.use("/client", require("express").static('client'))

app.get("/tick", function (req, res) {
    res.send('tick')

    console.log("tick")

    tick()
})

// create the socket.io instance
const server = require("http").Server(app)
const io = require("socket.io")(server, { pingTimeout: 60000 })


function tick() {

    [...clients].map(agent => new Promise(resolve =>
        agent.emit("turn", console.log)
    ))

}

// a map to keep track of all the users
const agents = new Map()
const clients = new Set()

// plug the authenication in here
io.use((agent, next) => next())

// handle an new user connecting
io.on("connect", agent => {
    clients.add(agent)

    // tell the new agent of all the outher agents on ther server
    for (let outher of agents.values()) {
        agent.emit("onAgentJoin", outher)
    }

    // what data do we want to store about the agent    
    let data = {
        name: agent.handshake.query.name,
        id: agent.id,
        x: 0, y: 0
    }

    // add the new agent to the map
    agents.set(agent.id, data)

    // tell all the outher agents that a new agent has connected
    agent.broadcast.emit("onAgentJoin", data)

    agent.on("disconnect", reason => {
        io.emit("onAgentLeft", agent.id)

        clients.delete(agent)
        agents.delete(agent.id)
    })

    agent.on("update", position => {
        data.x = position.x
        data.y = position.y

        agent.broadcast.emit("update", agent.id, position)
    })
})

// listen in on out fav port
server.listen(4242)