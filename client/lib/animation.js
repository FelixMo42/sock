const getTime = () => (new Date()).getTime()

const sprites = new Map()

const addSprite = (id, sprite) => sprites.set(id, sprite)

const removeSprite = id => sprites.delete(id)

const drawSprites = () => sprites.forEach(sprite => sprite.draw(sprite))

const animations = new Set()

const addAnimation = animation => animations.add(animation)

const animate = () => animations.forEach(animation => {
    if ( animation() ) {
        animations.delete(animation)
    }
})

const goto = (id, target, time) => {
    let sprite = sprites.get(id)

    let start = getTime()

    let position = {
        x: sprite.x,
        y: sprite.y
    }

    let offset = {
        x: target.x - sprite.x,
        y: target.y - sprite.y,
    }

    addAnimation(() => {
        let percent = Math.min(getTime() - start, time) / time

        sprite.x = position.x + offset.x * percent
        sprite.y = position.y + offset.y * percent

        if (percent == 1) return true
    })
}