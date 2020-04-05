const MAX_SEARCH_SIZE = 1000

const Vector = (x, y) => ({x, y})

const pathfind = (() => {
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
        let path = []

        let node = target

        while ( "previous" in node ) {
            path.unshift(node.node)

            node = node.previous
        }

        return path
    }

    const equals = (a, b) => a.x == b.x && a.y == b.y

    return (start, target) => {
        let open = new Heap()
        let closed = new Set()
        let nodes = new Set()

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

        return []
    }
})()