import Heap from "./heap"
import { objects, players, getDistance } from "./api"

const MAX_SEARCH_SIZE = 100000

export const Vector = (x, y) => ({x, y})

const objectIncludes = (object, {x, y}) => x >= object.x && x < object.x + object.width && y >= object.y && y < object.y + object.height

const isWalkable = position => {
    for (let object of objects.values()) {
        if ( objectIncludes(object, position) ) return false
    }

    for (let player of players.values()) {
        if ( player.position.x == position.x && player.position.y == position.y ) return false
    }

    return true
}

const getHeuristic = (from, to) => getDistance(from, to)
    
const getEdgeCost = () => 1

const getNeighbors = ({x, y}) => [
    Vector(x + 1 , y    ),
    Vector(x - 1 , y    ),
    Vector(x - 1 , y - 1),
    Vector(x + 1 , y - 1),
    Vector(x + 1 , y + 1),
    Vector(x - 1 , y + 1),
    Vector(x     , y + 1),
    Vector(x     , y - 1)
]

const getNodeHash = ({x, y}) => `${x},${y}`

const makePath = target => {
    // only add the final node if its walkable
    let path = isWalkable(target.node) ? [target.node] : []

    let node = target.previous

    // check if were allready at the target location
    if (!node) return path

    while ( "previous" in node ) {
        // add this node to the start of the list
        path.unshift(node.node)

        // and find the node leading to this one
        node = node.previous
    }

    return path
}

const equals = (a, b) => a.x == b.x && a.y == b.y

export const pathfind = (start, target) => {
    let open  = new Heap()
    let closed = new Set()
    let nodes  = new Set()

    open.add({ priority: 0, cost: 0, node: start })

    nodes.add( getNodeHash(start) )

    let add = (node, previous) => {
        let cost = previous.cost + getEdgeCost(previous, node)
        let heuristic = getHeuristic(node, target)
        let priority = cost + heuristic

        open.add({ priority, previous, cost, node })

        nodes.add( getNodeHash(node) )
    }

    let i = 0

    while ( open.length > 0 && i < MAX_SEARCH_SIZE ) {
        let current = open.pop()

        if ( equals(current.node, target) ) return makePath( current )

        closed.add( getNodeHash(current.node) )

        for (let neighbor of getNeighbors(current.node).filter(neighbor => isWalkable(neighbor) || equals(neighbor, target))) {
            if ( !closed.has(neighbor) && !nodes.has(neighbor) ) add(neighbor, current)
        }

        i += 1
    }

    if ( open.length == 0     ) console.log("pathfinder error: no path")
    if ( i == MAX_SEARCH_SIZE ) console.log("pathfinder error: too far")

    return []
}

function *range(min, max) {
    let sign = Math.sign(max)

    for (let i = min; i < Math.abs(max); i++) yield sign * i
}

export const raycast = (source, target) => {
    let path = []
    
    // get how far it going in either direction
    let deltaX = target.x - source.x
    let deltaY = target.y - source.y

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        let slope = deltaY / deltaX
        
        for (let x of range(1, deltaX)) path.push( Vector(source.x + x, source.y + Math.floor(slope * x)) )
    } else {
        let slope = deltaX / deltaY

        for (let y of range(1, deltaY)) path.push(Vector(source.x + Math.floor(slope * y), source.y + y))
    }

    // add the final point to the path
    path.push(Vector(target.x, target.y))

    // return the path
    return path
}