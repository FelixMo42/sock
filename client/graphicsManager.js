import { Event, on, fire } from 'eventmonger'
import * as PIXI from 'pixi.js'
import { ease } from 'pixi-ease'

import { app } from "./display/display"
import { moveCamera } from "./display/camera"
import { mouseMoved } from "./display/mouse"

import {
	createObjectEvent, removeObjectEvent,
	createPlayerEvent, updatePlayerEvent, removePlayerEvent,
	isOurPlayer, getPlayer, hasPlayer
} from "./lib/api"

import { getMoves } from "./movesManager"
import { meter, drawTime, bgColor } from "./config"
import { drawTree, drawWall } from "./art"

// set the backgroud color
app.renderer.backgroundColor = bgColor

const center = meter / 2
const sprites = new Map()

const addSprite = (source, sprite, location=app.stage) => {
    // add the sprite to the stage so that is will be shown
    location.addChild(sprite)

    // keep a refrence to it so we can find it again
    sprites.set(source, sprite)
}

const removeSprite = source => {
	// get the sprite of our interest
	let sprite = sprites.get(source)

    // remove the sprite form watever container it is in
	sprite.parent.removeChild(sprite)

    // trash are refrence to it
    sprites.delete(source)
}

const getSprite = source => sprites.get(source)

const toGlobal = n => n * meter
const toCentered = n => n * meter + center

const moveCameraToPlayer = () => moveCamera( getSprite( getPlayer() ) )

const ourPlayerMoved = Event()
on(ourPlayerMoved, () => moveCameraToPlayer)

/*//////////*/
/*| layers |*/
/*//////////*/

const moves = new PIXI.Graphics()
app.stage.addChild(moves)

const mains = new PIXI.Container()
app.stage.addChild(mains)

const walls = new PIXI.Graphics()
walls.lineStyle(3, 0x000000, 1.0)
walls.filters = [ new PIXI.filters.FXAAFilter() ]
app.stage.addChild(walls)

const trees = new PIXI.Graphics()
trees.lineStyle(3, 0x000000, 1.0)
trees.filters = [ new PIXI.filters.FXAAFilter() ]
app.stage.addChild(trees)

/*////////////////*/
/*| Draw Objects |*/
/*////////////////*/

on(createObjectEvent, object => {
	let w = toGlobal(object.width)
	let h = toGlobal(object.height)

	let x = toGlobal(object.x)
	let y = toGlobal(object.y)

	if ( object.name == "wall" ) {
		walls.beginFill(0x1e2021)
		walls.drawRect(x, y, w, h)
		walls.endFill()

		drawWall(walls, x,y , 0,0 , w,0)
		drawWall(walls, x,y , w,0 , w,h)
		drawWall(walls, x,y , w,h , 0,h)
		drawWall(walls, x,y , 0,h , 0,0)
	}

	if ( object.name == "tree" ) {
		drawTree(trees, x + w / 2, y + h / 2)
	}

	// addSprite(object, graphicsToSprite(sprite, toGlobal(object.x), toGlobal(object.y)))
} )

on(removeObjectEvent, object => removeSprite(object) )

/*////////////////*/
/*| draw players |*/
/*////////////////*/

on(createPlayerEvent, player => {
	let sprite = new PIXI.Graphics()

	sprite.filters = [ new PIXI.filters.FXAAFilter() ]

	// draw a circle
	sprite.beginFill(0x333333)
	sprite.drawCircle(0, 0, 20)
	sprite.endFill()

	// move the sprite to the right position
	sprite.x = toCentered(player.position.x)
	sprite.y = toCentered(player.position.y)

	// if this is the player then focus on the camera on them
	if ( isOurPlayer(player) ) {
		moveCamera(sprite)
	} else {
		// give the player a name tag
		let text = new PIXI.Text( player, {
			fontFamily: 'Arial',
			fontSize: 18,
			fill: 0xd0d0d0
		})

		// center the text
		text.anchor.x = 0.5

		// move it above the sprite
		text.y = -40
		
		// add it the the sprite
		sprite.addChild(text)
	}

	addSprite(player, sprite, mains)
} )

on(updatePlayerEvent, ({player, update}) => {
	let sprite = getSprite(player)
	
	// slide that player into its new position
	if ( "position" in update ) {
		let anim = ease.add(sprite, {
			x: toCentered(update.position.x),
			y: toCentered(update.position.y)
		}, {
			duration: drawTime,
			ease: "linear"
		})

		// if this is the main player we need to move the camera so it fallows them
		if ( isOurPlayer(player) ) anim.on("each", () => fire(ourPlayerMoved) )
	}

	if ( "hp" in update ) {
		//  make a colored tag showing how the players health has changed
		let text = new PIXI.Text(update.hp - player.hp, {
			fontFamily: 'Arial',
			fontSize: 18,
			fill: (update.hp > player.hp) ? 0x4ee44e : 0xff0000
		})

		// center the text
		text.anchor.x = 0.5

		// position the text on top of the sprite
		text.x = sprite.x
		text.y = sprite.y - 20

		// make the text slide up
		let anim = ease.add(text, {
			x: text.x,
			y: text.y - 60
		}, {
			duration: 750
		})

		// make the text visable
		app.stage.addChild(text)

		// remove the text when the animation is complete
		anim.on("complete", () => app.stage.removeChild(text))
	}
} )

on(removePlayerEvent, player => removeSprite(player) )

/*///////////*/
/*| draw ui |*/
/*///////////*/

app.ticker.add(() => {
	if ( !hasPlayer() ) return
	moves.clear()
	moves.lineStyle(3,0x000000)

	moves.moveTo(
		getSprite( getPlayer() ).x,
		getSprite( getPlayer() ).y
	)

	for (let move of getMoves()) {
		if ( move.action == "move" ) {
			moves.lineTo(
				toCentered(move.inputs[0].x),
				toCentered(move.inputs[0].y)
			)
		}
	}

	app.renderer.render(moves)
})

let cursor = new PIXI.Graphics()
cursor.lineStyle(2,0x001100)
cursor.drawRoundedRect(0, 0, meter, meter, 10 , 10)
app.stage.addChild(cursor)

on(mouseMoved, ({x, y}) => {
	cursor.x = Math.floor(x / meter) * meter
	cursor.y = Math.floor(y / meter) * meter
})