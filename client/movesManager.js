import { Event, fire, on } from 'eventmonger'

import EventQueue from './lib/eventqueue'
import { pathfind } from './lib/path'
import { keyUp, isNumeric, asNumber } from './lib/keyboard'
import { mouseUp, mousePos } from './lib/mouse'
import { getPlayerAtPosition, getPlayer, onTurn } from "./lib/api"
import { meter } from "./config"

import { flag, effects } from "./lib/dirty"

// the list of moves
const moves = new EventQueue()

export const movesUpdatedEvent = Event()

on(flag(moves), () => fire(movesUpdatedEvent, getMoves()))

// easy way to access all the moves
export const getMoves = () => [
    currentMove,
    ...moves.list
]

export const addMove = effects(moves, move => moves.add(move))

// handle the callback to set the move
let currentMove = { type: "wait" }
onTurn(effects(moves, callback => moves.next(move => {
    currentMove = move
    callback(move)
})))

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

    // outher wise attack!
    else attack( mouseTile(), move )
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
    addMove({ type, target: player.id })

    // return news of are success
    return true
}

const goToPoint = (target, source=getPlayer().position) => {
    // pathfind to the target location then add all the points in the path to the event queue
    pathfind(source, target).forEach(point => addMove({type: "move", target: point}))
}

const mouseTile = () => ({
    x: Math.floor(mousePos.x / meter),
    y: Math.floor(mousePos.y / meter)
})

/*////////////////////////*/
/*| Move selection stuff |*/
/*////////////////////////*/

// what possible moves could we do
export const knowMoves = [
    "walk",
    "slice",
    "shoot",
    "heal"
]

// the currently selected move
let selected = 0

export const selectedNewMove = Event()

// select a new move
const select = num => {
	// make sure the selected move is in range
    if ( num < 0 || num >= knowMoves.length) return false

    // bail early if were reselecting the same move
    if (selected == num) return true

	// set the selected moves
    selected = num

    fire(selectedNewMove, getSelectedMove())

	// report news of are successes
    return true
}

export const getSelectedMove = () => knowMoves[selected]