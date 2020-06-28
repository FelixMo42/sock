const response = "R"
const question = "Q"

const makeEventHandler = func => {
    let map = new Map(func((name, callback) => [name, callback]))

    // return a function that triger a specified event
    return (event, params) => {
        // make sure we have the event
        if (map.has(event)) return map.get(event)(...params)

        // just log it
        console.error(`no handler for event `, event, " : ", params)
    }
}

export default (url, events, context) => {
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

    socket.onopen  = event => handle(enter, [event])
    socket.onclose = event => handle(leave, [event])
    socket.onerror = event => handle(error, [event])

    socket.onmessage = message => {
        let [type, event, ...params] = message.data.split("\n")

        if (type == response) return answer.get(event)(reply, params.map(parse))
        if (type == question) return handle(event, params.map(parse))

        console.error(`invalide type ${type}`)
    }

    return (event, ...params) => socket.send(`${question}\n${event}${params.map(stringify)}`)
}

export const enter = Symbol("barter#enter")
export const leave = Symbol("barter#close")
export const error = Symbol("barter#error")
export const reply = Symbol("barter#reply")