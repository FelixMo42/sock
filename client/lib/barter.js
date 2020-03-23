const barter = (url, ask) => {
    const ws = new WebSocket(url)

    const callbacks = new Map()

    const QUESTION = 0
    const RESPONSE = 1

    ws.onopen = event => console.log("open", event)
    ws.onclose = event => console.log("close", data)
    ws.onerror = event => console.log("error", event)

    ws.onmessage = event => {
        let [type, id, question] = event.data.split("\n")

        if (type == RESPONSE)
            callbacks.get(id)(data)

        if (type == QUESTION)
            ask(question, response => ws.send(`${id}\n${response}`))
    }

    return (question, respond) => {
        let id = uuidv1()
        callbacks.set(id, respond)

        ws.send(`${QUESTION}\n${id}\n${question}`)
    }
}