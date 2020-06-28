export const wait = ms => new Promise(done => setTimeout(done, ms))

export const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min