import { Event, fire } from 'eventmonger'
import { app } from './graphics'

export const mousePos = { x: 0, y: 0 }

export let leftDown   = false
export let rightDown  = false
export let centerDown = false

export const mouseMoved   = Event()
export const mouseUp      = Event()
export const mouseDown    = Event()
export const mouseClicked = Event()

app.stage.on("mousemove", event => {
    mousePos.x = event.data.global.x - app.stage.x
    mousePos.y = event.data.global.y - app.stage.y

    fire(mouseMoved, mousePos)
})

app.stage.on("mousedown", event => {
    let button = event.button

    if ( button == LEFT   ) leftDown   = true
    if ( button == RIGHT  ) rightDown  = true
    if ( button == CENTER ) centerDown = true
    
    fire(mouseDown, button)
})

app.stage.on("mouseup", event => {
    let button = event.button

    if ( button == LEFT   ) leftDown   = false
    if ( button == RIGHT  ) rightDown  = false
    if ( button == CENTER ) centerDown = false

    fire(mouseUp, button)
})

app.stage.on("mouseclicked", event => fire(mouseClicked, event.button))

export const LEFT   = 0
export const RIGHT  = 1
export const CENTER = 2