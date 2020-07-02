import { Event, fire, on } from 'eventmonger'

import { keyUp, isNumeric, asNumber } from './display/keyboard'
import { mouseUp, mousePos } from './display/mouse'

import EventQueue from './lib/eventqueue'
import { pathfind } from './lib/path'
import { getPlayerAtPosition, getPlayer, onTurn } from "./lib/api"
import { flag, effects } from "./lib/dirty"

import { meter } from "./config"

// the list of moves
const moves = new EventQueue()

export const movesUpdated = Event()

on(flag(moves), () => fire(movesUpdated, getMoves()))

// a way to access all the moves
export const getMoves = () => [
    currentMove,
    ...moves.list
]

export const addMove = effects(moves, move => moves.add(move))

export const clearMoves = effects(moves, () => moves.clear())

// handle the callback to set the move
let currentMove = { action: "wait" }
onTurn(effects(moves, callback => moves.next(move => {
    currentMove = move
    
    callback({ source: getPlayer().id, ...move })
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

    // first clear the list of moves
    clearMoves()

    // what move are we trying to do?
    let action = getSelectedMove()
    
    // if were trying to move then do that
    if ( action == "walk" ) goToPoint( mouseTile() )

    // outher wise attack!
    else attack( mouseTile(), action )
})

/*/////////////////////*/
/*| utility functions |*/
/*/////////////////////*/

const attack = (target, action) => {
    // get the player at the target position
    let player = getPlayerAtPosition(target)

    // theres no player here, its a lie
    if ( !player ) return false

    // add this attack to our list of moves
    addMove({ action, inputs: [player.id] })

    // return news of are success
    return true
}

const goToPoint = (target, source=getPlayer().position) => {
    // pathfind to the target location then add all the points in the path to the event queue
    pathfind(source, target).forEach(point => addMove({action: "move", inputs: [point]}))
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