const path = (elms, stroke="black", fill="transparent") => `<path d="${elms.join(" ")}" stroke="${stroke}" fill="${fill}"/>`

const moveTo = (x, y) => `M ${x} ${y}`

const bezierCurveTo = (x1, y1, x2, y2, x3, y3) => `C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`

function svgToTexture(svg) {
    let blob = new Blob([svg], {type: 'image/svg+xml'})

    let url = URL.createObjectURL(blob)
    
    return PIXI.Texture.from(url)
}

function drawSvg(svg) {
    console.log(svg)
    let sprite = new PIXI.Sprite( svgToTexture(svg) )
    
    app.stage.addChild(sprite)
}