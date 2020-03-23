const WebSocket = require("ws")
const uuid = require("uuid").v1

let barter = module.exports = (server, ask) => {
    const socket = new WebSocket.Server({ server })

    const callbacks = new Map()

    const QUESTION = 0
    const RESPONSE = 1

    socket.on("connection", client => {
        ask(client, barter.clientJoined, () => {})

        client.on("message", event => {
            let [type, id, data] = event.split("\n")

            // this is a response to a question we asked
            if (type == RESPONSE)
                callbacks.get(id)(data)

            // were being asked a question
            if (type == QUESTION)
                ask(data, response => client.send(`${RESPONSE}\n${id}\n${response}`))
        })

        client.on("close", () => ask(client, barter.clientLeft, () => {}))
    })

    return (question, respond) => {
        let id = uuid()
        callbacks.set(id, respond)

        socket.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`${QUESTION}\n${id}\n${question}`)
            }
        })
    }
}

barter.clientJoined = Symbol()
barter.clientLeft = Symbol() 