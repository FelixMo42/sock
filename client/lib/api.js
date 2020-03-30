// keep track of object and agents we know about
const agents = new Map()
const objects = new Map()

// object events
const newObjectEvent = eventmonger.newEvent()

// agent events
const newAgentEvent = eventmonger.newEvent()
const updateAgentEvent = eventmonger.newEvent()
const removeAgentEvent = eventmonger.newEvent()

// the controlled agent id
let ID = 0

// check if our player exist
function hasPlayer() {
    return agents.has(ID)
}

// get the player their controlling
function getPlayer() {
    return agents.get(ID)
}

// setup the callbacks in their own seperate blocks
{
    // object callbacks

    function newObject(object) {
        objects.set(object.id, object)
    
        eventmonger.fire(newObjectEvent, object)
    }

    // agent callbacks

    function newAgent(agent) {
        agents.set(agent.id, agent)

        eventmonger.fire(newAgentEvent, agent)
    }

    function updateAgent(agent) {
        agents.set(agent.id, agent)

        eventmonger.fire(updateAgentEvent, agent)
    }

    function removeAgent(id) {
        eventmonger.fire(removeAgentEvent, agents.get(id))

        agents.delete(id)
    }

    // initilization callbacks

    function setId(id) {
        ID = id
    }

    function reset() {
        agents.clear()
        objects.clear()
    }

    // connect to the server and register callbacks
    barter("ws://127.0.0.1:4242", on => [
        on("connect", setId),
        on("newObject", newObject),
        on("agentJoin", newAgent),
        on("agentLeft", removeAgent),
        on("update", updateAgent),
        on("turn", callback => onTurn(callback))
    ])
}