const Number = {
    add: (a, b) => a + b,
    eq:  (a, b) => a == b
}

const Vector = {
    add: ({x0, y0}, {x1, y1}) => ({x: x0 + x1, y: y0 + y1}),
    sub: ({x0, y0}, {x1, y1}) => ({x: x0 - x1, y: y0 - y1}),
    eq:  ({x0, y0}, {x1, y1}) => x0 == x1 && y0 == y1,
}

const Aspect = (name, type, update) => ({name, type, update})

// aspects

export const health = Aspect("hp" , Number, (player, hp) => {
    hp = Math.min(hp, player.maxhp)

    // were out of health, and therefore dead
    // if (hp <= 0) removePlayer(player)

    return hp
})

export const mana = Aspect("mp" , Number, (player, mp) => Math.min(mp, player.maxmp))


export const position = Aspect("position" , Vector, (player, movement) => {
    let target = Vector.add(player.position, movement)

    if ( isEmptyPosition( target ) ) return target
})

// effects

export const effects = new Map()

const Effect = (name, apply) => effects.set(name, {name, apply})

Effect("damage" , (player, value)  => [[health, value]])
Effect("move"   , (player, target) => [[position, Vector.sub(target, player.position)]])