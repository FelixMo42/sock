import { Application, Rectangle } from 'pixi.js'
import { Event, fire } from "eventmonger"

export const canvasResized = Event()

// create a pixi application
export const app = new Application({
    width:  window.innerWidth,
    height: window.innerHeight,
})

app.ticker.start()

// resize the canvas whene the screen resizes
window.onresize = () => effects(camera, () => {
    app.renderer.resize( window.innerWidth, window.innerHeight )

    app.stage.hitArea.width  = window.innerWidth
    app.stage.hitArea.height = window.innerHeight

    fire(canvasResized)
})

// make the stage interactive so that these events actually will be called
app.stage.hitArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
app.stage.interactive = true