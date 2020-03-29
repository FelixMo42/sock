const eventmonger = Object.freeze({
    newEvent: () => new Set(),
    fire: (event, data) => event.forEach(callback => callback(data)),
    on: (event, callback) => event.add(callback),
    off: (callback) => event.delete(callback)
})