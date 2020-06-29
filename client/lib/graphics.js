import * as PIXI from 'pixi.js'

// create a pixi application
export const app = new PIXI.Application({
    width:  window.innerWidth,
    height: window.innerHeight,
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

        let x = Math.floor(cameraX - window.innerWidth / 2)
        let y = Math.floor(cameraY - window.innerHeight / 2)

        // move the hit box so its still in the front
        app.stage.hitArea.x = x
        app.stage.hitArea.y = y

        // move arond the graphics
        app.stage.x = -x
        app.stage.y = -y
    }
})

app.ticker.start()

// resize the canvas whene the screen resizes
window.onresize = () => {
    app.renderer.resize( window.innerWidth, window.innerHeight )

    app.stage.hitArea.width  = window.innerWidth
    app.stage.hitArea.height = window.innerHeight

    // weve resised, so we may need to adjust the camera
    cameraDirty = true
}

// make the stage interactive so that these events actually will be called
app.stage.interactive = true
app.stage.hitArea = new PIXI.Rectangle(0,0,window.innerWidth, window.innerHeight)