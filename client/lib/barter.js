const response = "R"
const question = "Q"

const makeEventHandler = func => {
    let map = new Map(func((name, callback) => [name, callback]))

    // return a function that triger a specified event
    return (event, params) => {
        // make sure we have the event
        if (map.has(event)) return map.get(event)(...params)

        // just log it
        console.error(`no handler for event `, event)
    }
}

const barter = (url, events, context) => {
    const handle = makeEventHandler(events)
    const socket = new WebSocket(url, context)
    const answer = new Map()

    const stringify = param => {
        if (typeof param == "function") {
            let id = "#" + uuidv1()

            answer.set(id, makeEventHandler(param))

            return "\n" + id
        } else {
            return "\n" + JSON.stringify(param)
        }
    }

    const parse = param => {
        if (param[0] == "#")
            return (...params) => socket.send(`${response}\n${param}${params.map(stringify)}`)

        return JSON.parse(param)
    }

    socket.onopen  = event => handle(barter.join, [event])
    socket.onclose = event => handle(barter.close, [event])
    socket.onerror = event => handle(barter.error, [event])

    socket.onmessage = message => {
        let [type, event, ...params] = message.data.split("\n")

        if (type == response) return answer.get(event)(barter.response, params.map(parse))
        if (type == question) return handle(event, params.map(parse))

        console.error(`invalide type ${type}`)
    }

    return (event, ...params) => socket.send(`${question}\n${event}${params.map(stringify)}`)
}

barter.join = Symbol("barter#open")
barter.leave = Symbol("barter#close")
barter.error = Symbol("barter#error")
barter.response = Symbol("barter#response")