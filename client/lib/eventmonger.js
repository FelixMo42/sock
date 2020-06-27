export const Event = () => new Set()
export const fire = (event, data) => event.forEach(callback => callback(data))
export const on = (event, callback) => event.add(callback)
export const off = (callback) => event.delete(callback)