import commander from 'commander'
import { isEmptyPosition, random } from "./util/util.js"
import { createObject } from "./core/object.js"
import {
    // entity prototypes
    tree, wall
} from "./game/main.js"

let size = 25

const generateNewMap = () => {
    for (let i = 0; i < 30; i++) createWall(
        random(-size, +size), random(-size, +size),
        random(1, 10), random(1, 10)
    )

    for (let i = 0; i < 100; i++) createTree( random(-size, +size), random(-size, +size) )
}

const createWall = (x, y, w, h) => createObjectIfSpotAvailabe(wall, x, y, w, h)
const createTree = (x, y) => createObjectIfSpotAvailabe(tree, x, y, 1, 1)

const createObjectIfSpotAvailabe = (type, x, y, w, h) => {
    for (let dx = 0; dx <= w; dx++) {
        for (let dy = 0; dy <= h; dy++) {
            if ( !isEmptyPosition({x: x + dx, y: y + dy}) ) return false
        }
    }

    return createObject(type, { "position" : {x, y}, "size" : { x: w, y: h} })
}

/*/////////////*/
/*| commander |*/
/*/////////////*/

commander.program.version('1.0.0')
commander.program.command('generate').action(generateNewMap)

console.log("")
commander.program.parse(process.argv)
console.log("")