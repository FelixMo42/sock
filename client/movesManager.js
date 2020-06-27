import EventQueue from './lib/eventqueue'
import { on } from './lib/eventmonger'
import { pathfind } from './lib/path'
import { keyUp, isNumeric, asNumber } from './lib/keyboard'
import { mouseUp, mousePos } from './lib/mouse'
import { getPlayerAtPosition, getPlayer, onTurn } from "./lib/api"
import { meter } from "./config"

// the list of moves
const moves = new EventQueue()

// handle the callback to set the move
let currentMove = { type: "wait" }
onTurn(callback => moves.next(move => {
    currentMove = move
    console.log(move)
    callback(move)
}))

/*/////////////////////*/
/*| Handle user input |*/
/*/////////////////////*/

on(keyUp, key => {
	// select the move
	if ( isNumeric(key) ) select(asNumber(key) - 1)
})

on(mouseUp, button => {
    // we cant do anything if we dont have a player
    if ( !getPlayer() ) return

    // what move are we trying to do?
    let move = getSelectedMove()
    
    // if were trying to move then do that
    if ( move == "walk" ) goToPoint( mouseTile() )
})

/*/////////////////////*/
/*| utility functions |*/
/*/////////////////////*/

const attack = (target, type) => {
    // get the player at the target position
    let player = getPlayerAtPosition(target)

    // theres no player here, its a lie
    if ( !player ) return false

    // add this attack to our list of moves
    moves.add({ type, target: player.id })

    // return news of are success
    return true
}

const goToPoint = (target, source=getPlayer().position) => {
    // pathfind to the target location then add all the points in the path to the event queue
    pathfind(source, target).forEach(point => moves.add({type: "move", target: point}))
}

const mouseTile = () => ({
    x: Math.floor(mousePos.x / meter),
    y: Math.floor(mousePos.y / meter)
})

/*////////////////////////*/
/*| Move selection stuff |*/
/*////////////////////////*/

// what possible moves could we do
const knowMoves = [
    "walk",
    "slice",
    "shoot",
    "heal"
]

// the currently selected move
let selected = 0

// select a new move
const select = num => {
	// make sure the selected move is in range
    if ( num < 0 || num >= knowMoves.length) return false

	// set the selected move
	selected = num

	// report news of are succese
    return true
}

export const getSelectedMove = () => knowMoves[selected]