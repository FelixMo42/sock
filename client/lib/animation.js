const date = new Date()

const sprites = new Set()

const addSprite = sprite => {
    sprites.add(sprite)
    return sprite
}

const deleteSprite = sprite => {
    sprites.delete(sprite)
    return sprite
}

const drawSprites = () => sprites.forEach(sprite => sprite.draw(sprite))

const animations = new Set()

const addAnimation = animation => {
    animations.add(animation)
    return animation
}

const animate = () => animations.forEach(animation => {
    if ( animation() ) {
        animations.delete(animation)
    }
})

const goto = (sprite, target, time) => {
    let start = date.getTime()

    let position = {
        x: sprite.x,
        y: sprite.y
    }

    let offset = {
        x: target.x - sprite.x,
        y: target.y - sprite.y,
    }

    return () => {
        let percent = Math.max(date.getTime() - start, time) / time

        sprite.x = position.x + offset.x * percent
        sprite.y = position.y + offset.y * percent
    }
}