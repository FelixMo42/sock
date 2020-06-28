import { players, objects } from "./database.js"

export const addVector = a => (b={x:0,y:0}) => ({x: a.x + b.x, y: a.y + b.y})
export const addNumber = a => (b=0) => a + b

export const wait = ms => new Promise(done => setTimeout(done, ms))

export const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const getDistance = (a, b) => Math.abs( a.x - b.x ) + Math.abs( a.y - b.y )

export const objectIncludes = (object, {x, y}) => x >= object.x && x < object.x + object.width && y >= object.y && y < object.y + object.height

export const isEmptyPosition = position => {
    for (let object of objects.values())
        if ( objectIncludes(object, position) ) return false

    for (let player of players.values())
        if ( player.position.x == position.x && player.position.y == position.y ) return false

    return true
}