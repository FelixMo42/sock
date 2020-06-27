import { app, offset } from "./lib/graphics"
import { on } from './lib/eventmonger'
import * as PIXI from 'pixi.js'
import { meter, drawTime } from "./config"
import { ease } from 'pixi-ease'
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
const toCentered = n => n * meter + center
const toGlobalCords = ({x, y}) => [x * meter, y * meter]

const moveCameraToSprite = sprite => offset(
	sprite.x - window.innerWidth / 2,
	sprite.y - window.innerHeight / 2
)

/*////////////////*/
/*| Draw Objects |*/
/*////////////////*/

on(newObjectEvent, object => {
	let sprite = new PIXI.Graphics()

	sprite.beginFill(0x1e2021)
	sprite.drawRect( ...toGlobalCords(object), toGlobal(object.width), toGlobal(object.height))
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
	sprite.x = toCentered(player.position.x)
	sprite.y = toCentered(player.position.y)

	// if this is the player then focus on the camera on them
	if ( player == getPlayer() ) {
		moveCameraToSprite(sprite)
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
	
	let anim = ease.add(sprite, {
		x: toCentered(player.position.x),
		y: toCentered(player.position.y)
	}, {
		duration: drawTime,
		ease: "linear"
	})
	
	if ( player == getPlayer() ) {
		anim.on("each", () => moveCameraToSprite(sprite) )
	}
} )

/*//////////////*/
/*| Draw Moves |*/
/*//////////////*/