import { app, offset } from "./lib/graphics"
import { on } from 'eventmonger'
import * as PIXI from 'pixi.js'
import { meter, drawTime } from "./config"
import { ease } from 'pixi-ease'
import {
	createObjectEvent, removeObjectEvent,
	createPlayerEvent, updatePlayerEvent, removePlayerEvent,
	isOurPlayer
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
const toCentered = n => n * meter + center

const moveCameraToSprite = sprite => offset(
	sprite.x - window.innerWidth / 2,
	sprite.y - window.innerHeight / 2
)

/*////////////////*/
/*| Draw Objects |*/
/*////////////////*/

on(createObjectEvent, object => {
	let sprite = new PIXI.Graphics()

	if ( object.name == "wall" ) {
		sprite.beginFill(0x1e2021)
		sprite.drawRect( ...toGlobalCords(object), toGlobal(object.width), toGlobal(object.height))
		sprite.endFill()
	}

	if ( object.name == "tree" ) {
		sprite.beginFill(0x302621)
		sprite.drawCircle(0, 0, 25)
		sprite.endFill()

		sprite.x = toCentered(object.x)
		sprite.y = toCentered(object.y)
	}

	addSprite(object, sprite)
} )

on(removeObjectEvent, object => removeSprite(object) )

/*////////////////*/
/*| Draw Players |*/
/*////////////////*/

on(createPlayerEvent, player => {
	let sprite = new PIXI.Graphics()

	// draw a circle
	sprite.beginFill(0x333333)
	sprite.drawCircle(0, 0, 20)
	sprite.endFill()

	// keep track of some stuff about the player so we can see if it changes
	sprite.hp = player.hp

	// move the sprite to the right position
	sprite.x = toCentered(player.position.x)
	sprite.y = toCentered(player.position.y)

	// if this is the player then focus on the camera on them
	if ( isOurPlayer(player) ) {
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

on(updatePlayerEvent, player => {
	let sprite = getSprite(player)
	
	// slide that player into its new position
	let anim = ease.add(sprite, {
		x: toCentered(player.position.x),
		y: toCentered(player.position.y)
	}, {
		duration: drawTime,
		ease: "linear"
	})

	if ( sprite.hp != player.hp ) {
		//  make a colored tag showing how the players health has changed
		let text = new PIXI.Text(player.hp - sprite.hp, {
			fontFamily: 'Arial',
			fontSize: 18,
			fill: (player.hp - sprite.hp < 0)? 0xff0000 : 0x4ee44e
		})

		// center the text
		text.anchor.x = 0.5

		// position the text on top of the player
		text.x = sprite.x
		text.y = sprite.y - 20

		// save the new hp
		sprite.hp = player.hp

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
	
	// if this is the main player we need to move the camera so it fallows them
	if ( isOurPlayer(player) ) anim.on("each", () => moveCameraToSprite(sprite) )
} )

on(removePlayerEvent, player => removeSprite(player) )

/*//////////////*/
/*| Draw Moves |*/
/*//////////////*/