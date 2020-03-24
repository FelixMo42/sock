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
const connection = barter("ws://127.0.0.1:4242", eventManager(on => [
    on("newObject", addObject),
    on("agentJoin", addAgent),
    on("agentLeft", removeAgent),
    on("update", updateAgent),
    on("turn", callback => onTurn(callback))
]))