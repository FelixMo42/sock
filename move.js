const Vector = (x, y) => ([x, y])
const Player = (p, v) => ({p, v})

// 

const GetPlayer = (players, [x, y]) => players.find( player => player.p[0] == x && player.p[1] == y )
const HasPlayer = (players, pos) => GetPlayer( players, pos ) != undefined

const Step = ([x0, y0], [x1, y1], callback) => {
    let dx = Math.abs(x1 - x0)
    let dy = Math.abs(y1 - y0)
    let sx = Math.sign(x1 - x0)
    let sy = Math.sign(y1 - y0)

    if (dx > dy) for (let x = 0; x <= dx; x++) {
        let pos = [
            x0 + sx * x,
            y0 + dy / dx * sx * x 
        ]

        if ( callback( pos ) ) return pos
    }
    
    if (dy != 0 && dx != 0) for (let y = 0; y <= dy; y++) {
        let pos = [
            x0 + dx / dy * sy * y,
            y0 + sy * y
        ]

        if ( callback(pos) ) return pos
    }

    return [x1, y1]
}

// 

const Tick = (players) => {
    // move all the players
    players.forEach( player => Move(players, player) )
}

const Move = (players, player) => {
    // make sure their isent a player where were trying to do
    Step( player.v, player.p, pos => {
        if ( !HasPlayer(players, pos) ) {
            player.p = pos

            return true
        }
    } )

    // reset the movement vector of the player
    player.v = player.p
}

const Draw = (players) => {
    for (let player of players) {
        console.log( player )
    }
}

// run it

let players = [
    Player( [8, 0], [4, 4] ),
    Player( [4, 4], [4, 4] )
]

Tick(players)
Draw(players)
