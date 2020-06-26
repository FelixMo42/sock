<script>

import Grapics, { app } from "./grapics.svelte"
import * as PIXI from 'pixi.js'
import EventQueue from './lib/eventqueue'
import eventmonger from './lib/eventmonger'
import { pathfind } from './lib/astar'
import {
	newObjectEvent,
	newPlayerEvent,
	removePlayerEvent,
	updatePlayerEvent,
	getPlayerAtPosition,
	onTurn
} from "./lib/api"

/*/////////////////////////////////*/
/*| utility functions + variables |*/
/*/////////////////////////////////*/

const moves = new EventQueue()

const meter = 60
const center = meter / 2

const clamp = (min, max) => value => Math.max(Math.min(value, max), min)
const div = (a, b) => Math.floor(a / b)

/*////////////////////*/
/*| handle callbacks |*/
/*////////////////////*/

eventmonger.on(newObjectEvent, object => {
	let sprite = new PIXI.Graphics()

	sprite.beginFill(0x515151)
	sprite.drawRect(object.x * meter, object.y * meter, object.width * meter, object.height * meter)
	sprite.endFill()

	app.stage.addChild(sprite)
} )
eventmonger.on(newPlayerEvent, player => {
	let sprite = new PIXI.Graphics()

	sprite.beginFill(0x515151)
	sprite.drawCircle(player.x * meter + center, player.t * meter + center, 20)
	sprite.endFill()

	app.stage.addChild(sprite)
} )

eventmonger.on(removePlayerEvent, player => {} )
eventmonger.on(updatePlayerEvent, player => {} )

let currentMove = { type: "wait" }
onTurn(callback => moves.next(move => {
    currentMove = move
    callback(move)
}))

/*///////////////////*/
/*| moves functions |*/
/*///////////////////*/

function attack(target, type) {
    // get the player at the target position
    let player = getPlayerAtPosition(target)

    // theres no player here, its a lie
    if ( !player ) return false

    // add this attack to our list of moves
    moves.add({ type, target: player.id })

    // return news of are success
    return true
}

function goToPoint(source, target) {
    // pathfind to the target location then add all the points in the path to the event queue
    pathfind(source, target).forEach(point => moves.add({type: "move", target: point}))
}

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
    if ( num < 0 || num >= knowMoves.length) return false

    selected = num

    return true
}

const getSelectedMove = () => knowMoves[selected]

</script>

<main>
	<div id="game"><Grapics/></div>
</main>

<style>
	#game {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		position: absolute;
		z-index: -100;
	}
</style>