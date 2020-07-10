import { on } from 'eventmonger'
import * as PIXI from 'pixi.js'
import { ease } from 'pixi-ease'

import { app } from "./display/display"
import { moveCamera } from "./display/camera"
import { mouseMoved } from "./display/mouse"

import {
	objectCreated, objectUpdated, objectRemoved,
	isOurPlayer, getOurPlayer, hasOurPlayer
} from "./lib/api"

import { getMoves } from "./movesManager"
import { meter, drawTime, bgColor } from "./config"
import { drawTree, drawWall } from "./art"

// set the backgroud color
app.renderer.backgroundColor = bgColor

const sprites = new Map()

const getSprite = source => sprites.get(source)

const toGlobal = n => n * meter

/*//////////*/
/*| layers |*/
/*//////////*/

const addLayer = () => app.stage.addChild(new PIXI.Container())

const layers = {
	underlay: addLayer(),
	player:   addLayer(),
	wall:     addLayer(),
	tree:     addLayer(),
	overlay:  addLayer(),
}

/*////////////*/
/*| graphics |*/
/*////////////*/

const addPlayer = (sprite, w, h, player) => {
	// draw a circle
	sprite.beginFill(0x333333)
	sprite.drawCircle(w / 2, h / 2, 20)
	sprite.endFill()

	if (isOurPlayer(player)) {
		moveCamera(sprite)
	} else {
		// give the player a name tag
		let text = new PIXI.Text(player.id, {
			fontFamily: 'Arial',
			fontSize: 18,
			fill: 0xd0d0d0
		})

		// center the text
		text.anchor.x = 0.5

		// move it above the sprite
		text.x = w / 2
		text.y = -15

		// add it the the sprite
		sprite.addChild(text)
	}
}

const addTree = (sprite, w, h) => {
	drawTree(sprite, w / 2, h / 2)
}

const addWall = (sprite, w, h) => {
	sprite.beginFill(0x1e2021)
	sprite.drawRect(0, 0, w, h)
	sprite.endFill()

	drawWall(sprite, 0, 0, w, 0)
	drawWall(sprite, w, h, 0, h)
	drawWall(sprite, w, 0, w, h)
	drawWall(sprite, 0, h, 0, 0)
}

/*////////////////*/
/*| Draw Objects |*/
/*////////////////*/

on(objectCreated, object => {
	let sprite = new PIXI.Graphics()

	sprite.lineStyle(3, 0x000000)

	// move it the right position
	sprite.x = toGlobal(object.position.x)
	sprite.y = toGlobal(object.position.y)

	let w = sprite.w = toGlobal(object.width)
	let h = sprite.h = toGlobal(object.height)

	if (object.type == "player") addPlayer(sprite, w, h, object)
	if (object.type == "tree")   addTree(sprite, w, h, object)
	if (object.type == "wall")   addWall(sprite, w, h, object)

	// add the sprite to the right layer
	layers[object.type].addChild(sprite)

	// keep a refrence to it so we can find it again
	sprites.set(object, sprite)
})

on(objectUpdated, ({ object, update }) => {
	let sprite = sprites.get(object)

	// slide that player into its new position
	if ("position" in update) {
		let anim = ease.add(sprite, {
			x: toGlobal(update.position.x),
			y: toGlobal(update.position.y)
		}, {
			duration: drawTime,
			ease: "linear"
		})

		if (isOurPlayer(object)) anim.on("each", () => moveCamera(sprite))
	}

	// show that the hp has updated
	if ("hp" in update) {
		//  make a colored tag showing how the objects health has changed
		let text = new PIXI.Text(update.hp - object.hp, {
			fontFamily: 'Arial',
			fontSize: 18,
			fill: (update.hp > object.hp) ? 0x4ee44e : 0xff0000
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
		anim.once("complete", () => app.stage.removeChild(text))
	}
})

on(objectRemoved, object => {
	// get the sprite of our interest
	let sprite = sprites.get(object)

	// remove the sprite form watever container it is in
	sprite.parent.removeChild(sprite)

	// trash are refrence to it
	sprites.delete(object)
})

/*///////////*/
/*| draw ui |*/
/*///////////*/

let moves = layers.underlay.addChild(new PIXI.Graphics())

app.ticker.add(() => {
	if (!hasOurPlayer()) return

	moves.clear()
	moves.lineStyle(3, 0x000000)

	let player = getOurPlayer()
	let sprite = getSprite(player)

	moves.moveTo(
		sprite.x + sprite.w / 2,
		sprite.y + sprite.h / 2
	)

	moves.lineTo(
		toGlobal(player.position.x) + sprite.w / 2,
		toGlobal(player.position.y) + sprite.h / 2
	)

	for (let move of getMoves()) {
		if (move.action == "move") {
			moves.lineTo(
				toGlobal(move.inputs[0].x) + sprite.w / 2,
				toGlobal(move.inputs[0].y) + sprite.h / 2
			)
		}
	}

	app.renderer.render(moves)
})

let cursor = layers.overlay.addChild(new PIXI.Graphics())
cursor.lineStyle(2, 0x001100)
cursor.drawRoundedRect(0, 0, meter, meter, 10, 10)

on(mouseMoved, ({ x, y }) => {
	cursor.x = Math.floor(x / meter) * meter
	cursor.y = Math.floor(y / meter) * meter
})