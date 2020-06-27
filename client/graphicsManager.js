import { app, offset } from "./lib/graphics"
import { on } from './lib/eventmonger'
import * as PIXI from 'pixi.js'
import { meter } from "./config"
import {
	newObjectEvent,
	newPlayerEvent,
    removePlayerEvent,
    removeObjectEvent,
	updatePlayerEvent,
	getPlayer
} from "./lib/api"

// set the backgroud color
app.renderer.backgroundColor = 0x425421

const center = meter / 2
const sprites = new Map()

const addSprite = (source, sprite) => {
    // add the sprite to the stage so that is will be shown
    app.stage.addChild(sprite)

    // keep a refrence to it so we can find it again
    sprites.set(source.id, sprite)
}

const removeSprite = source => {
    // remove the sprite form the world of the visble
    app.stage.removeChild( sprites.get(source.id) )

    // trash are refrence to it
    sprites.delete(source.id)
}

const getSprite = source => sprites.get(source.id)

const toGlobal = n => n * meter
const toGlobalCords = ({x, y}) => [x * meter, y * meter]

/*////////////////*/
/*| Draw Objects |*/
/*////////////////*/

on(newObjectEvent, object => {
	let sprite = new PIXI.Graphics()

	sprite.beginFill(0x1e2021)
	sprite.drawRect( ...toGlobalCords(object), toGlobal(object.width), toGlobal(object))
	sprite.endFill()

	addSprite(object, sprite)
} )

on(removeObjectEvent, object => removeSprite(object) )

/*////////////////*/
/*| Draw Players |*/
/*////////////////*/

on(newPlayerEvent, player => {
	let sprite = new PIXI.Graphics()

	// draw a circle
	sprite.beginFill(0x333333)
	sprite.drawCircle(0, 0, 20)
	sprite.endFill()

	// move the sprite to the right position
	sprite.x = player.position.x * meter + center
	sprite.y = player.position.y * meter + center

	// if this is the player then focus on the camera on them
	if ( player == getPlayer() ) {
		offset(
			player.position.x * meter - window.innerWidth / 2,
			player.position.y * meter - window.innerHeight / 2
		)
	} else {
		// give the player a name tag
		let text = new PIXI.Text( player.id, {
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

	addSprite(player, sprite)
} )

on(removePlayerEvent, player => removeSprite(player) )

on(updatePlayerEvent, player => {
	let sprite = getSprite(player)
	
} )

/*//////////////*/
/*| Draw Moves |*/
/*//////////////*/