import { createObject } from "./manager.js"
import { isEmptyPosition, random } from "./util.js"

let size = 100

const generateNewMap = () => {
    // clear out the db first
    clear()
    
    for (let i = 0; i < 1000; i++) createTree( random(-size, +size), random(-size, +size) )

    for (let i = 0; i < 100; i++) createWall(
        random(-size, +size), random(-size, +size),
        random(1, 10), random(1, 10)
    )
}

const createWall = (x, y, width, height) => createObjectIfSpotAvailabe("wall", x, y, width, height)
const createTree = (x, y) => createObjectIfSpotAvailabe("tree", x, y, 1, 1)

const createObjectIfSpotAvailabe = (name, x, y, width, height) => {
    for (let dx = 0; dx <= width; dx++) {
        for (let dy = 0; dy <= height; dy++) {
            if ( !isEmptyPosition(x + dx, y + dy) ) return false
        }
    }

    return createObject({name, x, y, width, height})
}

/*/////////////*/
/*| commander |*/
/*/////////////*/

import commander from 'commander'
import { clear } from './database.js'

commander.program.version('1.0.0')
commander.program.command('clear').action(clear)
commander.program.command('generate').action(generateNewMap)

console.log("")
commander.program.parse(process.argv)
console.log("")