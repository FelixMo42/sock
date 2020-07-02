import { getObjects } from "./core/object.js"

export const wait = ms => new Promise(done => setTimeout(done, ms))

export const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const inRange = (a, b, r) => ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) <= (r + 0.5) ** 2

export const objectIncludes = (object, {x, y}) =>
    x >= object.position.x && x < object.position.x + object.width &&
    y >= object.position.y && y < object.position.y + object.height

export const isEmptyPosition = position => getObjects().each( object => !objectIncludes(object, position) )