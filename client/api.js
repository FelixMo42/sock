// keep track of object we know about

const agents = new Map()
const objects = new Map()

function reset() {
    agents.clear()
    objects.clear()
}

////////////////
// OBJECT API //
////////////////

function addObject(object) {
    objects.set(object.id, object)
}

///////////////
// AGENT API //
///////////////

function addAgent(agent) {
    agents.set(agent.id, agent)
}

function updateAgent(id, agent) {
    agents.set(id, agent)
}

function removeAgent(id) {
    agents.delete(id)
}

function getPlayer() {
    return agents.get(connection.id)
}

///////////////////
// SOCKET.IO API //
///////////////////

// connect to the server
const connection = io(window.location.search)

// called when losses connection for any reason
connection.on("disconnect", reset)

// called when learn of new object
connection.on("onNewObject", addObject)

// called when learn of new agent
connection.on("onAgentJoin", addAgent)

// called when an agent leaves the server
connection.on("onAgentLeft", removeAgent)

// called when agent data changes
connection.on("update", updateAgent)

// called when agent need to decided what to do for turn
connection.on("turn", callback => onTurn(callback))