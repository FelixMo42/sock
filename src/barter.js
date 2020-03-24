const WebSocket = require("ws")
const uuidv1 = require("uuid").v1

let barter = module.exports = (server, ask) => {
    const socket = new WebSocket.Server({ server })

    const callbacks = new Map()
    const clients = new Set()

    const QUESTION = 0
    const RESPONSE = 1
    const ANNOUNCE = 2

    socket.on("connection", client => {
        let send = (question, respond) => {
            if (respond !== undefined) {
                let id = uuidv1()
                callbacks.set(id, respond)
    
                client.send(`${QUESTION}\n${JSON.stringify(question)}\n${id}`)
            } else {
                client.send(`${ANNOUNCE}\n${JSON.stringify(question)}`)
            }
        }

        clients.add(send)

        ask(send, barter.clientJoined, () => {})

        client.on("message", event => {
            let [type, data, id] = event.split("\n")

            // the data should be in form of a json
            let body = JSON.parse(data)

            // were just being told something
            if (type == ANNOUNCE) ask( body )

            // this is a response to a question we asked
            if (type == RESPONSE) callbacks.get(id)( send, body )

            // were being asked a question
            if (type == QUESTION) ask(body, response => client.send(`${RESPONSE}\n${JSON.parse(response)}\n${id}`))
        })

        client.on("close", () => {
            clients.remove(send)
        })
    })

    return (question, respond) => {
        if (respond != undefined) {
            let id = uuidv1()

            callbacks.set(id, respond)

            socket.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(`${QUESTION}\n${JSON.stringify(question)}\n${id}`)
                }
            })
        } else {
            socket.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(`${ANNOUNCE}\n${JSON.stringify(question)}`)
                }
            })
        }

        // return a copy of all the sets that we sent the question out to
        return new Set(clients)
    }
}

barter.clientJoined = Symbol()
barter.clientLeft = Symbol()