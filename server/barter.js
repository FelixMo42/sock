import ws from "ws"
import uuid from "uuid"
import urlon from "urlon"

const response = "R"
const question = "Q"

const emiter = Symbol("barter#emiter")

const makeEventHandler = func => {
    // build a map with all the events and callbacks
    let events = new Map( func((name, callback) => [name, callback]) )

    // return a function that triger a specified event
    return (event, ...params) => {
        // make sure we have the event, and if we do call it
        if (events.has(event)) return events.get(event)(...params)

        // just log it, dont throw any errors or any thing
        console.error(`no handler for event "${event.toString()}"`)
    }
}

export default (server, events) => {
    const socket = new ws.Server({server})
    const handle = makeEventHandler(events)
    const answer = new Map()

    const stringify = param => {
        if (typeof param === "function") {
            let id = "#" + uuid.v1()

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

    socket.on("connection", (client, request) => {
        let emit = (event, ...params) => client.send(`${question}\n${event}${params.map(stringify)}`)

        client[emiter] = emit

        handle(enter, emit, urlon.parse(request.url.substr(2)))

        client.on("message", message => {
            let [type, event, ...params] = message.split("\n")

            if (type == response) return answer.get(event)(reply, emit, ...params.map(parse(client)))

            if (type == question) return handle(event, emit, ...params.map(parse(client)))

            // lets no error or any thing, just log it
            console.error(`invalide type ${type}`)
        })

        client.on("close", () => {
            // handle it closing
            handle(leave, emit)
        
            // tell all callbacks that is closed
            answer.forEach(handle => handle(leave, emit))
        })
    })

    // log that the socket has closed
    socket.on("close", () => console.log("websocket closed"))

    const emit = (event, ...params) => {
        let message = `${question}\n${event}${params.map(stringify)}`

        let clients = Array.from(socket.clients.values()).filter(client => client.readyState == ws.OPEN)

        clients.forEach(client => client.send(message))

        // return a copy of the current clients as emiters
        return clients.map(client => client[emiter])
    }

    emit.to = (func, event, ...params) => {
        let message = `${question}\n${event}${params.map(stringify)}`

        let clients = Array.from(socket.clients.values())
            .filter(client => client.readyState == ws.OPEN)
            .filter(client => func(client[emiter]))

        clients.forEach(client => client.send(message))

        // return a copy of the current clients as emiters
        return clients.map(client => client[emiter])
    }

    return emit
}

export const enter = Symbol("barter#enter")
export const leave = Symbol("barter#leave")
export const reply = Symbol("barter#reply")