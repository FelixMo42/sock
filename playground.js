const WebSocket = require("ws")
const uuidv1 = require("uuid").v1

const response = "R"
const question = "Q"

let makeEventHandler = func => {
    let map = new Map()

    let events = func((name, callback) => [name, callback])

    for (let [name, callback] of events) map.set(name, callback)

    return (event, params) => {
        if (map.has(event)) {
            map.get(event)(...params)

            return true
        }

        console.info(`no event handler for event ${event}`)

        return false
    }
}

let barter = (server, events) => {
    const socket = new WebSocket.Server({server})
    const handle = makeEventHandler(events)
    const answer = new Map() 

    const parse = client => param => {
        if (param[0] == "#")
            return (...params) => client.send( `${response}\n${param[0]}${params.map(stringify)}`)

        return JSON.parse(param)
    }

    const stringify = param => {
        if (typeof param === "function") {
            let id = "#" + uuidv1()

            answer.set(id, param)

            return "\n" + id
        } else {
            return "\n" + JSON.stringify(param)
        }
    }

    const makeMessage = (event, params) => `${question}\n${event}${params.map(stringify)}`

    socket.on("connection", client => {
        client.on("open", () => handle(barter.open, client))

        client.on("message", message => {
            let [type, event, ...params] = message.split("\n")

            if (type == response) return answer.get(event)(...params.map(parse(client)))
            if (type == question) return handle(event, ...params.map(parse(client)))

            console.info(`invalide type ${type}`)
        })

        client.on("close", () => handle(barter.close, client))
    })

    return (event, ...params) => {
        let message = makeMessage(event, params)

        socket.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(message)
        })
    }
}

barter.open = Symbol("barter#open")
barter.close = Symbol("barter#close")
barter.response = Symbol("barter#response")

// ---------------------------------------------------- //

const http = require("http")
const server = http.createServer()

let io = barter(server, on => [
    on()
])
