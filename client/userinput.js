import { Event, fire } from "./lib/eventmonger"

// list of which keys are down
const keysDown = new Set()

// keyboard events
export const keyDown = Event()
export const keyUp   = Event()

window.addEventListener("keydown", event => {
    keysDown.add(event.keyCode)

    fire(keyDown, event.keyCode)
})

window.addEventListener("keyup", event => {
    keysDown.delete(event.keyCode)

    fire(keyUp, event.keyCode)
})

export const isDown = (key) => keysDown.has(key)