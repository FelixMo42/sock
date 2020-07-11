import commander from 'commander'
import { isEmptyPosition, random } from "./util/util.js"
import { createObject } from "./core/object.js"

let size = 25

const generateNewMap = () => {
    for (let i = 0; i < 30; i++) createWall(
        random(-size, +size), random(-size, +size),
        random(1, 10), random(1, 10)
    )

    for (let i = 0; i < 100; i++) createTree( random(-size, +size), random(-size, +size) )
}

const createWall = (x, y, width, height) => createObjectIfSpotAvailabe("wall", x, y, width, height)
const createTree = (x, y) => createObjectIfSpotAvailabe("tree", x, y, 1, 1)

const createObjectIfSpotAvailabe = (type, x, y, width, height) => {
    for (let dx = 0; dx <= width; dx++) {
        for (let dy = 0; dy <= height; dy++) {
            if ( !isEmptyPosition({x: x + dx, y: y + dy}) ) return false
        }
    }

    return createObject({type, position: {x, y}, width, height})
}

/*/////////////*/
/*| commander |*/
/*/////////////*/

commander.program.version('1.0.0')
commander.program.command('generate').action(generateNewMap)

console.log("")
commander.program.parse(process.argv)
console.log("")