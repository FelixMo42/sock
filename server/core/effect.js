const effects = new Map()

export const Effect = (name, apply) => effects.set(name, {name, apply})

export const applyEffect = (effect, value, target, changes) => {
    effects.get(effect).apply(target, value).forEach(change => applyChange(target, change, changes))
}

export const applyChange = (target, [aspect, value], changes) => {
    if ( !changes.has(target) ) changes.set(target, new Map())

    let change = changes.get( target )

    change.set(aspect, aspect.type.add(value, change.has(aspect) ? change.get(aspect) : target[aspect.name]))
}