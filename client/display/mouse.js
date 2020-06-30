import { Event, fire, on } from 'eventmonger'
import { app } from './display'
import { cameraMoved } from "./camera"

export let leftDown   = false
export let rightDown  = false
export let centerDown = false

export const mousePos = { x: 0, y: 0 }

export const mouseMoved   = Event()
export const mouseUp      = Event()
export const mouseDown    = Event()
export const mouseClicked = Event()

const updateMousePosition = () => {
    mousePos.x = app.renderer.plugins.interaction.mouse.global.x - app.stage.x
    mousePos.y = app.renderer.plugins.interaction.mouse.global.y - app.stage.y

    fire(mouseMoved, mousePos)
}

const setButtonState = (button, state) => {
    if ( button == LEFT   ) leftDown   = state
    if ( button == RIGHT  ) rightDown  = state
    if ( button == CENTER ) centerDown = state
}

on(cameraMoved, updateMousePosition)

app.stage.on("mousemove", updateMousePosition)

app.stage.on("mousedown", event => {
    updateMousePosition()

    setButtonState(event.button, true)
    
    fire(mouseDown, event.button)
})

app.stage.on("mouseup", event => {
    updateMousePosition()

    setButtonState(event.button, false)

    fire(mouseUp, event.button)
})

app.stage.on("mouseclicked", event => fire(mouseClicked, event.button))

export const LEFT   = 0
export const RIGHT  = 1
export const CENTER = 2