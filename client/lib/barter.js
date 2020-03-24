const barter = (url, ask) => {
    const ws = new WebSocket(url)

    const callbacks = new Map()

    const QUESTION = 0
    const RESPONSE = 1
    const ANNOUNCE = 2

    ws.onopen = event => console.log("open", event)
    ws.onclose = event => console.log("close", event)
    ws.onerror = event => console.log("error", event)

    ws.onmessage = event => {
        let [type, data, id] = event.data.split("\n")

        let body = JSON.parse(data)

        // were just being told something
        if (type == ANNOUNCE) ask(body, () => console.error("can not awnser an announcment."))

        // are question was awnsered
        if (type == RESPONSE) callbacks.get(id)(body)

        // we were asked a question
        if (type == QUESTION) ask(body, response => ws.send(`${RESPONSE}\n${JSON.stringify(response)}\n${id}`))
    }

    return (question, respond) => {
        if (respond !== undefined) {
            let id = uuidv1()
            callbacks.set(id, respond)

            ws.send(`${QUESTION}\n${question}\n${id}`)
        } else {
            ws.send(`${ANNOUNCE}\n${question}`)
        }
    }
}

const eventManager = callbacks => {
    let events = Object.fromEntries(callbacks((key, callback) => [key, callback]))

    return ([event, ...data], callback) => events[event](...data, callback)
}