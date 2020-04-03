const MAX_SEARCH_SIZE = 1000

const Vector = (x, y) => ({x, y})

const pathfind = (() => {
    let objectIncludes = (object, {x, y}) => x >= object.x && x < object.x + object.width && y >= object.y && y < object.y + object.height

    let isWalkable = position => {
        for (let object of objects.values()) {
            if ( objectIncludes(object, position) ) return false
        }
    
        for (let player of players.values()) {
            // if ( player.position.x == position.x && player.position.y == position.y ) return false
        }
    
        return true
    }

    let getHeuristic = (from, to) => Math.abs(from.x - to.x) + Math.abs(from.y - to.y)
    
    let getEdgeCost = () => 1

    let getNeighbors = ({x, y}) => [
        Vector(x + 1 , y    ),
        Vector(x - 1 , y    ),
        Vector(x - 1 , y - 1),
        Vector(x + 1 , y - 1),
        Vector(x + 1 , y + 1),
        Vector(x - 1 , y + 1),
        Vector(x     , y + 1),
        Vector(x     , y - 1)
    ].filter(node => isWalkable(node))

    let getNodeHash = ({x, y}) => `${x},${y}`

    let makePath = target => {
        let path = []

        let node = target

        while ( "previous" in node ) {
            path.unshift(node.node)

            node = node.previous
        }

        return path
    }

    return (start, target) => {
        let open = new Heap()
        let closed = new Set()
        let nodes = new Set()

        open.add({
            priority: 0,
            cost: 0,
            node: start
        })

        nodes.add( getNodeHash(start) )

        let add = (node, previous) => {
            let cost = previous.cost + getEdgeCost(previous, node)
            let heuristic = getHeuristic(node, target)
            let priority = cost + heuristic

            open.add({
                priority,
                previous,
                cost,
                node
            })

            nodes.add( getNodeHash(node) )
        }

        let i = 0

        while ( open.length > 0 && i < MAX_SEARCH_SIZE ) {
            let current = open.pop()

            if ( getNodeHash(current.node) == getNodeHash(target) ) {
                return makePath( current )
            }

            closed.add( getNodeHash(current.node) )

            for (let neighbor of getNeighbors(current.node)) {
                if ( !closed.has(neighbor) && !nodes.has(neighbor) ) {
                    add(neighbor, current)
                }
            }

            i += 1
        }

        return []
    }
})()