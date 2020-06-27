import * as PIXI from 'pixi.js'

// create a pixi application
export const app = new PIXI.Application({
    width:  window.innerWidth,
    height: window.innerHeight
})

export let cameraX = 0
export let cameraY = 0

let cameraDirty = false

export const offset = (x, y) => {
    cameraX = x
    cameraY = y

    cameraDirty = true
}

app.ticker.add(dt => {
    // we only need to move stuff if the camera is dirty
    if ( cameraDirty ) {
        // camera is no longer dirty
        cameraDirty = false

        // move the hit box so its still in the front
        app.stage.hitArea.x = cameraX
        app.stage.hitArea.y = cameraY

        // move arond the graphics
        app.stage.x = -cameraX
        app.stage.y = -cameraY
    }
})

app.ticker.start()

// resize the canvas whene the screen resizes
window.onresize = () => {
    app.renderer.resize( window.innerWidth, window.innerHeight )

    app.stage.hitArea.width  = window.innerWidth
    app.stage.hitArea.height = window.innerHeight
}

// make the stage interactive so that these events actually will be called
app.stage.interactive = true
app.stage.hitArea = new PIXI.Rectangle(0,0,window.innerWidth, window.innerHeight)