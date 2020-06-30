import { app, moveCamera } from "./lib/graphics"
import { on } from 'eventmonger'
import * as PIXI from 'pixi.js'
import { meter, drawTime, bgColor } from "./config"
import { ease } from 'pixi-ease'
import { drawTree, drawWall } from "./art"
import { mouseMoved } from "./lib/mouse"
import {
	createObjectEvent, removeObjectEvent,
	createPlayerEvent, updatePlayerEvent, removePlayerEvent,
	isOurPlayer
} from "./lib/api"

// set the backgroud color
app.renderer.backgroundColor = bgColor

const center = meter / 2
const sprites = new Map()

const addSprite = (source, sprite, location=app.stage) => {
    // add the sprite to the stage so that is will be shown
    location.addChild(sprite)

    // keep a refrence to it so we can find it again
    sprites.set(source.id, sprite)
}

const removeSprite = source => {
	// get the sprite of our interest
	let sprite = sprites.get(source.id)

    // remove the sprite form watever container it is in
	sprite.parent.removeChild(sprite)

    // trash are refrence to it
    sprites.delete(source.id)
}

const getSprite = source => sprites.get(source.id)

const toGlobal = n => n * meter
const toCentered = n => n * meter + center

/*//////////*/
/*| layers |*/
/*//////////*/

let mains = new PIXI.Container()
app.stage.addChild(mains)

let walls = new PIXI.Graphics()
walls.lineStyle(3, 0x000000, 1.0)
walls.filters = [ new PIXI.filters.FXAAFilter() ]
app.stage.addChild(walls)

let trees = new PIXI.Graphics()
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

	// keep track of some stuff about the player so we can see if it changes
	sprite.hp = player.hp

	// move the sprite to the right position
	sprite.x = toCentered(player.position.x)
	sprite.y = toCentered(player.position.y)

	// if this is the player then focus on the camera on them
	if ( isOurPlayer(player) ) {
		moveCamera(sprite)
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

	addSprite(player, sprite, mains)
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
	if ( isOurPlayer(player) ) anim.on("each", () => moveCamera(sprite) )
} )

on(removePlayerEvent, player => removeSprite(player) )

/*//////////////*/
/*| draw moves |*/
/*//////////////*/

{ // draw moves
	let sprite = new PIXI.Graphics()

	
}

{ // draw mouse cursor
	let cursor = new PIXI.Graphics()
	cursor.lineStyle(2,0x001100)
	cursor.drawRoundedRect(0, 0, meter, meter, 10 , 10)
	app.stage.addChild(cursor)

	on(mouseMoved, ({x, y}) => {
		cursor.x = Math.floor(x / meter) * meter
		cursor.y = Math.floor(y / meter) * meter
	})
}