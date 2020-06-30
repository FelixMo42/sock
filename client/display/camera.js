import { on } from 'eventmonger'
import { flag, effect, effects } from '../lib/dirty'
import { app, canvasResized } from "./display"

export const camera = { x: 0, y: 0 }

export const cameraMoved = flag(camera)

export const moveCamera = effects(camera, ({x, y}) => {
    camera.x = x
    camera.y = y
})

on(canvasResized, () => effect(camera))

on(cameraMoved, () => {
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