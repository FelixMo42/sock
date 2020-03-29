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

const newObjectEvent = eventmonger.newEvent()

function newObject(object) {
    objects.set(object.id, object)

    eventmonger.fire(newObjectEvent, object)
}

///////////////
// AGENT API //
///////////////

const newAgentEvent = eventmonger.newEvent()

function newAgent(agent) {
    agents.set(agent.id, agent)

    eventmonger.fire(newAgentEvent, agent)
}

const updateAgentEvent = eventmonger.newEvent()

function updateAgent(agent) {
    agents.set(agent.id, agent)

    eventmonger.fire(updateAgentEvent, agent)
}

const removeAgentEvent = eventmonger.newEvent()

function removeAgent(id) {
    let agent = agents.get(id)

    agents.delete(id)

    eventmonger.fire(updateAgentEvent, agent)
}

function getPlayer() {
    return agents.get(ID)
}

function hasPlayer() {
    return agents.has(ID)
}

let ID = 0

function setId(id) {
    ID = id
}

///////////////////
// SOCKET.IO API //
///////////////////

// connect to the server
const connection = barter("ws://127.0.0.1:4242", on => [
    on("connect", setId),
    on("newObject", newObject),
    on("agentJoin", newAgent),
    on("agentLeft", removeAgent),
    on("update", updateAgent),
    on("turn", callback => onTurn(callback))
])