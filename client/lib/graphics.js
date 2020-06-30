import * as PIXI from 'pixi.js'
import { on } from 'eventmonger'
import { flag, effects } from './dirty'

// create a pixi application
export const app = new PIXI.Application({
    width:  window.innerWidth,
    height: window.innerHeight,
})

export const camera = { x: 0, y: 0 }

export const cameraMoveEvent = flag(camera)

export const moveCamera = effects(camera, ({x, y}) => {
    camera.x = x
    camera.y = y
})

on(cameraMoveEvent, () => {
    // get the x and y location
    let x = Math.floor(camera.x - window.innerWidth / 2)
    let y = Math.floor(camera.y - window.innerHeight / 2)

    // move the hit box so its still in the front
    app.stage.hitArea.x = x
    app.stage.hitArea.y = y

    // move arond the graphics
    app.stage.x = -x
    app.stage.y = -y
})

app.ticker.start()

// resize the canvas whene the screen resizes
window.onresize = () => effects(camera, () => {
    app.renderer.resize( window.innerWidth, window.innerHeight )

    app.stage.hitArea.width  = window.innerWidth
    app.stage.hitArea.height = window.innerHeight
})

// make the stage interactive so that these events actually will be called
app.stage.hitArea = new PIXI.Rectangle(0,0,window.innerWidth, window.innerHeight)
app.stage.interactive = true