const WebSocket = require("ws")
const uuidv1 = require("uuid").v1

const response = "R"
const question = "Q"

const emiter = Symbol("barter#emiter")

const makeEventHandler = func => {
    let map = new Map()

    let events = func((name, callback) => [name, callback])

    for (let [name, callback] of events) map.set(name, callback)

    // return a function that triger a specified event
    return (event, ...params) => {
        // make sure we have the event
        if (map.has(event)) {
            // call the event
            map.get(event)(...params)

            // were all good here, return true
            return true
        }

        // just log it, dont throw any errors or any thing
        console.error(`no handler for event "${event}"`)

        // there was a mistake, return false
        return false
    }
}

const barter = module.exports = (server, events) => {
    const socket = new WebSocket.Server({server})
    const handle = makeEventHandler(events)
    const answer = new Map()

    const stringify = param => {
        if (typeof param === "function") {
            let id = "#" + uuidv1()

            answer.set(id, makeEventHandler(param))

            return "\n" + id
        } else {
            return "\n" + JSON.stringify(param)
        }
    }

    const parse = client => param => {
        if (param[0] == "#")
            return (...params) => client.send(`${response}\n${param}${params.map(stringify)}`)

        return JSON.parse(param)
    }

    socket.on("connection", client => {
        let emit = (event, ...params) => client.send(`${question}\n${event}${params.map(stringify)}`)

        client[emiter] = emit

        handle(barter.join, emit)

        client.on("message", message => {
            let [type, event, ...params] = message.split("\n")

            if (type == response) {
                return answer.get(event)(barter.response, emit, ...params.map(parse(emit)))}
            
            if (type == question)
                return handle(event, ...params.map(parse(emit)))

            console.error(`invalide type ${type}`)
        })

        client.on("close", () => {
            // handle it closing
            handle(barter.leave, emit)
        
            // tell all callbacks that is closed
            answer.forEach((id, handle) => handle(barter.leave, emit))
        })
    })

    return (event, ...params) => {
        let message = `${question}\n${event}${params.map(stringify)}`

        socket.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(message)
        })

        // return a copy of the current clients as emiters
        return Array.from(socket.clients.values(), client => client[emiter])
    }
}

barter.join = Symbol("barter#open")
barter.leave = Symbol("barter#leave")
barter.response = Symbol("barter#response")