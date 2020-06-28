// make a new event
export const Event = () => new Set()

// fire an event with some data
export const fire = (event, data) => event.forEach(callback => callback(data))

// add a callback for once an event is called
export const on = (event, callback) => {
    event.add(callback)
    return callback
}

// remove a callback
export const off = (event, callback) => event.delete(callback)

// returns a promise that will resolve on next event
export const once = event => new Promise(resolve => {
    let func = on(event, data => {
        off(event, func)
        resolve(data)
    })
})

export const onif = (event, condition, callback) => on(event, data => {
    if ( condition(data) ) callback(data)
})