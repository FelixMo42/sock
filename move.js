const Vector = (x, y) => ([x, y])
const Player = (p, v, s=Math.random()) => ({p, v, s})

// 

const GetPlayer = (players, [x, y]) => players.find( player => player.p[0] == x && player.p[1] == y )
const HasPlayer = (players, pos) => GetPlayer( players, pos ) != undefined

const Step = ([x0, y0], [x1, y1], callback) => {
    let dx = x1 - x0
    let dy = y1 - y0

    if (Math.abs(dx) > Math.abs(dy)) {
        for (let x = 0; x <= Math.abs(dx); x++) {
            if ( callback([ x0 + x, y0 + dy / dx * x ]) ) {
                return [ x0 + x, y0 + dy / dx * x ] 
            }
        }
    }
    
    if (Math.abs(dx) < Math.abs(dy)) {
        for (let y = 0; y <= Math.abs(dy); y++) {
            console.log( y0 + y )
            if ( callback([ x0 + dx / dy * y, y0 + y ]) ) {
                return [ x0 + dx / dy * y, y0 + y ] 
            }
        }
    }

    return [x1, y1]
}

// 

const Tick = (players) => {
    Move(players)
}

const Move = (players, player) => {
    // make sure their isent a player where were trying to do
    if ( !HasPlayer( players, player.v ) ) {
        player.p = player.v
    } else {
        Step( player.v, player.p, pos => {
            if ( !HasPlayer(players, pos) ) {
                player.p = pos

                return true
            }
        } )
    }

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
    Player( [4, 0], [4, 4] ),
    Player( [4, 4], [4, 4] )
]

//Tick(players)
Move(players, players[0])
Draw(players)
