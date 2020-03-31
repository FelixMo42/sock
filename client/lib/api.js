// keep track of object and agents we know about
const agents = new Map()
const objects = new Map()

// object events
const newObjectEvent = eventmonger.newEvent()

// agent events
const newAgentEvent = eventmonger.newEvent()
const updateAgentEvent = eventmonger.newEvent()
const removeAgentEvent = eventmonger.newEvent()

// the controlled agent id, -1 means no agent
let ID = -1

// spawn a new player
function spawnPlayer() {
    // -1 means no agent, so do that
    ID = -1

    // ask the server to spawn us an agent
    emit("spawn", on => [
        on(barter.response, id => {
            ID = id
        })
    ])
}

// check if our player exist
function hasPlayer() {
    return agents.has(ID)
}

// get the player their controlling
function getPlayer() {
    return agents.get(ID)
}

// setup the callbacks in their own seperate blocks and then get the connection
const emit = (() => {
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
        if (id == ID) {
            // we were removed!
        }

        eventmonger.fire(removeAgentEvent, agents.get(id))

        agents.delete(id)
    }

    // connect to the server and register the callbacks and return the connection
    return barter("ws://127.0.0.1:4242", on => [
        on("newObject", newObject),
        on("agentJoin", newAgent),
        on("agentLeft", removeAgent),
        on("update", updateAgent),
        on("turn", callback => onTurn(callback))
    ])
})()